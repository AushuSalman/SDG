import type { Metadata } from 'next'
import React from 'react'

import { BUSINESS_LABEL, getFacts, getLeaders, getSiteCopy, mediaUrl, paragraphs } from '@/lib/content'
import type { Leader } from '@/payload-types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Leadership', description: 'The leadership and management team behind Suvarna Durga Group.' }

const initials = (n: string) => n.replace(/^Dr\.\s*/, '').split(' ').filter((x) => x.length > 1).map((x) => x[0]).join('').slice(0, 3)

function People({ leaders }: { leaders: Leader[] }) {
  return (
    <div className="people">
      {leaders.map((l) => {
        const photo = mediaUrl(l.photo, 'card')
        return (
          <div className="person" key={l.id}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="ph" src={photo} alt={l.name} loading="lazy" />
            ) : (
              <div className="ph" aria-hidden>{initials(l.name)}</div>
            )}
            <small>{BUSINESS_LABEL[l.business || 'group']}</small>
            <b>{l.name}</b>
            <span className="tbc">{l.role}{l.qualifications ? ` · ${l.qualifications}` : ''}</span>
            {l.bio && <p>{l.bio}</p>}
          </div>
        )
      })}
    </div>
  )
}

/** Leadership profiles from the admin (Website → Leadership) in two blocks, with the Group's own words above them. */
export default async function LeadershipPage() {
  const [leaders, facts, copy] = await Promise.all([getLeaders(), getFacts({ category: 'Leadership' }), getSiteCopy()])
  const board = leaders.filter((l) => (l.section || 'leadership') === 'leadership')
  const management = leaders.filter((l) => l.section === 'management')
  const success = paragraphs(copy.successBody)
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">Leadership</p>
        <h1>A history of<br /><em>posting success.</em></h1>
        {success.length === 0 && <p className="lede">Founded by Sri Jakkireddy Subbareddy in 1978 and led today by the second generation across constructions, paper and glass bottles.</p>}
        {success.map((p, i) => <p key={i} className="lede" style={{ marginTop: i ? 10 : undefined }}>{p}</p>)}
        {facts.map((f) => <p key={f.id} className="lede" style={{ marginTop: 10 }}>{f.wording}</p>)}
      </section>
      <section className="co-section" style={{ paddingTop: 16 }}>
        {leaders.length === 0 && <p className="notice">Leadership profiles are added in the admin under Website → Leadership.</p>}
        {board.length > 0 && <><p className="co-kick">The leadership</p><People leaders={board} /></>}
        {management.length > 0 && <><p className="co-kick" style={{ marginTop: 48 }}>Management team</p><People leaders={management} /></>}
      </section>
    </div>
  )
}
