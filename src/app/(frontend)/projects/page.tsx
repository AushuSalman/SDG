import type { Metadata } from 'next'
import React from 'react'

import { ProjectsDiscovery } from '@/components/construction/ProjectsDiscovery'
import { getProjects, priceBand, projectImage } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Projects', description: 'Every SDG project, past, current and upcoming, with configurations, possession targets and RERA details.' }

export default async function ProjectsPage() {
  const projects = await getProjects({ business: 'construction' })
  const data = projects.map((p) => {
    const cfgs = (p.configurations || []).map((c) => c.label)
    return {
      slug: p.slug, name: p.name, location: p.location, address: p.address, category: p.category, status: p.status, img: projectImage(p, 'card'), featured: Boolean(p.featured),
      summary: p.tagline || p.summary || '', size: cfgs.length ? [...new Set(cfgs)].join(', ') : p.specs?.floorPlate ? `Floor plates ${p.specs.floorPlate}` : p.specs?.saleableArea || '—',
      price: priceBand(p), minCr: p.pricing?.from ? p.pricing.from / 100 : null, maxCr: p.pricing?.to ? p.pricing.to / 100 : null,
      possession: p.possession || (p.status === 'completed' ? 'Handed over' : 'As per RERA filing'), rera: p.rera || 'On registration',
    }
  })
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 0 }}>
        <p className="co-kick">Projects</p>
        <h1>Find your<br /><em>space.</em></h1>
        <p className="lede">Every SDG project, past, current and upcoming, with configurations, possession targets and RERA details. Filter, sort, or see them on the map.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 20 }}>
        <h2 className="sr">Project list</h2>
        <ProjectsDiscovery projects={data} />
      </section>
    </div>
  )
}
