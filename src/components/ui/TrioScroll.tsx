'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

const TRIO = [
  { name: 'Homes', href: '/real-estate' },
  { name: 'Paper', href: '/paper' },
  { name: 'Glass', href: '/glass' },
]

/** Home hero control: each dash is a business, the label links to the active one, auto-advances every four seconds. */
export function TrioScroll() {
  const [i, setI] = useState(-1)
  const hold = useRef(false)
  const nav = useRef<HTMLElement>(null)
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const first = setTimeout(() => setI((v) => (v < 0 ? 0 : v)), reduce ? 0 : 1800)
    if (reduce) return () => clearTimeout(first)
    const t = setInterval(() => { if (!hold.current) setI((v) => (v + 1) % TRIO.length) }, 4000)
    return () => { clearTimeout(first); clearInterval(t) }
  }, [])
  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('.trio-links a')
    links.forEach((l, k) => l.classList.toggle('on', k === i))
  }, [i])
  const it = i >= 0 ? TRIO[i] : null
  return (
    <nav
      ref={nav}
      className="trio-scroll"
      aria-label="Explore the businesses"
      onMouseEnter={() => { hold.current = true }}
      onMouseLeave={() => { hold.current = false }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') setI((v) => (v + 1 + TRIO.length) % TRIO.length); if (e.key === 'ArrowLeft') setI((v) => (v - 1 + TRIO.length) % TRIO.length) }}
    >
      <Link className="trio-go" href={it ? it.href : '/real-estate'}>
        {it ? <><span className="n">0{i + 1} / 0{TRIO.length}</span>Explore {it.name} <i>↗</i></> : 'Explore our businesses'}
      </Link>
      <span className="trio-dashes">
        {TRIO.map((t, k) => (
          <Link key={t.href} href={t.href} className={k === i ? 'on' : ''} aria-label={t.name} onMouseEnter={() => setI(k)} onFocus={() => setI(k)}><i /></Link>
        ))}
      </span>
    </nav>
  )
}
