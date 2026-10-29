import type { Metadata } from 'next'
import React from 'react'

import { CareerForm } from '@/components/CareerForm'
import { BUSINESS_LABEL, getJobs, getSiteCopy } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Careers', description: 'Join Team SDG: career opportunities across constructions, paper, glass bottles and agro products in Hyderabad.' }

export default async function CareersPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const [jobs, copy, sp] = await Promise.all([getJobs(), getSiteCopy(), searchParams])
  const anySample = jobs.some((j) => j.sample)
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">Careers</p>
        <h1>Join<br /><em>Team SDG.</em></h1>
        <p className="lede">{copy.careersIntro || 'We are committed to growth and our vision is a grand one. Join us in our pursuit of excellence for greater good.'}</p>
        <p className="lede" style={{ marginTop: 'var(--para-gap)' }}>A family of 800+ across constructions, the paper mills at Sangareddy and the bottle warehouse network.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 16 }}>
        <div className="grid g2" style={{ alignItems: 'start', gap: 40 }}>
          <div>
            <p className="co-kick">Open roles {anySample && <span className="tag sample" style={{ marginLeft: 8 }}>Sample listings</span>}</p>
            <div className="jobs">
              {jobs.length === 0 && <p className="lede" style={{ fontSize: 'var(--fs-small)' }}>No open roles are listed right now. Send us your profile and we keep it on file for the next opening.</p>}
              {jobs.map((j) => (
                <div className="job" key={j.id}>
                  <div><b>{j.title}</b><br /><span>{BUSINESS_LABEL[j.business]} · {j.location} · {(j.type || 'full-time').replace('-', ' ')}</span>{j.description && <p style={{ marginTop: 6, fontSize: 'var(--fs-small)', color: 'var(--ink2)' }}>{j.description}</p>}</div>
                  <a className="btn ghost sm" href={`?role=${encodeURIComponent(j.title)}#apply`}>Apply</a>
                </div>
              ))}
            </div>
          </div>
          <h2 className="sr">Application</h2>
          <CareerForm role={sp.role} />
        </div>
      </section>
    </div>
  )
}
