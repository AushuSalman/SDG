import type { Payload, Where } from 'payload'

import { mockKeywordScore } from './embed'

export type FaqHit = { id: string; question: string; answer: string; restricted: boolean; score: number }

/** A question whose words largely appear in a published FAQ is a hit; the FAQ's own question weighs most. */
const MIN_SCORE = 0.5

/**
 * Published FAQs for the visitor's business or project, ranked by how much of the question they cover.
 * FAQs are short, so word overlap works in both mock and live mode; restricted ones are returned flagged so the
 * caller can hand off instead of answering.
 */
export async function retrieveFaqs(
  payload: Payload,
  opts: { query: string; business?: string; projectId?: string; k?: number },
): Promise<FaqHit[]> {
  const scope: Where[] = []
  if (opts.business) scope.push({ business: { in: [opts.business, 'group'] } })
  if (opts.projectId) scope.push({ project: { equals: opts.projectId } })
  const where: Where = { and: [{ _status: { equals: 'published' } }, ...(scope.length ? [{ or: scope }] : [])] }
  const { docs } = await payload.find({ collection: 'faqs', overrideAccess: true, depth: 0, limit: 300, pagination: false, where })
  return docs
    .map((f) => {
      const projectOf = typeof f.project === 'object' && f.project ? String(f.project.id) : f.project ? String(f.project) : ''
      const score = mockKeywordScore(opts.query, f.question) + 0.5 * mockKeywordScore(opts.query, f.answer) + (opts.projectId && projectOf === opts.projectId ? 0.15 : 0)
      return { id: String(f.id), question: f.question, answer: f.answer, restricted: Boolean(f.restricted), score }
    })
    .filter((h) => h.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.k ?? 3)
}
