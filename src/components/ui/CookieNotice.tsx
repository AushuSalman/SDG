'use client'

import Link from 'next/link'
import React, { useSyncExternalStore } from 'react'

import { useUi } from './UiProvider'

/* The cookie choice lives in localStorage; a tiny store lets React read it without an effect. */
const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb) } }
const undecided = () => { try { return !localStorage.getItem('sdg-cookies') } catch { return true } }
const decide = (c: 'all' | 'essential') => {
  try { localStorage.setItem('sdg-cookies', c) } catch { /* private mode: the notice returns next visit */ }
  listeners.forEach((l) => l())
}

/** Cookie notice. The choice is remembered per browser; analytics only load after consent. */
export function CookieNotice() {
  const ui = useUi()
  const show = useSyncExternalStore(subscribe, undecided, () => false)
  if (!show) return null
  const choose = (c: 'all' | 'essential') => {
    decide(c)
    ui.toast(c === 'all' ? 'Analytics cookies enabled' : 'Essential cookies only')
  }
  return (
    <div className="cookie" role="region" aria-label="Cookie notice">
      <b>Cookies on this site</b><br />
      Essential cookies run the site. With your consent we also use analytics cookies to measure how it performs. <Link href="/privacy">Privacy &amp; cookies</Link>
      <div className="row">
        <button type="button" className="ok" onClick={() => choose('all')}>Accept analytics</button>
        <button type="button" onClick={() => choose('essential')}>Essential only</button>
      </div>
    </div>
  )
}
