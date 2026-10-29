'use client'

import React, { useState } from 'react'

import { BrochureButton } from '../ui/actions'

export type TabData = {
  slug: string
  name: string
  status: 'ongoing' | 'completed' | 'upcoming'
  possession?: string | null
  rera?: string | null
  location: string
  address?: string | null
  category: 'residential' | 'commercial'
  configurations: { label: string; sizeSqft?: number | null }[]
  floorPlans: { src: string; alt: string }[]
  specs: [string, string][]
  highlights: string[]
  faqs: { q: string; a: string }[]
  brochureUrl?: string | null
}

const TABS = ['Floor plans', 'Specifications', 'Neighbourhood', 'Progress', 'FAQs']

/** Floor plans, specifications, a live map, progress and the published FAQs, as tabs under the gallery. */
export function ProjectTabs({ d }: { d: TabData }) {
  const [t, setT] = useState(0)
  const [unit, setUnit] = useState(0)
  const res = d.category === 'residential'
  const mapQ = encodeURIComponent(`${d.address || d.location}, Hyderabad`)
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Project details">
        {TABS.map((x, i) => <button key={x} role="tab" type="button" aria-selected={t === i} onClick={() => setT(i)}>{x}</button>)}
      </div>
      <div className="tab-pane">
        {t === 0 && (
          <div>
            {d.configurations.length > 0 && (
              <div className="units" role="group" aria-label="Unit">
                {d.configurations.map((c, i) => <button key={i} type="button" className="chip" aria-pressed={unit === i} onClick={() => setUnit(i)}>{c.label}{c.sizeSqft ? ` · ${c.sizeSqft.toLocaleString('en-IN')} sq ft` : ''}</button>)}
              </div>
            )}
            {d.floorPlans[unit] || d.floorPlans[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="plan" src={(d.floorPlans[unit] || d.floorPlans[0]).src} alt={(d.floorPlans[unit] || d.floorPlans[0]).alt} />
            ) : (
              <p className="lede" style={{ fontSize: 'var(--fs-small)' }}>
                {d.configurations.length > 0
                  ? `${d.configurations.length} ${res ? 'configuration' : 'option'}${d.configurations.length > 1 ? 's' : ''}. Drawings are shared by the project team with the brochure.`
                  : 'Floor plates and drawings are shared by the project team with the brochure.'}
              </p>
            )}
            <div className="btn-row" style={{ marginTop: 14 }}>
              <BrochureButton slug={d.slug} name={d.name} url={d.brochureUrl}>Get the full plans</BrochureButton>
            </div>
          </div>
        )}
        {t === 1 && (
          <div className="spec">
            {d.specs.length === 0 && <p className="lede" style={{ fontSize: 'var(--fs-small)' }}>Specifications are published with the brochure.</p>}
            {d.specs.map(([k, v], i) => <details key={k} open={i === 0}><summary>{k}</summary><p>{v}</p></details>)}
            {d.highlights.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p className="eyebrow">Highlights</p>
                <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--ink2)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)' }}>{d.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
              </div>
            )}
          </div>
        )}
        {t === 2 && (
          <div>
            <iframe className="nb-map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${mapQ}&output=embed`} title={`Map of ${d.location}`} />
            <div className="nb-chips"><span><b>Location</b> · {d.location}</span>{d.address && <span><b>Address</b> · {d.address}</span>}</div>
          </div>
        )}
        {t === 3 && (
          <div>
            {d.status === 'ongoing' && (
              <>
                <div className="pt-note"><b>Under construction.</b> {d.possession ? `Possession ${d.possession}.` : 'Possession as per the RERA filing.'} Dates are published targets, not commitments; a consultant confirms the current schedule.</div>
                <div className="prog-row"><small>RERA</small><div>Registered{d.rera ? `: ${d.rera}` : ''}. Progress is published by the project team.</div></div>
                <div className="prog-row"><small>Updates</small><div>Monthly site updates are posted through the admin and shown here.</div></div>
              </>
            )}
            {d.status === 'completed' && (
              <>
                <div className="pt-note"><b>Completed.</b> Handed over and occupied.</div>
                <div className="prog-row"><small>Handover</small><div>Keys and documentation issued; occupancy certificate in place.</div></div>
                {d.rera && <div className="prog-row"><small>RERA</small><div>{d.rera}</div></div>}
              </>
            )}
            {d.status === 'upcoming' && (
              <>
                <div className="pt-note"><b>Upcoming.</b> {d.possession || 'Launch and possession dates are announced on registration.'}</div>
                <div className="prog-row"><small>Now</small><div>Pre-launch registrations open</div></div>
                <div className="prog-row"><small>Launch</small><div>Pricing and allotment; RERA registration published</div></div>
                <div className="prog-row"><small>Handover</small><div>Target possession per the RERA filing</div></div>
              </>
            )}
          </div>
        )}
        {t === 4 && (
          <div className="faq-list">
            {d.faqs.length === 0 && <p className="lede" style={{ fontSize: 'var(--fs-small)' }}>No published questions for this project yet. Ask the AI consultant or book a visit.</p>}
            {d.faqs.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        )}
      </div>
    </>
  )
}
