import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { ClientLogos } from '@/components/ClientLogos'
import { SectionBar } from '@/components/SectionBar'
import { ScrollLink } from '@/components/ui/actions'
import { getFacts, getPartners, getSiteCopy, lines, paragraphs } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Suvarna Durga Agro Products', description: 'Suvarna Durga Agro Products: procurement, logistics and delivery of rice, maize, DDGS and other agro products through a supply chain sourcing from seven states.' }

/**
 * Agro Products from sdg.in. Not a scoped vertical (the SOW covers three environments), so this page is not linked
 * from the menu, footer or home page; it stays reachable by URL until SDG decides whether the vertical is current.
 */
export default async function AgroPage() {
  const [copy, facts, clients] = await Promise.all([getSiteCopy(), getFacts({ category: 'Agro Products', business: 'agro' }), getPartners({ kind: 'client', business: 'agro' })])
  const numbers = facts.filter((f) => f.business === 'agro' && f.value).slice(0, 4)
  const words = facts.filter((f) => f.business === 'agro' && !f.value)
  const strengths = paragraphs(copy.agroStrengths)
  const sellers = lines(copy.agroSellers)
  const buyers = lines(copy.agroBuyers)
  const why = lines(copy.agroWhy)
  return (
    <div id="ag-top">
      <SectionBar
        sub="Agro Products" variant="rule" label="Agro Products"
        links={[{ to: 'ag-top', label: 'About' }, { to: 'agrostrengths', label: 'Our Strengths' }, { to: 'agrobenefits', label: 'Benefits' }, { to: 'site-foot', label: 'Contact' }]}
        cta={<Link className="btn sm sentence" href="/contact">Enquire <i aria-hidden>→</i></Link>}
      />

      <section className="vtop">
        <div className="vtop-grid">
          <div className="vtop-copy">
            <p className="vtop-kicker">04 / Grow</p>
            <h1>From the farm gate<br /><em>to your plant.</em></h1>
            <p className="vtop-sub">{copy.agroIntro || 'Procurement, logistics and delivery of grains, rice and other agro products from source to customer across India.'}</p>
            <div className="vtop-links">
              <ScrollLink to="agrostrengths">Our Strengths <i>→</i></ScrollLink>
              <Link href="/contact">Send a Requirement <i>→</i></Link>
            </div>
          </div>
          <div className="vtop-art photo"><Image src="/img/sdg/agro-fields.jpg" alt="Golden wheat ears in a field" width={1200} height={800} priority /></div>
        </div>
      </section>

      {(numbers.length > 0 || words.length > 0) && (
        <section className="pp-spec ag-numbers">
          <div className="wrap">
            <h2>Agro products, by the numbers.</h2>
            {words.map((f) => <p key={f.id} className="pp-sub">{f.wording}</p>)}
            {numbers.length > 0 && (
              <div className="spec-grid" style={{ marginTop: 36 }}>
                {numbers.map((f) => <div key={f.id}><b className="big">{f.value}</b><span>{f.wording}</span></div>)}
              </div>
            )}
          </div>
        </section>
      )}

      {strengths.length > 0 && (
        <section className="ag-strengths" id="agrostrengths">
          <div className="wrap">
            <div className="grid g2" style={{ alignItems: 'start' }}>
              <div>
                <p className="process-kick">Leveraging our strengths</p>
                <h2>Procurement and supply chain, done at source.</h2>
              </div>
              <div>{strengths.map((p, i) => <p key={i} className="lede" style={{ fontSize: 'var(--fs-body)', marginTop: i ? 'var(--para-gap)' : 0 }}>{p}</p>)}</div>
            </div>
          </div>
        </section>
      )}

      {(sellers.length > 0 || buyers.length > 0 || why.length > 0) && (
        <section className="ag-benefits" id="agrobenefits">
          <div className="wrap">
            <p className="process-kick">Benefits</p>
            <h2>Farmer, seller and customer alike.</h2>
            <div className="grid g3 ag-lists" style={{ marginTop: 28 }}>
              {sellers.length > 0 && <div><h3>For sellers</h3><ul>{sellers.map((s) => <li key={s}>{s}</li>)}</ul></div>}
              {buyers.length > 0 && <div><h3>For buyers</h3><ul>{buyers.map((s) => <li key={s}>{s}</li>)}</ul></div>}
              {why.length > 0 && <div><h3>Why us</h3><ul>{why.map((s) => <li key={s}>{s}</li>)}</ul></div>}
            </div>
          </div>
        </section>
      )}

      {clients.length > 0 && (
        <section className="ag-clients">
          <div className="wrap"><ClientLogos clients={clients} kickClass="process-kick" title="Clients" /></div>
        </section>
      )}

      <section className="closing">
        <div className="wrap">
          <p className="section-mark">Talk to us</p>
          <h2 className="closing-line">Tell us the grain, the volume and the delivery point.</h2>
          <p className="closing-sub">Agro enquiries go to the Group desk; choose Group on the contact form.</p>
          <p className="opening-links"><Link href="/contact">Contact the Group <i>→</i></Link></p>
        </div>
      </section>
    </div>
  )
}
