import type { Metadata } from 'next'
import Image from 'next/image'
import React from 'react'

import { EnquiryForm } from '@/components/EnquiryForm'
import { SectionBar } from '@/components/SectionBar'
import { BookVisitButton, ScrollLink } from '@/components/ui/actions'
import { GL_STEP_ICONS } from '@/components/ui/icons'
import { getFacts } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Glass Recycling', description: 'Suvarna Durga Bottles: recovery, sorting, washing and supply of returnable glass bottles through a warehouse network across Telangana and Andhra Pradesh.' }

const STEPS = [
  ['Recovery', 'Empties collected from distributors, hotels and retail returns.'],
  ['Sorting', 'Separated by shape, size and colour against each filler\'s spec.'],
  ['Washing', 'Soak, caustic wash and rinse. Labels, foil and residue removed.'],
  ['Inspection', 'Dried, light-checked and rejected if chipped, cracked or stained.'],
  ['Crating', 'Packed into crates and pallets, counted and tracked by batch.'],
  ['Warehousing', 'Stored under cover and rotated first in, first out.'],
  ['Supply', 'Delivered back to bottlers and fillers on a scheduled run.'],
]
const FAMILIES = [
  ['Beverage returnables', 'Soft drink and water bottles collected through the distributor network.', '200 ml – 1 L'],
  ['Beer bottles', 'Standard pint and quart returnables in amber and green glass.', '325 / 650 ml'],
  ['Spirits & liquor', 'Quart, pint and nip bottles handled for distillery refill programmes.', '180 – 750 ml'],
  ['Food & pharma jars', 'Wide-mouth jars and vials returned through trade channels.', '100 – 500 ml'],
]
const WHY = [
  ['Washed, not melted', 'Reuse keeps the bottle whole, so there is no furnace and no remelt energy behind it.'],
  ['Many lives per bottle', 'A returnable goes back out again and again before it is ever retired from the pool.'],
  ['Retired, then recycled', 'When a bottle finally fails inspection it leaves as cullet, not as landfill.'],
]

export default async function GlassPage() {
  const facts = await getFacts({ category: 'Bottle Recycling' })
  return (
    <div id="gx-top">
      <SectionBar
        sub="Glass Recycling" variant="centre" label="Glass Recycling"
        links={[{ to: 'gx-top', label: 'About' }, { to: 'glassprocess', label: 'Our Process' }, { to: 'glassrange', label: 'Applications' }, { to: 'site-foot', label: 'Contact' }]}
        cta={<ScrollLink to="enquire" focus="eq-quantity" className="btn sm sentence">Enquire</ScrollLink>}
      />

      <section className="gl-hero">
        <Image className="gl-hero-img" src="/img/glass-hero-mock.webp" alt="Clear recovered glass on the sorting line" width={1600} height={1000} priority />
        <div className="gl-hero-copy">
          <h1>A new life<br /><em>for glass.</em></h1>
          <p>Recovering valuable materials.<br />Supporting a circular future.</p>
          <div className="gl-cta">
            <ScrollLink to="enquire" focus="eq-quantity" className="btn">Discuss Your Requirements</ScrollLink>
            <ScrollLink to="glassprocess" className="btn ghost">Explore Our Process</ScrollLink>
          </div>
        </div>
      </section>

      <div className="trio-foot">
        <BookVisitButton className="trio-visit"><span>Planning a visit?</span><span className="trio-visit-cta">Choose a time <i>↗</i></span></BookVisitButton>
        <ScrollLink to="glassprocess" className="trio-scroll"><span>See the process</span><span className="trio-dashes"><i className="on" /><i /><i /></span></ScrollLink>
      </div>

      <section className="gl-process" id="glassprocess">
        <div className="wrap">
          <p className="gl-kick">Our bottle cycle</p>
          <h2>From return to refill.</h2>
          <p className="gl-sub">A bottle does not have to be broken to be recycled.</p>
          <div className="gl-steps four">
            {STEPS.slice(0, 4).map(([t, d], i) => { const Icon = GL_STEP_ICONS[i]; return <div className="gl-step" key={t}><span className="gl-ico"><Icon /></span><span className="gl-n">0{i + 1}</span><b>{t}</b><small>{d}</small></div> })}
          </div>
          <div className="gl-steps three">
            {STEPS.slice(4).map(([t, d], i) => { const Icon = GL_STEP_ICONS[i + 4]; return <div className="gl-step" key={t}><span className="gl-ico"><Icon /></span><span className="gl-n">0{i + 5}</span><b>{t}</b><small>{d}</small></div> })}
          </div>
        </div>
      </section>

      <section className="gl-range" id="glassrange">
        <div className="wrap">
          <p className="gl-kick">What we handle</p>
          <h2>Bottles we take back.</h2>
          <p className="gl-sub">Four returnable families, each washed to its own standard.</p>
          <div className="gl-grid">
            {FAMILIES.map(([b, s, e]) => <div key={b}><b>{b}</b><span>{s}</span><em>{e}</em></div>)}
          </div>
        </div>
      </section>

      <section className="gl-why">
        <div className="wrap">
          <h2>Reuse first. Recycling second.</h2>
          <span className="gl-rule" />
          <div className="gl-why-grid">
            {WHY.map(([b, s]) => <div key={b}><b>{b}</b><span>{s}</span></div>)}
          </div>
          {facts.length > 0 && (
            <div className="spec-grid" style={{ marginTop: 48 }}>
              {facts.filter((f) => f.value).slice(0, 4).map((f) => <div key={f.id}><b style={{ fontFamily: 'var(--display)', fontWeight: 500, fontSize: 34, letterSpacing: '-.02em', color: 'var(--gl)' }}>{f.value}</b><span>{f.wording}</span></div>)}
            </div>
          )}
        </div>
      </section>

      <section className="gl-enq">
        <div className="wrap">
          <p className="gl-kick">Supply &amp; offtake</p>
          <h2>Tell us about your empties.</h2>
          <p className="gl-sub">Returning bottles, buying washed returnables, or both. The operations desk replies within one working day.</p>
          <EnquiryForm business="glass" title="Send an enquiry" />
        </div>
      </section>

      <section className="gl-band">
        <Image className="gl-band-img" src="/img/glass-hero-mock.webp" alt="" width={1600} height={1000} />
        <div className="wrap-wide">
          <h2>Let&rsquo;s talk about your empties.</h2>
          <p>Returning bottles, or buying them back? Tell us volumes and location and the operations desk will come to you.</p>
          <div className="gl-cta">
            <ScrollLink to="enquire" focus="eq-quantity" className="btn glass">Enquire Now</ScrollLink>
            <BookVisitButton className="btn outline">Arrange a Visit</BookVisitButton>
          </div>
        </div>
      </section>
    </div>
  )
}
