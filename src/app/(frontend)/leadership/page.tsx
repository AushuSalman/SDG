import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = { title: 'Leadership', description: 'The people behind Suvarna Durga Group.' }

/* From the client's fact sheet. Photographs are supplied by SDG and added through the admin. */
const LEADERS = [
  ['Dr. J. Srinivasa Reddy', 'Managing Director', 'Group', 'MBBS, MD, MBA (ISB). Developed the Group multifold, expanded capacities and founded the construction and realty vertical.'],
  ['J. Sanjeev Reddy', 'Director', 'Construction', 'B.Tech. Construction experience that strengthens the construction and realty vertical.'],
  ['P. Koti Reddy', 'Director', 'Glass Recycling', 'Experience in bottling and recycling supporting the bottle recycling and paper mills.'],
  ['J. Subhaskara Reddy', 'Director', 'Paper', 'M.Com. Sales, procurement and operations across the paper mills vertical.'],
  ['J. Chandrasekhar Reddy', 'Director', 'Paper', 'MS (USA). Oversees expansion, the customer base and day-to-day operations of Suvarna Durga Paper Mills.'],
]
const initials = (n: string) => n.replace(/^Dr\.\s*/, '').split(' ').filter((x) => x.length > 1).map((x) => x[0]).join('').slice(0, 3)

export default function LeadershipPage() {
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">Leadership</p>
        <h1>The people<br /><em>behind the Group.</em></h1>
        <p className="lede">Founded by Sri Jakkireddy Subba Reddy in 1978 and led today by the second generation across construction, paper and glass. Photographs are being supplied by SDG and are added through the admin.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 16 }}>
        <div className="people">
          {LEADERS.map(([n, r, v, b]) => (
            <div className="person" key={n}>
              <div className="ph" aria-hidden>{initials(n)}</div>
              <small>{v}</small>
              <b>{n}</b>
              <span className="tbc">{r}</span>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
