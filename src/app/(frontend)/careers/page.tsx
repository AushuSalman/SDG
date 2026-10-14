import type { Metadata } from 'next'
import React from 'react'

import { CareerForm } from '@/components/CareerForm'
import { BUSINESS_LABEL, getJobs } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Careers', description: 'Open roles across SDG construction, the paper mill and the glass warehouse network.' }

export default async function CareersPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const [jobs, sp] = await Promise.all([getJobs(), searchParams])
  const anySample = jobs.some((j) => j.sample)
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">Careers</p>
        <h1>Build a career<br /><em>that lasts.</em></h1>
        <p className="lede">Open roles across construction, the paper mill at Sangareddy and the glass warehouse network. A team of 800 and growing.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 16 }}>
        <div className="grid g2" style={{ alignItems: 'start', gap: 40 }}>
          <div>
            <p className="co-kick">Open roles {anySample && <span className="tag sample" style={{ marginLeft: 8 }}>Sample listings</span>}</p>
            <div className="jobs">
              {jobs.length === 0 && <p className="lede" style={{ fontSize: 15 }}>No open roles are listed right now. Send us your profile and we keep it on file.</p>}
              {jobs.map((j) => (
                <div className="job" key={j.id}>
                  <div><b>{j.title}</b><br /><span>{BUSINESS_LABEL[j.business]} · {j.location} · {(j.type || 'full-time').replace('-', ' ')}</span>{j.description && <p style={{ marginTop: 6, fontSize: 14, color: 'var(--ink2)' }}>{j.description}</p>}</div>
                  <a className="btn ghost sm" href={`?role=${encodeURIComponent(j.title)}#apply`}>Apply</a>
                </div>
              ))}
            </div>
          </div>
          <CareerForm role={sp.role} />
        </div>
      </section>
    </div>
  )
}
