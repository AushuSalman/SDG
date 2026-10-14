'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { BookVisitButton } from '../ui/actions'

export type PdProject = {
  slug: string; name: string; location: string; address?: string | null; category: 'residential' | 'commercial'; status: 'ongoing' | 'completed' | 'upcoming'
  img: string; summary: string; size: string; price: string | null; minCr?: number | null; maxCr?: number | null; possession: string; rera: string
}

const BUDGETS: [string, string][] = [['any', 'Any budget'], ['u1', 'Under ₹1 Cr'], ['1-2', '₹1 – 2 Cr'], ['2-3.5', '₹2 – 3.5 Cr'], ['3.5+', 'Above ₹3.5 Cr']]
const RANGE: Record<string, [number, number]> = { u1: [0, 1], '1-2': [1, 2], '2-3.5': [2, 3.5], '3.5+': [3.5, 99] }
const ORDER: Record<string, number> = { completed: 0, ongoing: 1, upcoming: 2 }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Every project with type, status, budget and area filters, sorting, and a list or map view. */
export function ProjectsDiscovery({ projects }: { projects: PdProject[] }) {
  const [st, setSt] = useState({ type: 'All', status: 'All', budget: 'any', loc: 'All', sort: 'featured', view: 'list' })
  const [pin, setPin] = useState(0)
  const locs = useMemo(() => [...new Set(projects.map((p) => p.location))], [projects])
  const list = useMemo(() => {
    let l = projects.filter((p) =>
      (st.type === 'All' || p.category === st.type.toLowerCase()) && (st.status === 'All' || p.status === st.status.toLowerCase()) && (st.loc === 'All' || p.location === st.loc) &&
      (st.budget === 'any' || (p.minCr != null && p.maxCr != null && p.maxCr >= RANGE[st.budget][0] && p.minCr <= RANGE[st.budget][1])))
    if (st.sort === 'price') l = l.slice().sort((a, b) => (a.minCr ?? 99) - (b.minCr ?? 99))
    if (st.sort === 'poss') l = l.slice().sort((a, b) => ORDER[a.status] - ORDER[b.status])
    return l
  }, [projects, st])
  const sel = list[Math.min(pin, Math.max(0, list.length - 1))]
  const group = (f: 'type' | 'status', opts: string[], labels?: Record<string, string>) => (
    <div className="pd-group" role="group" aria-label={f}>
      {opts.map((v) => <button key={v} type="button" aria-pressed={st[f] === v} onClick={() => setSt({ ...st, [f]: v })}>{labels?.[v] || v}</button>)}
    </div>
  )
  return (
    <>
      <div className="pd-bar">
        {group('type', ['All', 'Residential', 'Commercial'])}
        {group('status', ['All', 'Completed', 'Ongoing', 'Upcoming'], { All: 'Any status' })}
        <select aria-label="Budget" value={st.budget} onChange={(e) => setSt({ ...st, budget: e.target.value })}>{BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <select aria-label="Location" value={st.loc} onChange={(e) => setSt({ ...st, loc: e.target.value })}><option value="All">All areas</option>{locs.map((l) => <option key={l}>{l}</option>)}</select>
        <select aria-label="Sort" value={st.sort} onChange={(e) => setSt({ ...st, sort: e.target.value })}><option value="featured">Featured</option><option value="price">Price: low to high</option><option value="poss">Possession: soonest</option></select>
        <div className="pd-group" role="group" aria-label="View">
          <button type="button" aria-pressed={st.view === 'list'} onClick={() => setSt({ ...st, view: 'list' })}>List</button>
          <button type="button" aria-pressed={st.view === 'map'} onClick={() => setSt({ ...st, view: 'map' })}>Map</button>
        </div>
      </div>
      <p className="pd-count" aria-live="polite">Showing {list.length} of {projects.length} projects</p>
      {st.view === 'list' ? (
        <div className="pd-grid">
          {list.length === 0 && <p className="re-empty">No projects match those filters. Try widening the budget or status.</p>}
          {list.map((p) => (
            <article className="pd-card" key={p.slug}>
              <Link className="pd-img" href={`/projects/${p.slug}`}><Image src={p.img} alt="" width={960} height={600} /><span className="tag">{cap(p.status)}</span></Link>
              <div className="pd-body">
                <span className="eyebrow">{cap(p.category)} · {p.location}</span>
                <h3><Link href={`/projects/${p.slug}`}>{p.name}</Link></h3>
                <p>{p.summary}</p>
                <dl className="pd-meta">
                  <dt>{p.category === 'residential' ? 'Configurations' : 'Space'}</dt><dd>{p.size}</dd>
                  {p.price && <><dt>Price band</dt><dd>{p.price}</dd></>}
                  <dt>Possession</dt><dd>{p.possession}</dd>
                  <dt>RERA</dt><dd className="num">{p.rera}</dd>
                </dl>
                <div className="pd-actions"><Link className="btn accent sm" href={`/projects/${p.slug}`}>View project</Link><BookVisitButton className="btn ghost sm" project={p.slug}>Book a visit</BookVisitButton></div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="pd-map">
          {sel ? (
            <iframe className="nb-map" style={{ aspectRatio: '16 / 11' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(`${sel.address || sel.location}, Hyderabad`)}&output=embed`} title={`Map of ${sel.name}`} />
          ) : <p className="re-empty">No projects to show on the map.</p>}
          <div className="map-list">
            {list.map((p, i) => (
              <button key={p.slug} type="button" className="map-row" aria-pressed={sel?.slug === p.slug} onClick={() => setPin(i)}>
                <b>{p.name}</b><span>{p.location} · {cap(p.status)}{p.price ? ` · ${p.price}` : ''}</span>
              </button>
            ))}
            {sel && <Link className="btn ghost sm" style={{ marginTop: 12, alignSelf: 'flex-start' }} href={`/projects/${sel.slug}`}>Open {sel.name}</Link>}
          </div>
        </div>
      )}
    </>
  )
}
