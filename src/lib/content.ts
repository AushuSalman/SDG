import type { Where } from 'payload'
import { cache } from 'react'

import type { Consultant, Document, Fact, Faq, Job, Leader, Partner, Post, Project, SiteCopy, Testimonial } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Data loaders for the public site. Only published or approved content is ever returned. */
/** Cached per request: the layout, its metadata and most pages all read the settings. */
export const getSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
})

/** The paragraphs on the content pages (Website → Website copy), cached per request like the settings. */
export const getSiteCopy = cache(async (): Promise<SiteCopy> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-copy', overrideAccess: true })
})

/** Splits a textarea into paragraphs (blank line) or list items (one per line). */
export const paragraphs = (text: string | null | undefined): string[] => (text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
export const lines = (text: string | null | undefined): string[] => (text || '').split(/\n/).map((l) => l.trim()).filter(Boolean)

/** Media relations that are populated (depth ≥ 1), in the order they were saved. */
export const mediaList = (items: unknown): { id: string; src: string; alt: string }[] =>
  (Array.isArray(items) ? items : [])
    .map((m) => (m && typeof m === 'object' ? (m as { id?: string | number; url?: string | null; alt?: string | null; sizes?: Record<string, { url?: string | null }> }) : null))
    .filter((m): m is NonNullable<typeof m> => Boolean(m?.url))
    .map((m) => ({ id: String(m.id), src: m.sizes?.card?.url || m.url || '', alt: m.alt || '' }))

export async function getProjects(opts: { business?: string; status?: string; category?: string; limit?: number } = {}): Promise<Project[]> {
  const payload = await getPayloadClient()
  const and: Where[] = [{ _status: { equals: 'published' } }]
  if (opts.business) and.push({ business: { equals: opts.business } })
  if (opts.status) and.push({ status: { equals: opts.status } })
  if (opts.category) and.push({ category: { equals: opts.category } })
  const res = await payload.find({ collection: 'projects', where: { and }, sort: 'order', limit: opts.limit || 24, depth: 1, overrideAccess: false })
  return res.docs
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'projects', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 1, overrideAccess: false })
  return res.docs[0] || null
}

export async function getFacts(opts: { category?: string; business?: string; homeOnly?: boolean } = {}): Promise<Fact[]> {
  const payload = await getPayloadClient()
  const and: Where[] = [{ status: { equals: 'approved' } }]
  if (opts.category) and.push({ category: { equals: opts.category } })
  if (opts.business) and.push({ business: { in: [opts.business, 'group'] } })
  if (opts.homeOnly) and.push({ showOnHome: { equals: true } })
  const res = await payload.find({ collection: 'facts', where: { and }, sort: 'order', limit: 100, overrideAccess: false })
  return res.docs
}

/** FAQs for a project, or for a business; `generalOnly` leaves out the ones that belong to a project. */
export async function getFaqs(opts: { business?: string; projectId?: string; generalOnly?: boolean } = {}): Promise<Faq[]> {
  const payload = await getPayloadClient()
  const and: Where[] = [{ _status: { equals: 'published' } }]
  if (opts.projectId) and.push({ project: { equals: opts.projectId } })
  else if (opts.business) {
    and.push({ business: { equals: opts.business } })
    if (opts.generalOnly) and.push({ project: { exists: false } })
  }
  const res = await payload.find({ collection: 'faqs', where: { and }, sort: 'order', limit: 50, overrideAccess: false })
  return res.docs
}

export async function getTestimonials(limit = 3): Promise<Testimonial[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'testimonials', where: { approved: { equals: true } }, sort: 'order', limit, overrideAccess: false })
  return res.docs
}

export async function getPosts(limit = 12): Promise<Post[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, sort: '-publishedAt', limit, depth: 1, overrideAccess: false })
  return res.docs
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'posts', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 1, overrideAccess: false })
  return res.docs[0] || null
}

export async function getJobs(): Promise<Job[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'jobs', where: { active: { equals: true } }, sort: 'order', limit: 50, overrideAccess: false })
  return res.docs
}

export async function getConsultants(): Promise<Consultant[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'consultants', where: { active: { equals: true } }, sort: 'name', limit: 50, depth: 0, overrideAccess: true })
  return res.docs
}

/** Approved documents only: the same set the assistant answers from. */
export async function getDocuments(): Promise<Document[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'documents', where: { approved: { equals: true } }, sort: 'title', limit: 100, depth: 1, overrideAccess: true })
  return res.docs
}

export async function getLeaders(): Promise<Leader[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'leaders', where: { active: { equals: true } }, sort: 'order', limit: 50, depth: 1, overrideAccess: false })
  return res.docs
}

/** Partners (kind "partner") for the Partnerships page; pass `kind: 'client'` for the logo strips. */
export async function getPartners(opts: { kind?: 'partner' | 'client'; business?: string } = {}): Promise<Partner[]> {
  const payload = await getPayloadClient()
  const and: Where[] = [{ active: { equals: true } }]
  // Records saved before the kind field existed are partners.
  if (opts.kind === 'client') and.push({ kind: { equals: 'client' } })
  else if (opts.kind === 'partner') and.push({ or: [{ kind: { equals: 'partner' } }, { kind: { exists: false } }] })
  if (opts.business) and.push({ business: { equals: opts.business } })
  const res = await payload.find({ collection: 'partners', where: { and }, sort: 'order', limit: 100, depth: 1, overrideAccess: false })
  return res.docs
}

/** Photo credit stored on the media record, when the photographer asked for one. */
export const mediaCredit = (m: unknown): string | null => (m && typeof m === 'object' && 'credit' in m ? (m as { credit?: string | null }).credit || null : null)

export const mediaUrl = (m: unknown, size?: 'thumb' | 'card' | 'wide'): string | null => {
  if (!m || typeof m !== 'object') return null
  const media = m as { url?: string | null; sizes?: Record<string, { url?: string | null }> }
  if (size && media.sizes?.[size]?.url) return media.sizes[size].url || null
  return media.url || null
}

const FALLBACK: Record<string, string> = { residential: '/img/residential.webp', commercial: '/img/commercial.webp' }
/** Hero image for a project, falling back to the library photo for its category. */
export const projectImage = (p: Project, size: 'thumb' | 'card' | 'wide' = 'card'): string => mediaUrl(p.heroImage, size) || FALLBACK[p.category] || '/img/upcoming.webp'

/** Indicative price band in crore, from the ₹ lakh figures on the project record. */
export const priceBand = (p: Project): string | null => {
  const { from, to } = p.pricing || {}
  if (!from || !to) return null
  const cr = (v: number) => (v / 100).toFixed(v % 100 === 0 ? 0 : 1)
  return `₹${cr(from)}–${cr(to)} Cr`
}

export const STATUS_LABEL: Record<string, string> = { ongoing: 'Ongoing', completed: 'Completed', upcoming: 'Upcoming' }
export const CATEGORY_LABEL: Record<string, string> = { residential: 'Residential', commercial: 'Commercial' }
export const BUSINESS_LABEL: Record<string, string> = { construction: 'Construction', paper: 'Paper', glass: 'Glass Recycling', agro: 'Agro Products', group: 'Group' }
