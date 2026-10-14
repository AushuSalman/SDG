import type { Where } from 'payload'

import type { Consultant, Document, Fact, Faq, Job, Post, Project, Testimonial } from '@/payload-types'

import { getPayloadClient } from './payload'

/** Data loaders for the public site. Only published or approved content is ever returned. */
export async function getSettings() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', overrideAccess: true })
}

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

export async function getFaqs(opts: { business?: string; projectId?: string } = {}): Promise<Faq[]> {
  const payload = await getPayloadClient()
  const and: Where[] = [{ _status: { equals: 'published' } }]
  if (opts.projectId) and.push({ project: { equals: opts.projectId } })
  else if (opts.business) and.push({ business: { equals: opts.business } })
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
export const BUSINESS_LABEL: Record<string, string> = { construction: 'Construction', paper: 'Paper', glass: 'Glass Recycling', group: 'Group' }
