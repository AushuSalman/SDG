import type { Payload } from 'payload'

import { runQueueSoon } from '@/lib/queue'

import { draftAnswer } from './answer'
import { estimateTokens, type ChatTurn } from './bedrock'
import { classify } from './classify'
import { retrieveFaqs } from './faqs'
import { postCheck } from './postcheck'
import { retrieveChunks } from './retrieve'

export type ChatRequest = {
  sessionId: string
  message: string
  history?: ChatTurn[]
  page?: string
  business?: 'construction' | 'paper' | 'glass'
  projectSlug?: string
  /** When set, the answer is grounded in this one approved document (the summariser) instead of a search. */
  documentId?: string
}

async function documentChunks(payload: Payload, documentId: string) {
  const { docs } = await payload.find({ collection: 'document-chunks', overrideAccess: true, where: { document: { equals: documentId } }, sort: 'chunkIndex', limit: 12, depth: 0 })
  return docs.map((d) => ({ text: d.text, title: d.title || '', documentId: String(typeof d.document === 'object' && d.document ? d.document.id : d.document), score: 1 }))
}

export type ChatResponse = {
  kind: 'handoff' | 'answer' | 'limit' | 'disabled'
  text: string
  category?: string
  sources: { title: string; documentId: string }[]
  facts?: string[]
  language: string
}

const monthKey = () => new Date().toISOString().slice(0, 7)

async function recordUsage(payload: Payload, tokens: number, cap: number): Promise<{ overCap: boolean; total: number }> {
  const { docs } = await payload.find({ collection: 'ai-usage', overrideAccess: true, where: { month: { equals: monthKey() } }, limit: 1 })
  const total = (docs[0]?.tokens || 0) + tokens
  if (docs[0]) await payload.update({ collection: 'ai-usage', id: docs[0].id, overrideAccess: true, data: { tokens: total } })
  else await payload.create({ collection: 'ai-usage', overrideAccess: true, data: { month: monthKey(), tokens: total } })
  return { overCap: cap > 0 && total > cap, total }
}

/** Classify → hand off, or retrieve → draft → post-check. Every turn is logged for authorised roles. */
export async function runChat(payload: Payload, req: ChatRequest): Promise<ChatResponse> {
  const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
  const ai = settings.ai || {}
  if (ai.enabled === false) {
    return { kind: 'disabled', text: 'The assistant is resting. Our consultants are available on the contact page.', sources: [], language: 'en' }
  }

  const { docs: logs } = await payload.find({
    collection: 'chat-logs',
    overrideAccess: true,
    where: { sessionId: { equals: req.sessionId } },
    limit: 1,
  })
  const log = logs[0]
  const turns = (log?.messages || []).filter((m) => m.role === 'user').length
  if (turns >= (ai.sessionTurnCap || 20)) {
    return { kind: 'limit', text: 'We have covered a lot. Let me connect you to an SDG consultant for the rest.', sources: [], language: 'en' }
  }

  const cls = await classify(req.message)
  const business = req.business || cls.business
  let project: { id: string; name: string; pricing?: { from?: number | null; to?: number | null; note?: string | null } } | undefined
  if (req.projectSlug) {
    const { docs } = await payload.find({ collection: 'projects', overrideAccess: true, where: { slug: { equals: req.projectSlug } }, limit: 1, depth: 0 })
    if (docs[0]) project = { id: String(docs[0].id), name: docs[0].name, pricing: docs[0].pricing || undefined }
  }

  let response: ChatResponse
  let tokens = estimateTokens(req.message)
  let model = 'rules'
  let flags: string[] = []

  // Published FAQs are the quickest approved source; a restricted FAQ match means "a consultant answers this".
  const faqs = req.documentId ? [] : await retrieveFaqs(payload, { query: req.message, business, projectId: project?.id })
  const restrictedFaq = !cls.restricted && faqs[0]?.restricted ? faqs[0] : undefined

  if (cls.restricted || restrictedFaq) {
    const facts: string[] = []
    // Approved indicative information may be shared (Q20): the structured range from the project record.
    if (project?.pricing?.from && project.pricing.to && cls.category === 'pricing') {
      facts.push(`${project.name}: approved indicative range ₹${project.pricing.from} to ₹${project.pricing.to} lakh. ${project.pricing.note || ''}`.trim())
    }
    response = {
      kind: 'handoff',
      text: ai.handoffMessage || 'An SDG consultant will confirm that directly. I can arrange a call or a site visit now.',
      category: cls.category || (restrictedFaq ? 'restricted-faq' : undefined),
      sources: [],
      facts,
      language: cls.language,
    }
  } else {
    const faqChunks = faqs.filter((f) => !f.restricted).map((f) => ({ text: f.answer, title: `FAQ: ${f.question}`, documentId: `faq:${f.id}`, score: f.score + 0.5 }))
    const docChunks = req.documentId
      ? await documentChunks(payload, req.documentId)
      : await retrieveChunks(payload, { query: req.message, business, projectId: project?.id })
    const chunks = [...faqChunks, ...docChunks].sort((a, b) => b.score - a.score).slice(0, 6)
    const draft = await draftAnswer({ question: req.message, history: req.history || [], chunks, language: cls.language })
    const checked = postCheck(draft.text)
    model = draft.model
    tokens += draft.tokens
    flags = checked.flags
    const seen = new Set<string>()
    const sources = chunks
      .filter((c) => (seen.has(c.documentId) ? false : (seen.add(c.documentId), true)))
      .map((c) => ({ title: c.title, documentId: c.documentId }))
    response = { kind: 'answer', text: checked.text, sources, language: cls.language }
  }

  const usage = await recordUsage(payload, tokens, ai.monthlyTokenCap || 0)
  if (usage.overCap) {
    await payload.jobs.queue({ task: 'emailSend', input: { to: process.env.ALERT_EMAIL || settings.email || '', subject: 'SDG assistant: monthly token cap reached', text: `Tokens this month: ${usage.total}. Cap: ${ai.monthlyTokenCap}.` } })
    runQueueSoon(payload)
  }

  const newMessages = [
    { role: 'user' as const, content: req.message, restricted: cls.restricted || Boolean(restrictedFaq), category: response.category, model: 'rules' },
    {
      role: 'assistant' as const,
      content: response.text,
      restricted: cls.restricted || Boolean(restrictedFaq),
      category: response.category,
      model,
      sources: response.sources,
      flags: flags.map((flag) => ({ flag })),
    },
  ]
  const handoffNow = cls.restricted || Boolean(restrictedFaq) || cls.intent === 'contact' || cls.intent === 'visit'
  if (log) {
    await payload.update({
      collection: 'chat-logs',
      id: log.id,
      overrideAccess: true,
      data: {
        messages: [...(log.messages || []), ...newMessages],
        handoff: log.handoff || handoffNow,
        handoffReason: log.handoffReason || (handoffNow ? response.category || cls.intent : undefined),
        business: business || log.business,
        language: cls.language,
      },
    })
    if (handoffNow && !log.consultantNotified) {
      await payload.jobs.queue({ task: 'notifyConsultant', input: { chatLogId: String(log.id) } })
      runQueueSoon(payload)
    }
  } else {
    const created = await payload.create({
      collection: 'chat-logs',
      overrideAccess: true,
      data: {
        sessionId: req.sessionId,
        page: req.page,
        business: business || 'group',
        language: cls.language,
        messages: newMessages,
        handoff: handoffNow,
        handoffReason: handoffNow ? response.category || cls.intent : undefined,
      },
    })
    if (handoffNow) {
      await payload.jobs.queue({ task: 'notifyConsultant', input: { chatLogId: String(created.id) } })
      runQueueSoon(payload)
    }
  }

  return response
}
