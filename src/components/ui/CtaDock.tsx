'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { useUi } from './UiProvider'

/** Persistent quick actions: trade enquiry on Paper and Glass, site visit everywhere else; hidden on the pages that are the action. */
export function CtaDock() {
  const path = usePathname() || '/'
  const ui = useUi()
  if (path === '/schedule' || path === '/contact' || path.startsWith('/admin')) return null
  const trade = path.startsWith('/paper') || path.startsWith('/glass')
  const wa = `https://wa.me/${ui.whatsapp}?text=${encodeURIComponent("Hi SDG, I'd like to know more.")}`
  const primary = () => {
    if (trade) {
      const f = document.getElementById('enquire')
      if (f) { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => f.querySelector<HTMLElement>('select, input')?.focus({ preventScroll: true }), 500); return }
    }
    const pm = path.match(/^\/projects\/([^/]+)/)
    ui.openBooking({ project: pm?.[1] })
  }
  return (
    <div className="cta-dock" role="region" aria-label="Quick actions">
      <button type="button" className="dk-btn primary" onClick={primary}>{trade ? 'Trade enquiry' : 'Book a visit'}</button>
      <Link className="dk-btn" href="/schedule">Schedule a call</Link>
      <a className="dk-btn wa" href={wa} target="_blank" rel="noopener">WhatsApp</a>
    </div>
  )
}
