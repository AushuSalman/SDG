import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { DecisionTools } from '@/components/project/DecisionTools'
import { ProjectGallery } from '@/components/project/ProjectGallery'
import { ProjectTabs } from '@/components/project/ProjectTabs'
import { AskAiButton, BookVisitButton, BrochureButton, ShareButton } from '@/components/ui/actions'
import { CATEGORY_LABEL, STATUS_LABEL, getFaqs, getProjectBySlug, getProjects, mediaUrl, priceBand, projectImage } from '@/lib/content'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProjectBySlug(slug)
  if (!p) return { title: 'Project not found' }
  return { title: `${p.name} · ${p.location}`, description: p.seo?.description || p.summary || p.tagline || undefined, openGraph: { images: [projectImage(p, 'wide')] } }
}

const LIB: Record<string, [string, string][]> = {
  residential: [['/img/residential.webp', 'High-rise residential towers, Hyderabad'], ['/img/workers.webp', 'Construction team on site'], ['/img/construction.webp', 'Under construction, Hyderabad'], ['/img/homedusk.webp', 'A completed home at dusk'], ['/img/upcoming.webp', 'Towers under construction']],
  commercial: [['/img/commercial.webp', 'Financial District panorama, Hyderabad'], ['/img/hero.webp', 'Kokapet Financial District skyline'], ['/img/construction.webp', 'Under construction, Hyderabad'], ['/img/workers.webp', 'Construction team on site'], ['/img/upcoming.webp', 'Towers under construction']],
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()
  const [faqs, siblings] = await Promise.all([getFaqs({ projectId: String(project.id) }), getProjects({ business: 'construction', category: project.category })])
  const res = project.category === 'residential'
  const own = [mediaUrl(project.heroImage, 'wide'), ...(project.gallery || []).map((g) => mediaUrl(g, 'card'))].filter(Boolean) as string[]
  const images = own.length ? own.map((src, i) => ({ src, alt: `${project.name}, photo ${i + 1}` })) : LIB[project.category].map(([src, alt]) => ({ src, alt: `${alt} (library photo, pending ${project.name} photography)` }))
  const price = priceBand(project)
  const specs = project.specs || {}
  const specRows = ([
    ['Towers', specs.towers], ['Floors', specs.floors], ['Units', specs.units], ['Saleable area', specs.saleableArea], ['Floor plate', specs.floorPlate],
    ['Floor height', specs.floorHeight], ['Certification', specs.certification], ['Parking', specs.parking],
  ] as [string, string | number | null | undefined][]).filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => [k, String(v)] as [string, string])
  const brochureUrl = typeof project.brochure === 'object' && project.brochure ? project.brochure.url || null : null
  const configs = (project.configurations || []).map((c) => ({ label: c.label, sizeSqft: c.sizeSqft }))
  const cfgSummary = configs.length ? [...new Set(configs.map((c) => c.label))].join(', ') : specs.floorPlate ? `Floor plates ${specs.floorPlate}` : ''
  const similar = siblings.filter((p) => p.slug !== project.slug).slice(0, 3)

  return (
    <div className="wrap">
      <section style={{ padding: '96px 0 20px' }}>
        <div className="grid g2" style={{ alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="eyebrow">{CATEGORY_LABEL[project.category]} · {project.location}</span>
            <h1>{project.name}</h1>
            <p className="lede">{project.tagline || project.summary}</p>
            <div className="btn-row">
              <BookVisitButton project={project.slug}>Book a site visit</BookVisitButton>
              <BrochureButton slug={project.slug} name={project.name} url={brochureUrl}>Download brochure</BrochureButton>
              <ShareButton shareTitle={`${project.name}, ${project.location}`} path={`/projects/${project.slug}`}>Share</ShareButton>
            </div>
          </div>
          <div className="card">
            <dl className="kv">
              <dt>Status</dt><dd>{STATUS_LABEL[project.status]}{project.possession ? ` · possession ${project.possession}` : ''}</dd>
              {cfgSummary && <><dt>{res ? 'Configurations' : 'Space'}</dt><dd>{cfgSummary}</dd></>}
              {price && <><dt>Indicative price</dt><dd>{price} (indicative)</dd></>}
              {specs.saleableArea && <><dt>Saleable area</dt><dd>{specs.saleableArea}</dd></>}
              <dt>RERA</dt><dd className="num">{project.rera || 'Registration published on launch'}</dd>
            </dl>
          </div>
        </div>
      </section>

      <div className="proj-layout">
        <div className="proj-main">
          <ProjectGallery images={images} videoUrl={project.videoUrl} name={project.name} />
          <ProjectTabs d={{
            slug: project.slug, name: project.name, status: project.status, possession: project.possession, rera: project.rera, location: project.location, address: project.address,
            category: project.category, configurations: configs,
            floorPlans: (project.floorPlans || []).map((f, i) => ({ src: mediaUrl(f, 'wide') || '', alt: `${project.name} floor plan ${i + 1}` })).filter((f) => f.src),
            specs: specRows, highlights: (project.highlights || []).map((h) => h.text), faqs: faqs.map((f) => ({ q: f.question, a: f.answer })), brochureUrl,
          }} />
          {project.summary && <p className="lede" style={{ marginTop: 20, fontSize: 15.5 }}>{project.summary}</p>}

          {res ? (
            <DecisionTools name={project.name} slug={project.slug} priceFromLakh={project.pricing?.from} configurations={configs} />
          ) : (
            <section style={{ paddingTop: 36 }}>
              <div className="grid g2">
                <Link className="tool" href="/roi"><span className="co-kick">Investors &amp; occupiers</span><h3>ROI calculator</h3><p>Indicative yields and returns for leasing or investing in {project.name}.</p><span className="go">Calculate →</span></Link>
                <Link className="tool" href="/proposal"><span className="co-kick">Occupiers</span><h3>Space designer &amp; proposal</h3><p>Configure area, layout and services and receive an indicative proposal.</p><span className="go">Configure →</span></Link>
              </div>
            </section>
          )}

          {similar.length > 0 && (
            <section style={{ paddingTop: 36 }}>
              <span className="eyebrow">Similar {res ? 'homes' : 'spaces'}</span>
              <h2 style={{ margin: '8px 0 20px' }}>You may also consider</h2>
              <div className="re-grid">
                {similar.map((p, i) => (
                  <Link key={p.slug} className="re-card" href={`/projects/${p.slug}`} style={{ ['--i' as string]: i }}>
                    <span className="re-card-img"><Image src={projectImage(p, 'card')} alt="" width={960} height={640} /></span>
                    <h3>{p.name}</h3><p className="re-loc">{p.location}</p>
                    <dl className="re-tags"><dt>Type</dt><dd className={`re-t-${p.category}`}>{CATEGORY_LABEL[p.category]}</dd><dt>Status</dt><dd className={`re-s-${p.status}`}>{STATUS_LABEL[p.status]}</dd></dl>
                    <span className="re-view">View Project<i aria-hidden>↗</i></span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="proj-side">
          <div className="card">
            <span className="eyebrow">{res ? 'Indicative price' : 'Indicative rent'}</span>
            <div className="emi num" style={{ fontSize: 26, marginTop: 6 }}>{price || 'On request'}</div>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '6px 0 16px' }}>{project.possession ? `Possession ${project.possession}` : STATUS_LABEL[project.status]}{project.pricing?.note ? ` · ${project.pricing.note}` : ''}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <BookVisitButton project={project.slug}>Book a site visit</BookVisitButton>
              <Link className="btn ghost" href="/schedule?desk=construction">Schedule a call</Link>
              <BrochureButton slug={project.slug} name={project.name} url={brochureUrl}>Download brochure</BrochureButton>
              <AskAiButton question={`Tell me about ${project.name}`}>Ask the AI consultant</AskAiButton>
            </div>
            <p className="disclaimer" style={{ marginTop: 16 }}>Prices and dates are SDG-published indicative figures, not commitments. A consultant confirms the details.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
