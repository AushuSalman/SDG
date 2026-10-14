import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { getFacts } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Our story', description: 'Suvarna Durga Group traces its origins to 1978: construction and realty, paper manufacturing, bottle recycling and agri products, from Hyderabad.' }

export default async function AboutPage() {
  const [identity, history, csr] = await Promise.all([getFacts({ category: 'Corporate Identity' }), getFacts({ category: 'History & Timeline' }), getFacts({ category: 'CSR & Sustainability' })])
  const description = identity.find((f) => /description/i.test(f.claim))?.wording
  const founder = identity.find((f) => /founder/i.test(f.claim))?.wording
  const values = identity.find((f) => /values/i.test(f.claim))?.wording
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">The Group</p>
        <h1>Building in Hyderabad<br /><em>since 1978.</em></h1>
        <p className="lede">{description || 'Suvarna Durga Group is a diversified business group with interests across construction and realty, paper manufacturing, bottle recycling and agri products.'}</p>
        {founder && <p className="lede" style={{ marginTop: 10 }}>{founder}</p>}
      </section>

      <section className="co-section" style={{ paddingTop: 16 }}>
        <p className="co-kick">Our story</p>
        <ol className="timeline">
          {history.map((f) => <li key={f.id}><b>{f.value}</b><span>{f.wording}</span></li>)}
        </ol>
      </section>

      <section className="co-section" style={{ paddingTop: 0 }}>
        <div className="grid g3">
          <div className="card"><p className="co-kick">01 — Build</p><h3>Homes and workplaces</h3><p className="lede" style={{ fontSize: 15, marginTop: 8 }}>Residential and Grade A commercial across Hyderabad, every project RERA registered and published.</p><p style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/real-estate">Construction →</Link></p></div>
          <div className="card"><p className="co-kick">02 — Make</p><h3>Paper for the trade</h3><p className="lede" style={{ fontSize: 15, marginTop: 8 }}>Machine-finished kraft from Sangareddy, 100 to 250 GSM and 18 to 28 BF, FSC and RoHS certified.</p><p style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/paper">Paper →</Link></p></div>
          <div className="card"><p className="co-kick">03 — Renew</p><h3>Glass, given a new life</h3><p className="lede" style={{ fontSize: 15, marginTop: 8 }}>Returnable bottles recovered, washed and supplied back to fillers through eleven warehouses across two states.</p><p style={{ marginTop: 14 }}><Link className="btn ghost sm" href="/glass">Glass recycling →</Link></p></div>
        </div>
      </section>

      <section className="co-section" style={{ paddingTop: 0 }}>
        <div className="grid g2" style={{ alignItems: 'center' }}>
          <div className="ph" style={{ aspectRatio: '16 / 10' }}><Image src="/img/hero.webp" alt="Kokapet Financial District skyline, Hyderabad" width={1200} height={750} /></div>
          <div>
            <p className="co-kick">How we work</p>
            <h2>{values || 'Integrity, honesty, transparency, people-centricity, responsible growth and value creation.'}</h2>
            <span className="rule-line" />
            <p className="lede" style={{ fontSize: 16 }}>Every SDG project is RERA registered and published. Possession dates are targets we track in the open, and the same team stays with you after the keys.</p>
            {csr.length > 0 && <ul style={{ margin: '14px 0 0', paddingLeft: 18, color: 'var(--ink2)', lineHeight: 1.7 }}>{csr.map((f) => <li key={f.id}>{f.wording}</li>)}</ul>}
            <p className="btn-row" style={{ marginTop: 20 }}><Link className="btn accent" href="/leadership">Meet the leadership</Link><Link className="btn ghost" href="/contact">Contact the Group</Link></p>
          </div>
        </div>
      </section>
    </div>
  )
}
