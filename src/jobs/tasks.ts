import type { Payload, TaskConfig } from 'payload'

import { chunkText, embedText } from '@/lib/ai/embed'
import { CRM_LABEL, createLead, crmProvider } from '@/lib/integrations/crm'
import { buildEvent, calendarConfigured, createEvent, refreshTokens } from '@/lib/integrations/graph'
import { sendEmail } from '@/lib/integrations/ses'
import { sendTemplate } from '@/lib/integrations/whatsapp'

/** Every outbound call runs here with retries, so an outage at PropFlo or WhatsApp never loses a lead. */
const retries = { attempts: 5, backoff: { type: 'exponential' as const, delay: 60_000 } }

const asId = (v: unknown): string => (v && typeof v === 'object' && 'id' in v ? String((v as { id: unknown }).id) : String(v ?? ''))

async function getEnquiry(payload: Payload, id: string) {
  const enquiry = await payload.findByID({ collection: 'enquiries', id, depth: 1, overrideAccess: true })
  const customer = typeof enquiry.customer === 'object' ? enquiry.customer : await payload.findByID({ collection: 'customers', id: asId(enquiry.customer), overrideAccess: true })
  const project = enquiry.project && typeof enquiry.project === 'object' ? enquiry.project : null
  return { enquiry, customer, project }
}

/**
 * Writes only the given top-level fields of an enquiry. The three jobs queued for a new enquiry run in parallel,
 * and payload.update() rewrites the whole document from a copy read a moment earlier, so two jobs finishing
 * together lost each other's result (the WhatsApp status stayed "pending"). A $set-style write has no such window.
 */
async function patchEnquiry(payload: Payload, id: number | string, data: Record<string, unknown>) {
  await payload.db.updateOne({ collection: 'enquiries', id, data, returning: false })
}

export const indexDocument: TaskConfig<'indexDocument'> = {
  slug: 'indexDocument',
  retries: { attempts: 3, backoff: { type: 'fixed', delay: 30_000 } },
  inputSchema: [{ name: 'documentId', type: 'text', required: true }],
  handler: async ({ input, req }) => {
    const payload = req.payload
    const doc = await payload.findByID({ collection: 'documents', id: input.documentId, depth: 0, overrideAccess: true })
    // Remove whatever was indexed before; approval can be withdrawn and text can change.
    await payload.delete({ collection: 'document-chunks', where: { document: { equals: doc.id } }, overrideAccess: true })
    if (!doc.approved) {
      await payload.update({ collection: 'documents', id: doc.id, data: { indexStatus: 'not-approved', chunkCount: 0 }, overrideAccess: true })
      return { output: { chunks: 0 } }
    }
    const chunks = chunkText(doc.extractedText || '')
    if (!chunks.length) {
      await payload.update({ collection: 'documents', id: doc.id, data: { indexStatus: 'failed', chunkCount: 0, indexError: 'No extracted text to index' }, overrideAccess: true })
      return { output: { chunks: 0 } }
    }
    try {
      let i = 0
      for (const text of chunks) {
        const embedding = await embedText(text)
        await payload.create({
          collection: 'document-chunks',
          overrideAccess: true,
          data: { document: doc.id, title: doc.title, business: doc.business || 'group', project: asId(doc.project) || undefined, chunkIndex: i++, text, embedding },
        })
      }
      await payload.update({ collection: 'documents', id: doc.id, data: { indexStatus: 'indexed', chunkCount: chunks.length, indexError: '' }, overrideAccess: true })
      return { output: { chunks: chunks.length } }
    } catch (err) {
      await payload.update({ collection: 'documents', id: doc.id, data: { indexStatus: 'failed', indexError: String(err).slice(0, 300) }, overrideAccess: true })
      throw err
    }
  },
}

/** Pushes the enquiry to the configured CRM (PropFlo, or HubSpot on staging) and keeps the contact ID on the customer. */
export const crmSync: TaskConfig<'crmSync'> = {
  slug: 'crmSync',
  retries,
  inputSchema: [{ name: 'enquiryId', type: 'text', required: true }],
  handler: async ({ input, req }) => {
    const payload = req.payload
    const { enquiry, customer, project } = await getEnquiry(payload, input.enquiryId)
    const provider = crmProvider()
    if (!provider) {
      await patchEnquiry(payload, enquiry.id, { crm: { ...enquiry.crm, syncStatus: 'skipped', lastError: 'No CRM configured (PROPFLO_API_URL + PROPFLO_API_KEY, or HUBSPOT_ACCESS_TOKEN)' } })
      return { output: { leadId: '' } }
    }
    try {
      const { id, contactId } = await createLead({
        name: customer.name,
        mobile: customer.phone,
        email: customer.email,
        project: project?.name,
        enquiryType: enquiry.type,
        purpose: enquiry.purpose,
        budgetBand: enquiry.budgetBand,
        timeline: enquiry.timeline,
        source: enquiry.source?.channel || 'website',
        utm: enquiry.source || undefined,
        message: enquiry.message,
        score: enquiry.score,
        band: enquiry.band,
        websiteEnquiryId: String(enquiry.id),
      })
      await patchEnquiry(payload, enquiry.id, { crm: { provider: CRM_LABEL[provider], leadId: id, syncStatus: 'synced', syncedAt: new Date().toISOString(), lastError: '' } })
      // The CRM's contact record, kept on the customer so later enquiries attach to the same person.
      if (contactId && customer.crmContactId !== contactId) {
        await payload.update({ collection: 'customers', id: customer.id, data: { crmContactId: contactId }, overrideAccess: true })
      }
      return { output: { leadId: id } }
    } catch (err) {
      await patchEnquiry(payload, enquiry.id, { crm: { ...enquiry.crm, syncStatus: 'failed', lastError: String(err).slice(0, 300) } })
      throw err
    }
  },
}

/**
 * Books a confirmed scheduler request on the consultant's connected Outlook calendar. Runs once the visitor has
 * verified their number; skipped (never failed) when the calendar is not configured or not connected.
 */
export const calendarBook: TaskConfig<'calendarBook'> = {
  slug: 'calendarBook',
  retries,
  inputSchema: [{ name: 'enquiryId', type: 'text', required: true }],
  handler: async ({ input, req }) => {
    const payload = req.payload
    const { enquiry, customer, project } = await getEnquiry(payload, input.enquiryId)
    const m = enquiry.meeting
    if (!m?.date || !m.time) return { output: { eventId: '' } }
    const skip = async (why: string) => {
      await patchEnquiry(payload, enquiry.id, { meeting: { ...m, calendarStatus: 'skipped', lastError: why } })
      return { output: { eventId: '' } }
    }
    if (!calendarConfigured()) return skip('Microsoft calendar not configured (MS_CLIENT_ID, MS_CLIENT_SECRET)')
    const consultantId = enquiry.consultant ? asId(enquiry.consultant) : ''
    if (!consultantId) return skip('No consultant chosen for the meeting')
    const consultant = await payload.findByID({ collection: 'consultants', id: consultantId, depth: 0, overrideAccess: true })
    const refresh = consultant.calendar?.refreshToken
    if (!refresh) return skip(`${consultant.name} has not connected an Outlook calendar`)
    try {
      const tokens = await refreshTokens(refresh)
      if (tokens.refresh_token && tokens.refresh_token !== refresh) {
        await payload.update({ collection: 'consultants', id: consultant.id, data: { calendar: { ...consultant.calendar, refreshToken: tokens.refresh_token } }, overrideAccess: true })
      }
      const minutes = Number(process.env.MEETING_MINUTES) || 45
      const online = /video|online|teams/i.test(m.mode || '')
      const subject = `SDG consultation: ${customer.name || customer.phone}${project ? ` · ${project.name}` : ''}`
      const bodyText = [
        `${customer.name || 'A visitor'} requested a ${m.mode || 'meeting'} through the SDG website.`,
        `Phone: ${customer.phone}${customer.email ? `\nEmail: ${customer.email}` : ''}`,
        project ? `Project: ${project.name}` : '',
        enquiry.message ? `Notes: ${enquiry.message}` : '',
        `Lead score: ${enquiry.score ?? '-'} (${enquiry.band || '-'})`,
        `Enquiry ${enquiry.id} in the SDG admin.`,
      ].filter(Boolean).join('\n')
      const event = await createEvent(tokens.access_token, buildEvent({
        subject, bodyText, date: m.date, time: m.time, minutes, online,
        location: m.mode || undefined,
        attendees: customer.email ? [{ email: customer.email, name: customer.name }] : [],
      }))
      await patchEnquiry(payload, enquiry.id, { meeting: { ...m, calendarStatus: 'booked', eventId: event.id, eventLink: event.webLink || '', joinUrl: event.joinUrl || '', bookedAt: new Date().toISOString(), lastError: '' } })
      return { output: { eventId: event.id } }
    } catch (err) {
      await patchEnquiry(payload, enquiry.id, { meeting: { ...m, calendarStatus: 'failed', lastError: String(err).slice(0, 300) } })
      throw err
    }
  },
}

export const whatsappSend: TaskConfig<'whatsappSend'> = {
  slug: 'whatsappSend',
  retries,
  inputSchema: [
    { name: 'enquiryId', type: 'text', required: true },
    { name: 'template', type: 'text', required: true },
  ],
  handler: async ({ input, req }) => {
    const payload = req.payload
    const { enquiry, customer, project } = await getEnquiry(payload, input.enquiryId)
    const res = await sendTemplate({
      to: customer.phone,
      template: input.template,
      bodyParams: [{ type: 'text', text: customer.name || 'there' }, { type: 'text', text: project?.name || 'SDG' }],
    })
    await patchEnquiry(payload, enquiry.id, { acknowledgement: { whatsappStatus: res.mock ? 'skipped' : 'sent', whatsappAt: new Date().toISOString() } })
    return { output: { sent: !res.mock } }
  },
}

export const emailSend: TaskConfig<'emailSend'> = {
  slug: 'emailSend',
  retries,
  inputSchema: [
    { name: 'to', type: 'text', required: true },
    { name: 'subject', type: 'text', required: true },
    { name: 'text', type: 'textarea', required: true },
  ],
  handler: async ({ input }) => {
    if (!input.to) return { output: { sent: false } }
    const res = await sendEmail({ to: input.to, subject: input.subject, text: input.text })
    return { output: { sent: !res.mock } }
  },
}

/** Consultant allocation by business, enquiry type, project, location and lightest recent load (Q49). */
export const consultantAllocate: TaskConfig<'consultantAllocate'> = {
  slug: 'consultantAllocate',
  retries: { attempts: 3, backoff: { type: 'fixed', delay: 30_000 } },
  inputSchema: [{ name: 'enquiryId', type: 'text', required: true }],
  handler: async ({ input, req }) => {
    const payload = req.payload
    const { enquiry, customer, project } = await getEnquiry(payload, input.enquiryId)
    if (enquiry.consultant) return { output: { consultantId: asId(enquiry.consultant) } }
    const { docs: consultants } = await payload.find({
      collection: 'consultants',
      overrideAccess: true,
      depth: 0,
      limit: 100,
      where: { and: [{ active: { equals: true } }, { businesses: { contains: enquiry.business } }] },
    })
    if (!consultants.length) return { output: { consultantId: '' } }

    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    const loc = (enquiry.preferredLocation || project?.location || '').toLowerCase()
    const scored = await Promise.all(
      consultants.map(async (c) => {
        let fit = 0
        if (c.enquiryTypes?.includes(enquiry.type as never)) fit += 3
        if (project && (c.projects || []).map(asId).includes(String(project.id))) fit += 3
        if (loc && (c.locations || []).some((l) => loc.includes(l.name.toLowerCase()))) fit += 2
        const load = await payload.count({ collection: 'enquiries', overrideAccess: true, where: { and: [{ consultant: { equals: c.id } }, { createdAt: { greater_than: since } }] } })
        return { c, key: fit * 1000 - load.totalDocs }
      }),
    )
    scored.sort((a, b) => b.key - a.key)
    const chosen = scored[0].c
    await patchEnquiry(payload, enquiry.id, { consultant: chosen.id })
    await payload.jobs.queue({
      task: 'emailSend',
      input: {
        to: chosen.email,
        subject: `New ${enquiry.band || ''} enquiry: ${project?.name || enquiry.business}`,
        text: `${customer.name || 'A visitor'} (${customer.phone}) enquired about ${project?.name || enquiry.business}. Score ${enquiry.score} (${enquiry.band}). Timeline: ${enquiry.timeline || 'not given'}. Budget: ${enquiry.budgetBand || 'not given'}.\n\nOpen the admin to pick it up.`,
      },
    })
    return { output: { consultantId: String(chosen.id) } }
  },
}

export const notifyConsultant: TaskConfig<'notifyConsultant'> = {
  slug: 'notifyConsultant',
  retries,
  inputSchema: [{ name: 'chatLogId', type: 'text', required: true }],
  handler: async ({ input, req }) => {
    const payload = req.payload
    const log = await payload.findByID({ collection: 'chat-logs', id: input.chatLogId, depth: 0, overrideAccess: true })
    const { docs: consultants } = await payload.find({
      collection: 'consultants',
      overrideAccess: true,
      depth: 0,
      limit: 20,
      where: { and: [{ active: { equals: true } }, { businesses: { contains: log.business === 'group' ? 'construction' : log.business || 'construction' } }] },
    })
    const to = consultants.map((c) => c.email).filter(Boolean)
    const transcript = (log.messages || []).slice(-6).map((m) => `${m.role}: ${m.content}`).join('\n')
    if (to.length) {
      await sendEmail({ to, subject: `Assistant hand-off (${log.handoffReason || 'visitor request'})`, text: `A website visitor needs a consultant.\n\n${transcript}\n\nOpen the admin → Chat logs → ${log.sessionId}` })
    }
    await payload.update({ collection: 'chat-logs', id: log.id, data: { consultantNotified: true }, overrideAccess: true })
    return { output: { notified: to.length } }
  },
}

/** Retention: delete chat logs older than the configured number of days (SOW data-protection line). */
export const retentionSweep: TaskConfig<'retentionSweep'> = {
  slug: 'retentionSweep',
  retries: 1,
  handler: async ({ req }) => {
    const payload = req.payload
    const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
    const days = settings.ai?.retentionDays || 365
    const before = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
    const res = await payload.delete({ collection: 'chat-logs', overrideAccess: true, where: { updatedAt: { less_than: before } } })
    return { output: { deleted: res.docs.length } }
  },
}

export const tasks = [indexDocument, crmSync, calendarBook, whatsappSend, emailSend, consultantAllocate, notifyConsultant, retentionSweep]
