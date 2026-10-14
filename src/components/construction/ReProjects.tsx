'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useState } from 'react'

export type ReProject = { slug: string; name: string; location: string; category: 'residential' | 'commercial'; status: 'ongoing' | 'completed' | 'upcoming'; img: string }

const FILTERS = ['All', 'Residential', 'Commercial', 'Completed', 'Ongoing', 'Upcoming'] as const
const match = (p: ReProject, f: string) => f === 'All' || p.category === f.toLowerCase() || p.status === f.toLowerCase()
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Project gallery with counted filters and a soft fade between sets. */
export function ReProjects({ projects }: { projects: ReProject[] }) {
  const [cur, setCur] = useState<string>('All')
  const [shown, setShown] = useState<string>('All')
  const [out, setOut] = useState(false)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)
  const choose = (f: string) => {
    if (f === cur) return
    setCur(f)
    if (t.current) clearTimeout(t.current)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(f); return }
    setOut(true)
    t.current = setTimeout(() => { setShown(f); setOut(false) }, 180)
  }
  const hits = projects.filter((p) => match(p, shown))
  return (
    <>
      <div className="re-filters" role="group" aria-label="Filter projects">
        {FILTERS.map((f) => (
          <button key={f} type="button" className="re-filter" aria-pressed={cur === f} onClick={() => choose(f)}>
            {f} ({projects.filter((p) => match(p, f)).length})
          </button>
        ))}
      </div>
      <p className="sr" aria-live="polite">Showing {hits.length} {shown === 'All' ? '' : shown.toLowerCase() + ' '}project{hits.length === 1 ? '' : 's'}</p>
      <div className={`re-grid ${out ? 'is-out' : ''}`}>
        {hits.length === 0 && <p className="re-empty">No projects in this category yet.</p>}
        {hits.map((p, i) => (
          <Link key={p.slug + shown} className="re-card" href={`/projects/${p.slug}`} style={{ ['--i' as string]: i }}>
            <span className="re-card-img"><Image src={p.img} alt="" width={960} height={640} /></span>
            <h3>{p.name}</h3>
            <p className="re-loc">{p.location}</p>
            <dl className="re-tags">
              <dt>Property type</dt><dd className={`re-t-${p.category}`}>{cap(p.category)}</dd>
              <dt>Status</dt><dd className={`re-s-${p.status}`}>{cap(p.status)}</dd>
            </dl>
            <span className="re-view">View Project<i aria-hidden>↗</i></span>
          </Link>
        ))}
      </div>
      <p className="re-note">RERA registration numbers are published on every project page.</p>
    </>
  )
}
