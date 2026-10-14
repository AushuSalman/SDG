import type { Metadata } from 'next'
import React from 'react'

import { SpaceDesigner } from '@/components/tools/SpaceDesigner'
import { getProjects } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Space designer', description: 'Configure your office requirement and receive an indicative proposal from SDG.' }

export default async function ProposalPage() {
  const projects = await getProjects({ business: 'construction', category: 'commercial' })
  const buildings = projects.map((p) => ({ slug: p.slug, name: p.name, location: p.location, status: p.status, floorPlate: p.specs?.floorPlate, saleable: p.specs?.saleableArea }))
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 24 }}>
        <p className="co-kick">Space designer</p>
        <h1>Configure your<br /><em>office requirement.</em></h1>
        <p className="lede">A guided configurator over SDG-defined options. The output is an indicative, watermarked proposal. A binding proposal needs an SDG representative&apos;s approval.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 0 }}><SpaceDesigner buildings={buildings} /></section>
    </div>
  )
}
