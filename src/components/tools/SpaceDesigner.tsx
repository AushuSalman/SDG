'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import { useUi } from '../ui/UiProvider'

export type SpaceOption = { slug: string; name: string; location: string; status: string; floorPlate?: string | null; saleable?: string | null }

const AREAS = ['5–10k sq ft', '10–25k sq ft', '25k+ sq ft']
const LAYOUTS = ['Open plan', 'Hybrid', 'Cabin-heavy']
const SERVICES = ['Fit-out', 'Cafeteria', '24×7 power', 'Parking']

/** Guided configurator over SDG-defined options. The output is an indicative, watermarked proposal; a binding one needs SDG approval. */
export function SpaceDesigner({ buildings }: { buildings: SpaceOption[] }) {
  const ui = useUi()
  const router = useRouter()
  const [area, setArea] = useState(1)
  const [layout, setLayout] = useState(1)
  const [svc, setSvc] = useState<Set<string>>(new Set(SERVICES.slice(0, 3)))
  const [generated, setGenerated] = useState(false)
  const fit = buildings.slice(0, 2)
  const ref = `SDG-P-${new Date().getFullYear()}-${String(Math.abs((area * 7 + layout * 13 + svc.size * 3) % 900) + 100).padStart(4, '0')}`
  const summary = `Office requirement: ${AREAS[area]}, ${LAYOUTS[layout]} layout, services: ${[...svc].join(', ') || 'none'}. Indicative fit: ${fit.map((b) => b.name).join(' / ') || 'to be advised'}.`
  const request = () => { try { sessionStorage.setItem('sdg-prefill', summary) } catch { /* storage unavailable */ } ui.toast('Requirement attached to your enquiry'); router.push('/contact') }
  const toggle = (s: string) => setSvc((cur) => { const n = new Set(cur); if (n.has(s)) n.delete(s); else n.add(s); return n })

  return (
    <div className="grid g2" style={{ alignItems: 'start' }}>
      <div className="card">
        <div className="steps"><span className="on">1 Space</span><span className="on">2 Layout</span><span className="on">3 Services</span><span className={generated ? 'on' : ''}>4 Proposal</span></div>
        <div className="eyebrow">Area band</div>
        <div className="opt-row">{AREAS.map((o, i) => <button key={o} type="button" className="chip" aria-pressed={area === i} onClick={() => { setArea(i); setGenerated(false) }}>{o}</button>)}</div>
        <div className="eyebrow" style={{ marginTop: 16 }}>Layout type</div>
        <div className="opt-row">{LAYOUTS.map((o, i) => <button key={o} type="button" className="chip" aria-pressed={layout === i} onClick={() => { setLayout(i); setGenerated(false) }}>{o}</button>)}</div>
        <div className="eyebrow" style={{ marginTop: 16 }}>Services</div>
        <div className="opt-row">{SERVICES.map((o) => <button key={o} type="button" className="chip" aria-pressed={svc.has(o)} onClick={() => { toggle(o); setGenerated(false) }}>{o}</button>)}</div>
        <p style={{ marginTop: 18, fontSize: 14 }}>Indicative fit: {fit.length ? fit.map((b, i) => <React.Fragment key={b.slug}>{i > 0 && ' · '}<strong>{b.name}</strong></React.Fragment>) : <strong>to be advised by SDG leasing</strong>}</p>
        <button type="button" className="btn accent" style={{ marginTop: 14 }} onClick={() => { setGenerated(true); ui.toast('Indicative proposal prepared') }}>Generate proposal</button>
      </div>
      <div>
        <div className="doc" aria-live="polite">
          <div className="wm"><span>INDICATIVE — NOT A BINDING OFFER</span></div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#777' }}>PROPOSAL {ref} · v1 {generated ? '' : '· draft'}</div>
          <h3 style={{ margin: '8px 0 14px' }}>Office space: {LAYOUTS[layout]} layout, {AREAS[area]}</h3>
          <div className="row"><span>Recommended building</span><span>{fit[0] ? `${fit[0].name}, ${fit[0].location}` : 'To be advised'}</span></div>
          {fit[0]?.floorPlate && <div className="row"><span>Floor plates</span><span>{fit[0].floorPlate}</span></div>}
          <div className="row"><span>Services</span><span>{[...svc].join(', ') || 'None selected'}</span></div>
          <div className="row"><span>Rent</span><span>On request, confirmed by SDG leasing</span></div>
          <div className="row"><span>Earliest handover</span><span>{fit[0]?.status === 'completed' ? 'Ready, subject to availability' : 'Target, subject to confirmation'}</span></div>
          <p style={{ fontSize: 11.5, color: '#777', marginTop: 14 }}>Generated from SDG-approved options. Not an offer, commitment or representation by SDG.</p>
        </div>
        <div className="approve">
          <span className="state">Awaiting SDG review</span>
          <button type="button" className="btn ghost sm" onClick={request}>Request this proposal</button>
        </div>
        <p className="disclaimer" style={{ marginTop: 10 }}>An SDG representative reviews the requirement and issues the approved proposal on letterhead through your portal.</p>
      </div>
    </div>
  )
}
