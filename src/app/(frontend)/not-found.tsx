import Link from 'next/link'
import React from 'react'

import { AskAiButton } from '@/components/ui/actions'

export default function NotFound() {
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 56 }}>
        <p className="co-kick">404</p>
        <h1>We couldn&apos;t find<br /><em>that page.</em></h1>
        <p className="lede">The link may be old, or the page has moved. Try one of these, or ask the AI consultant.</p>
        <div className="btn-row" style={{ marginTop: 18 }}>
          <Link className="btn accent" href="/">Group home</Link>
          <Link className="btn ghost" href="/projects">Projects</Link>
          <Link className="btn ghost" href="/paper">Paper</Link>
          <Link className="btn ghost" href="/glass">Glass recycling</Link>
          <AskAiButton>Ask SDG</AskAiButton>
        </div>
      </section>
    </div>
  )
}
