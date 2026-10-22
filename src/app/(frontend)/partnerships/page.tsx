import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { ClientLogos } from '@/components/ClientLogos'
import { BUSINESS_LABEL, getPartners, getSiteCopy, mediaUrl } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Partnerships', description: 'Strategic partners and alliances across the Group\'s three businesses.' }

const GROUPS: [string, string][] = [['construction', 'Constructions'], ['paper', 'Paper'], ['glass', 'Glass bottles']]

/** Partners from the admin (Website → Partners), grouped by business in display order. */
export default async function PartnershipsPage() {
  const [partners, clients, copy] = await Promise.all([getPartners({ kind: 'partner' }), getPartners({ kind: 'client' }), getSiteCopy()])
  const groups = GROUPS.map(([key, label]) => ({ key, label, items: partners.filter((p) => p.business === key) })).filter((g) => g.items.length > 0)
  const clientGroups = GROUPS.map(([key]) => ({ key, items: clients.filter((p) => p.business === key) })).filter((g) => g.items.length > 0)
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">Partnerships</p>
        <h1>Stronger<br /><em>together.</em></h1>
        <p className="lede">{copy.b2bBody || 'Strategic partners and alliances across the Group\'s businesses.'}</p>
      </section>
      <section className="co-section" style={{ paddingTop: 16 }}>
        {groups.length === 0 && <p className="notice">Partners are added in the admin under Website → Partners.</p>}
        {groups.map((g, i) => (
          <React.Fragment key={g.key}>
            <p className="co-kick" style={i ? { marginTop: 34 } : undefined}>{g.label}</p>
            <div className="partners">
              {g.items.map((p) => {
                const logo = mediaUrl(p.logo, 'thumb')
                const inner = (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {logo && <img className="partner-logo" src={logo} alt="" loading="lazy" />}
                    <b>{p.name}</b>
                    {p.summary && <span>{p.summary}</span>}
                  </>
                )
                return p.url ? <a key={p.id} href={p.url} target="_blank" rel="noreferrer">{inner}</a> : <div key={p.id}>{inner}</div>
              })}
            </div>
          </React.Fragment>
        ))}
      </section>
      {clientGroups.length > 0 && (
        <section className="co-section" style={{ paddingTop: 0 }}>
          <h2 style={{ marginBottom: 8 }}>Clients and occupiers.</h2>
          {clientGroups.map((g) => <div key={g.key} style={{ marginTop: 28 }}><ClientLogos clients={g.items} title={BUSINESS_LABEL[g.key]} /></div>)}
        </section>
      )}
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
