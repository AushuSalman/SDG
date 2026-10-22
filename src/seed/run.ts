import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type Payload } from 'payload'

import { COPY } from '../globals/SiteCopy'
import config from '../payload.config'
import { type Asset, CONSULTANTS, DOCUMENTS, FACTS, PRINIA_FAQS, PROJECTS } from './data'
import { CLIENTS, COPY_ASSETS, LEADERS, NEWS, PARTNERS } from './people'

/**
 * Idempotent seed, run before every `npm run dev:local` and once on a new server:
 *   1. creates the first super admin when there are no users;
 *   2. when the database's content version is behind CONTENT_VERSION, writes the seed content: site settings,
 *      website copy, projects, facts, FAQs, consultant desks, knowledge documents, leadership, partners and
 *      clients, press coverage and their imagery (uploaded from ./assets), matching existing records by their
 *      natural key (slug, fact ID, name, title) so admin-created records are never duplicated;
 *   3. runs the indexing jobs for any document whose text changed.
 * Bump CONTENT_VERSION when the seed content changes so every environment picks it up on its next start.
 *   npm run seed            (needs DATABASE_URL and PAYLOAD_SECRET)
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD override the default admin login.
 */
export const CONTENT_VERSION = 2

const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'assets')

type Slug = Parameters<Payload['find']>[0]['collection']
type Where = NonNullable<Parameters<Payload['find']>[0]['where']>

async function main() {
  const payload = await getPayload({ config })
  const log = (m: string) => payload.logger.info(`[seed] ${m}`)
  // A real query, not the collection's estimated count: after an unclean shutdown WiredTiger's estimates lag,
  // and a seed that trusts them would try to insert duplicates.
  const countReal = async (collection: Slug) => payload.count({ collection, overrideAccess: true, where: { id: { exists: true } } })

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@sdg.local'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'
  const users = await countReal('users')
  if (users.totalDocs === 0) {
    await payload.create({ collection: 'users', overrideAccess: true, data: { email: adminEmail, password: adminPassword, name: 'SDG Super Admin', role: 'super-admin', business: 'group' } })
    log(`super admin created: ${adminEmail}`)
  }

  const settings = await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: {} })
  const current = settings.contentVersion || 0
  if (current >= CONTENT_VERSION) {
    log(`content is at version ${current}; nothing to do`)
    process.exit(0)
  }
  log(`content version ${current} → ${CONTENT_VERSION}`)

  /** Finds a record by its natural key and updates it, or creates it. */
  const upsert = async (collection: Slug, where: Where, data: Record<string, unknown>, extra: Record<string, unknown> = {}) => {
    const found = await payload.find({ collection, where, limit: 1, depth: 0, overrideAccess: true, ...(extra as object) })
    const existing = found.docs[0]
    if (existing) return payload.update({ collection, id: existing.id, data: data as never, overrideAccess: true, ...(extra as object) })
    return payload.create({ collection, data: data as never, overrideAccess: true, ...(extra as object) })
  }

  // Images are uploaded once and matched by filename afterwards, so re-running never duplicates them.
  const mediaIds = new Map<string, string>()
  const media = async (asset: Asset): Promise<string> => {
    const cached = mediaIds.get(asset.file)
    if (cached) return cached
    const filename = path.basename(asset.file)
    const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0, overrideAccess: true })
    let id = found.docs[0]?.id
    if (!id) {
      const doc = await payload.create({ collection: 'media', overrideAccess: true, filePath: path.join(ASSETS, asset.file), data: { alt: asset.alt } })
      id = doc.id
    }
    mediaIds.set(asset.file, String(id))
    return String(id)
  }
  const mediaAll = (assets: readonly Asset[] | undefined) => Promise.all((assets || []).map(media))

  // Site settings: the published contact details replace the launch placeholders, but a value staff have
  // already changed in the admin is left alone.
  const PLACEHOLDERS: Record<string, string[]> = {
    tagline: ['Three businesses. One forward vision.'],
    phone: ['+91 40 4000 1978'],
    whatsapp: ['914040001978'],
    email: ['hello@sdg.in'],
    headOffice: ['VSD Tech Park, Survey No. 142, Financial District, Nanakramguda, Hyderabad 500032'],
  }
  const NEXT: Record<string, string> = {
    tagline: 'Recycling to Realty. A promise as good as gold.',
    phone: '+91 9013 292929',
    whatsapp: '919013292929',
    email: 'info@sdg.in',
    headOffice: 'VSD Tech Park, 30 & 31 Floor (West Block), Survey No. 142, Financial District, Hyderabad – 500032',
  }
  const patch: Record<string, unknown> = {}
  for (const [key, olds] of Object.entries(PLACEHOLDERS)) {
    const value = (settings as unknown as Record<string, unknown>)[key]
    if (!value || olds.includes(String(value))) patch[key] = NEXT[key]
  }
  if (!settings.social?.length) patch.social = [{ label: 'LinkedIn', url: 'https://www.linkedin.com/company/sdg-corporate/' }]
  await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: patch })
  log(`site settings: ${Object.keys(patch).join(', ') || 'unchanged'}`)

  // Website copy, with the founder photograph, galleries and the warehouse map.
  await payload.updateGlobal({
    slug: 'site-copy',
    overrideAccess: true,
    data: {
      ...COPY,
      legacyPhoto: await media(COPY_ASSETS.legacyPhoto),
      warehouseMap: await media(COPY_ASSETS.warehouseMap),
      officeGallery: await mediaAll(COPY_ASSETS.officeGallery),
      paperGallery: await mediaAll(COPY_ASSETS.paperGallery),
      glassGallery: await mediaAll(COPY_ASSETS.glassGallery),
      csrGallery: await mediaAll(COPY_ASSETS.csrGallery),
    },
  })
  log('website copy')

  const projectIds: Record<string, string> = {}
  for (const p of PROJECTS) {
    const { hero, gallery, floorPlans, configurations, highlights, ...rest } = p as (typeof PROJECTS)[number] & { gallery?: readonly Asset[]; floorPlans?: readonly Asset[]; configurations?: readonly { label: string; sizeSqft: number }[] }
    const doc = await upsert('projects', { slug: { equals: p.slug } }, {
      ...rest,
      configurations: configurations ? [...configurations] : [],
      highlights: highlights.map((text) => ({ text })),
      heroImage: hero ? await media(hero) : undefined,
      gallery: gallery ? await mediaAll(gallery) : undefined,
      floorPlans: floorPlans ? await mediaAll(floorPlans) : undefined,
      _status: 'published',
    }, { draft: false })
    projectIds[p.slug] = String(doc.id)
  }
  log(`${PROJECTS.length} projects`)

  for (const f of FACTS) {
    await upsert('facts', { factId: { equals: f.factId } }, { ...f, approvedBy: 'approvedBy' in f ? f.approvedBy : undefined, approvedAt: 'approvedAt' in f ? f.approvedAt : undefined })
  }
  log(`${FACTS.length} facts`)

  let order = 1
  for (const f of PRINIA_FAQS) {
    await upsert('faqs', { and: [{ question: { equals: f.q } }, { project: { equals: projectIds.prinia } }] },
      { question: f.q, answer: f.a, business: 'construction', project: projectIds.prinia, restricted: 'restricted' in f, order: order++, _status: 'published' }, { draft: false })
  }
  log(`${PRINIA_FAQS.length} Prinia FAQs`)

  for (const c of CONSULTANTS) {
    const found = await payload.find({ collection: 'consultants', where: { name: { equals: c.name } }, limit: 1, depth: 0, overrideAccess: true })
    if (found.docs[0]) {
      // Desks are edited by staff (hours, projects, logins); only the published phone number is refreshed.
      if (found.docs[0].phone !== c.phone) await payload.update({ collection: 'consultants', id: found.docs[0].id, data: { phone: c.phone }, overrideAccess: true })
    } else {
      await payload.create({ collection: 'consultants', overrideAccess: true, data: { ...c, businesses: [...c.businesses], enquiryTypes: [...c.enquiryTypes], locations: c.locations.map((name) => ({ name })), active: true } })
    }
  }
  log(`${CONSULTANTS.length} consultant desks`)

  for (const d of DOCUMENTS) {
    await upsert('documents', { title: { equals: d.title } }, {
      title: d.title, kind: d.kind, business: d.business, project: 'projectSlug' in d ? projectIds[d.projectSlug] : undefined,
      extractedText: d.text, approved: true, approvedBy: 'Akshay (SDG) / sdg.in', approvedAt: '2026-10-21T00:00:00.000Z',
    })
  }
  log(`${DOCUMENTS.length} knowledge documents`)

  for (const l of LEADERS) await upsert('leaders', { name: { equals: l.name } }, { ...l, active: true })
  log(`${LEADERS.length} leadership profiles`)

  for (const p of [...PARTNERS, ...CLIENTS]) {
    const { logo, ...rest } = p
    await upsert('partners', { and: [{ name: { equals: p.name } }, { business: { equals: p.business } }] }, { ...rest, logo: logo ? await media(logo) : undefined, active: true })
  }
  log(`${PARTNERS.length} partners, ${CLIENTS.length} clients`)

  for (const n of NEWS) {
    const { cover, url, ...rest } = n
    await upsert('posts', { slug: { equals: n.slug } }, { ...rest, externalUrl: url, readMinutes: 3, cover: await media(cover), sample: false, _status: 'published' }, { draft: false })
  }
  log(`${NEWS.length} press items`)

  // Layout-review placeholders from the first build: sdg.in has no testimonials, open roles or articles, so
  // the samples come down rather than sit beside real content.
  for (const collection of ['posts', 'jobs', 'testimonials'] as const) {
    const gone = await payload.delete({ collection, where: { sample: { equals: true } }, overrideAccess: true })
    if (gone.docs.length) log(`removed ${gone.docs.length} sample ${collection}`)
  }

  await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: { contentVersion: CONTENT_VERSION } })

  log('indexing changed documents…')
  await payload.jobs.run({ limit: 50 })
  const indexed = await countReal('document-chunks')
  log(`${indexed.totalDocs} chunks indexed`)

  log('done')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
