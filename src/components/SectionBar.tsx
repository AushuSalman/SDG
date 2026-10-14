import Link from 'next/link'
import React from 'react'

import { ScrollLink } from './ui/actions'

type L = { to: string; label: string; focus?: string }

/** The business pages' own header bar: brand lockup, in-page links and the section's call to action. */
export function SectionBar({ brand = 'SDG Group', sub, variant = 'rule', links, cta, label }: { brand?: string; sub: string; variant?: 'rule' | 'caps' | 'dashes' | 'centre'; links: L[]; cta: React.ReactNode; label: string }) {
  const cls = variant === 'caps' ? 'sec-brand caps' : variant === 'dashes' ? 'sec-brand dashes' : variant === 'centre' ? 'sec-brand centre' : 'sec-brand'
  return (
    <nav className="sec-bar" aria-label={label}>
      <div className="wrap-wide">
        <Link className={cls} href="#top" aria-label={`${brand} ${sub}, top of page`}>
          {variant === 'centre' ? <><b>{brand}</b><small>{sub}</small></> : <span><b>{brand}</b><small>{sub}</small></span>}
        </Link>
        <span className="sec-links">
          {links.map((l) => <ScrollLink key={l.to + l.label} to={l.to} focus={l.focus}>{l.label}</ScrollLink>)}
          {cta}
        </span>
      </div>
    </nav>
  )
}
