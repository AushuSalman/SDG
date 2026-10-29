import type { Metadata } from 'next'
import React from 'react'

import { ReadinessWizard } from '@/components/ReadinessWizard'
import { getProjects, projectImage } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Readiness check', description: 'Five quick questions, a recommendation and the right next step with SDG.' }

export default async function ReadinessPage() {
  const projects = await getProjects({ business: 'construction' })
  const data = projects.map((p) => ({ slug: p.slug, name: p.name, location: p.location, category: p.category, status: p.status, img: projectImage(p, 'card'), minCr: p.pricing?.from ? p.pricing.from / 100 : null, maxCr: p.pricing?.to ? p.pricing.to / 100 : null }))
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 0 }}>
        <p className="co-kick">Buyer-readiness check</p>
        <h1>Where are you<br /><em>on your journey?</em></h1>
        <p className="lede">Five quick questions. You get a recommendation and the right next step; our team gets a better brief.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 24 }}>
        <div className="grid g2" style={{ alignItems: 'start', gap: 32 }}>
          <h2 className="sr">Readiness check</h2>
          <ReadinessWizard projects={data} />
          <div>
            <p className="co-kick">What happens next</p>
            <div className="mlist">
              <div><span>01</span><b>You see a readiness tier and two projects matched to your budget and area.</b></div>
              <div><span>02</span><b>Choose a site visit, a call with the right consultant, or keep asking the AI.</b></div>
              <div><span>03</span><b>Your answers reach the SDG CRM as a scored lead, so nobody asks you the same questions twice.</b></div>
            </div>
            <p className="disclaimer" style={{ marginTop: 16 }}>Questions and weights follow the qualification matrix agreed with SDG and are tuned from the admin.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
