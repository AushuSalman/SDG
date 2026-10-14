import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'
import { CONSULTANTS, DOCUMENTS, FACTS, PRINIA_FAQS, PROJECTS } from './data'
import { JOBS, POSTS, TESTIMONIALS, richText } from './extra'

/**
 * Idempotent seed: creates the first super admin, site settings, the five projects, approved facts,
 * the Prinia FAQs, three consultant desks and the approved documents, then runs the indexing jobs.
 *   npm run seed            (needs DATABASE_URL and PAYLOAD_SECRET)
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD override the default admin login.
 */
async function main() {
  const payload = await getPayload({ config })
  const log = (m: string) => payload.logger.info(`[seed] ${m}`)
  // A real query, not the collection's estimated count: after an unclean shutdown WiredTiger's estimates lag,
  // and a seed that trusts them would try to insert duplicates.
  const countReal = async (collection: Parameters<typeof payload.count>[0]['collection']) =>
    payload.count({ collection, overrideAccess: true, where: { id: { exists: true } } })

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@sdg.local'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'
  const users = await countReal('users')
  if (users.totalDocs === 0) {
    await payload.create({ collection: 'users', overrideAccess: true, data: { email: adminEmail, password: adminPassword, name: 'SDG Super Admin', role: 'super-admin', business: 'group' } })
    log(`super admin created: ${adminEmail}`)
  }

  await payload.updateGlobal({ slug: 'site-settings', overrideAccess: true, data: {} })

  const projectIds: Record<string, string> = {}
  for (const p of PROJECTS) {
    const existing = await payload.find({ collection: 'projects', overrideAccess: true, where: { slug: { equals: p.slug } }, limit: 1, draft: true })
    if (existing.docs[0]) { projectIds[p.slug] = String(existing.docs[0].id); continue }
    const doc = await payload.create({
      collection: 'projects',
      overrideAccess: true,
      draft: false,
      data: {
        ...p,
        configurations: 'configurations' in p ? [...p.configurations] : [],
        highlights: p.highlights.map((text) => ({ text })),
        _status: 'published',
      },
    })
    projectIds[p.slug] = String(doc.id)
    log(`project ${p.name}`)
  }

  const facts = await countReal('facts')
  if (facts.totalDocs === 0) {
    for (const f of FACTS) {
      await payload.create({ collection: 'facts', overrideAccess: true, data: { ...f, approvedBy: f.status === 'approved' ? 'Akshay (SDG)' : undefined, approvedAt: f.status === 'approved' ? '2026-10-10T00:00:00.000Z' : undefined } })
    }
    log(`${FACTS.length} facts`)
  }

  const faqs = await countReal('faqs')
  if (faqs.totalDocs === 0) {
    let order = 1
    for (const f of PRINIA_FAQS) {
      await payload.create({ collection: 'faqs', overrideAccess: true, draft: false, data: { question: f.q, answer: f.a, business: 'construction', project: projectIds.prinia, restricted: 'restricted' in f, order: order++, _status: 'published' } })
    }
    log(`${PRINIA_FAQS.length} Prinia FAQs`)
  }

  const consultants = await countReal('consultants')
  if (consultants.totalDocs === 0) {
    for (const c of CONSULTANTS) {
      await payload.create({ collection: 'consultants', overrideAccess: true, data: { ...c, businesses: [...c.businesses], enquiryTypes: [...c.enquiryTypes], locations: c.locations.map((name) => ({ name })), active: true } })
    }
    log(`${CONSULTANTS.length} consultant desks`)
  }

  const documents = await countReal('documents')
  if (documents.totalDocs === 0) {
    for (const d of DOCUMENTS) {
      await payload.create({
        collection: 'documents',
        overrideAccess: true,
        data: { title: d.title, kind: d.kind, business: d.business, project: 'projectSlug' in d ? projectIds[d.projectSlug] : undefined, extractedText: d.text, approved: true, approvedBy: 'Akshay (SDG)', approvedAt: '2026-10-10T00:00:00.000Z', indexStatus: 'pending' },
      })
    }
    log(`${DOCUMENTS.length} approved documents, indexing…`)
    await payload.jobs.run({ limit: 50 })
    const indexed = await countReal('document-chunks')
    log(`${indexed.totalDocs} chunks indexed`)
  }

  // Layout-review content, flagged `sample` so the site shows a chip until marketing replaces it.
  const posts = await countReal('posts')
  if (posts.totalDocs === 0) {
    for (const p of POSTS) {
      await payload.create({ collection: 'posts', overrideAccess: true, draft: false, data: { title: p.title, slug: p.slug, business: p.business, readMinutes: p.readMinutes, publishedAt: p.publishedAt, excerpt: p.excerpt, body: richText([...p.body]), sample: true, _status: 'published' } })
    }
    log(`${POSTS.length} sample posts`)
  }
  const jobs = await countReal('jobs')
  if (jobs.totalDocs === 0) {
    for (const j of JOBS) await payload.create({ collection: 'jobs', overrideAccess: true, data: { ...j, active: true, sample: true } })
    log(`${JOBS.length} sample roles`)
  }
  const testimonials = await countReal('testimonials')
  if (testimonials.totalDocs === 0) {
    for (const t of TESTIMONIALS) await payload.create({ collection: 'testimonials', overrideAccess: true, data: { ...t, approved: true, sample: true, approvedBy: 'Seed (layout review)', approvedAt: '2026-10-10T00:00:00.000Z' } })
    log(`${TESTIMONIALS.length} sample testimonials`)
  }

  log('done')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
