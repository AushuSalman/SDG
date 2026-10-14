'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { IconSearch, IconShare } from './ui/icons'
import { useUi } from './ui/UiProvider'

const BUSINESSES = [
  { href: '/real-estate', label: 'Construction' },
  { href: '/paper', label: 'Paper' },
  { href: '/glass', label: 'Glass Recycling' },
]
const ABOUT = [
  { href: '/about', label: 'Our story' },
  { href: '/leadership', label: 'Leadership' },
  { href: '/partnerships', label: 'Partnerships' },
  { href: '/careers', label: 'Careers' },
]

function Drop({ id, label, items, path, open, onToggle }: { id: string; label: string; items: { href: string; label: string }[]; path: string; open: boolean; onToggle: () => void }) {
  const current = items.some((i) => path === i.href || path.startsWith(i.href + '/')) || (id === 'biz' && path.startsWith('/projects'))
  return (
    <span className={`navdrop ${open ? 'open' : ''}`}>
      <button type="button" className="navtrigger" aria-expanded={open} aria-controls={`menu-${id}`} style={current ? { color: 'var(--ink)', boxShadow: 'inset 0 -1px 0 var(--gold)' } : undefined} onClick={onToggle}>
        {label} <i>▾</i>
      </button>
      <span className="navmenu" id={`menu-${id}`} role="menu">
        {items.map((i) => <Link key={i.href} href={i.href} role="menuitem">{i.label}</Link>)}
      </span>
    </span>
  )
}

/** Group header: logo, the six-entry menu with two dropdowns, share and ask icons, and the gold pill. */
export function SiteHeader() {
  const path = usePathname() || '/'
  const ui = useUi()
  // The open menu remembers the path it was opened on, so navigating closes it without an effect.
  const [opened, setOpened] = useState<{ id: string; at: string } | null>(null)
  const open = opened && opened.at === path ? opened.id : null
  const setOpen = (id: string | null) => setOpened(id ? { id, at: path } : null)

  useEffect(() => {
    // React delegates events on `document`, so stopPropagation cannot shield the trigger: check the target instead.
    const close = (e: MouseEvent) => { if ((e.target as Element | null)?.closest?.('.navdrop')) return; setOpened(null) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpened(null) }
    document.addEventListener('click', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc) }
  }, [])

  const cur = (href: string) => (path === href ? 'page' : undefined)

  return (
    <header className="site">
      <div className="wrap-wide">
        <Link href="/" className="brand" aria-label="SDG, Suvarna Durga Group, home">
          <Image src="/img/sdg-logo.webp" alt="SDG · Suvarna Durga Group" width={350} height={128} priority className="logo-img" />
        </Link>
        <nav className="main" aria-label="Group">
          <Link href="/" aria-current={cur('/')}>Home</Link>
          <Drop id="biz" label="Our Businesses" items={BUSINESSES} path={path} open={open === 'biz'} onToggle={() => setOpen(open === 'biz' ? null : 'biz')} />
          <Drop id="about" label="About" items={ABOUT} path={path} open={open === 'about'} onToggle={() => setOpen(open === 'about' ? null : 'about')} />
          <Link href="/portal" aria-current={cur('/portal')}>My Portal</Link>
          <Link href="/blog" aria-current={path.startsWith('/blog') ? 'page' : undefined}>Blogs</Link>
          <Link href="/contact" aria-current={cur('/contact')}>Contact</Link>
        </nav>
        <button type="button" className="hdr-icon" aria-label="Share this page" title="Share" onClick={() => ui.openShare()}><IconShare /></button>
        <button type="button" className="hdr-icon" aria-label="Ask SDG" title="Ask SDG" onClick={() => ui.openAI()}><IconSearch /></button>
        <Link href="/contact" className="hdr-pill">Start a conversation <i>↗</i></Link>
      </div>
    </header>
  )
}
