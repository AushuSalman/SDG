import type { Metadata } from 'next'
import Image from 'next/image'
import React from 'react'

import { ClientLogos } from '@/components/ClientLogos'
import { EnquiryForm } from '@/components/EnquiryForm'
import { FaqSection } from '@/components/FaqSection'
import { PhotoGrid } from '@/components/PhotoGrid'
import { SectionBar } from '@/components/SectionBar'
import { BookVisitButton, ScrollLink } from '@/components/ui/actions'
import { GL_STEP_ICONS } from '@/components/ui/icons'
import { getFacts, getFaqs, getPartners, getSiteCopy, mediaList, mediaUrl } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Suvarna Durga Bottles', description: 'Suvarna Durga Bottles: premium glass bottle recycling through a network of warehouses across Telangana and Andhra Pradesh, with a pilot automated washing plant.' }

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
  const [facts, faqs, copy, clients] = await Promise.all([getFacts({ category: 'Bottle Recycling' }), getFaqs({ business: 'glass', generalOnly: true }), getSiteCopy(), getPartners({ kind: 'client', business: 'glass' })])
  const fact = (re: RegExp) => facts.find((f) => re.test(f.claim))
  const team = fact(/full-time/i)
  const youth = fact(/youth/i)
  const warehouses = fact(/^warehouses/i)
  const points = [team && youth && `Strength: ${team.value} full-time, ${youth.value} self-employed youth`, warehouses && `${warehouses.value} warehouses in Telangana and Andhra Pradesh`].filter(Boolean) as string[]
  const numbers = facts.filter((f) => f.value).slice(0, 4)
  const map = mediaUrl(copy.warehouseMap, 'wide')
  const plant = mediaList(copy.glassGallery)
  return (
    <div id="gx-top">
      <SectionBar
        sub="Glass Bottles" variant="centre" label="Glass Bottles"
        links={[{ to: 'gx-top', label: 'About' }, { to: 'glassprocess', label: 'Our Process' }, { to: 'glassrange', label: 'Applications' }, { to: 'glassnetwork', label: 'Network' }, { to: 'site-foot', label: 'Contact' }]}
        cta={<ScrollLink to="enquire" focus="eq-quantity" className="btn sm sentence">Enquire</ScrollLink>}
      />

      <section className="gl-hero">
        <Image className="gl-hero-img" src="/img/glass-hero-mock.webp" alt="Clear recovered glass on the sorting line" width={1600} height={1000} priority />
        <div className="gl-hero-copy">
          <h1>A new life<br /><em>for glass.</em></h1>
          <p>{copy.glassIntro || 'Recovering valuable materials. Supporting a circular future.'}</p>
          {points.length > 0 && <ul className="gl-points">{points.map((p) => <li key={p}>{p}</li>)}</ul>}
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
          <ClientLogos clients={clients} kickClass="gl-kick" title="Clients" />
        </div>
      </section>

      {(map || copy.glassWarehouses) && (
        <section className="gl-network" id="glassnetwork">
          <div className="wrap">
            <div className="grid g2" style={{ alignItems: 'center' }}>
              <div>
                <p className="gl-kick">Warehouse locations</p>
                <h2>A network across two states.</h2>
                <span className="gl-rule" style={{ marginInline: 0 }} />
                {copy.glassWarehouses && <p className="lede" style={{ fontSize: 16 }}>{copy.glassWarehouses}</p>}
              </div>
              {map && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="gl-map" src={map} alt="Map of Suvarna Durga Bottles warehouses across Telangana and Andhra Pradesh" loading="lazy" />
              )}
            </div>
          </div>
        </section>
      )}

      <section className="gl-why">
        <div className="wrap">
          <h2>Reuse first. Recycling second.</h2>
          <span className="gl-rule" />
          <div className="gl-why-grid">
            {WHY.map(([b, s]) => <div key={b}><b>{b}</b><span>{s}</span></div>)}
          </div>
          {numbers.length > 0 && (
            <div className="spec-grid gl-numbers" style={{ marginTop: 48 }}>
              {numbers.map((f) => <div key={f.id}><b className="big">{f.value}</b><span>{f.wording}</span></div>)}
            </div>
          )}
        </div>
      </section>

      {(copy.glassPilot || plant.length > 0) && (
        <section className="gl-pilot">
          <div className="wrap">
            <p className="gl-kick">Pilot project</p>
            <h2>Automated plant.</h2>
            {copy.glassPilot && <p className="gl-sub" style={{ maxWidth: '64ch', marginInline: 'auto' }}>{copy.glassPilot}</p>}
            <PhotoGrid photos={plant} columns={4} />
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="gl-faq">
          <div className="wrap"><FaqSection faqs={faqs} kickClass="gl-kick" title="Questions about returnables." /></div>
        </section>
      )}

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
