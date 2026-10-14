import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = { title: 'Partnerships', description: 'Strategic partners and alliances across the Group\'s three businesses.' }

const PARTNERS: [string, [string, string][]][] = [
  ['Construction', [['Home-loan partners', 'Leading banks and HFCs'], ['Architects & consultants', 'Design partners'], ['Channel partners', 'Registered brokers'], ['Interiors & fit-out', 'Turnkey partners']]],
  ['Paper', [['Packaging converters', 'Trade buyers in five states'], ['Recovered-fibre suppliers', 'Collection network'], ['Logistics', 'Reel transport'], ['Certification', 'FSC and RoHS']]],
  ['Glass recycling', [['Bottlers & fillers', 'Offtake partners'], ['Distributors & hotels', 'Return programmes'], ['Warehouse network', 'Eleven locations, two states'], ['Self-employed collectors', '250 youth supported']]],
]

export default function PartnershipsPage() {
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">Partnerships</p>
        <h1>Stronger<br /><em>together.</em></h1>
        <p className="lede">Strategic partners and alliances across the Group&apos;s three businesses. Partner listings and links are published through the admin as agreements are confirmed.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 16 }}>
        {PARTNERS.map(([g, items], i) => (
          <React.Fragment key={g}>
            <p className="co-kick" style={i ? { marginTop: 34 } : undefined}>{g}</p>
            <div className="partners">{items.map(([b, s]) => <div key={b}><b>{b}</b><span>{s}</span></div>)}</div>
          </React.Fragment>
        ))}
      </section>
      <section className="co-section" style={{ paddingTop: 0 }}>
        <div className="card">
          <p className="co-kick">Work with us</p><h2>Become a partner</h2>
          <p className="lede" style={{ margin: '10px 0 18px' }}>Channel partners, suppliers, distributors and offtake buyers: tell us how you would like to work with the Group.</p>
          <Link className="btn accent" href="/contact">Start a partnership enquiry</Link>
        </div>
      </section>
    </div>
  )
}
