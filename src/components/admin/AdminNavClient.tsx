'use client'

import { useNav, usePreferences } from '@payloadcms/ui'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PREFERENCE_KEYS } from 'payload/shared'
import React, { useEffect } from 'react'

import {
  BoxCubeIcon,
  BoxIconLine,
  CallIcon,
  ChatIcon,
  CheckCircleIcon,
  DocsIcon,
  FileIcon,
  FolderIcon,
  GridIcon,
  GroupIcon,
  ListIcon,
  MailIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  ShootingStarIcon,
  type SvgProps,
  TaskIcon,
  UserCircleIcon,
  UserIcon,
} from './tailadmin/icons'

export type IconName =
  | 'box-cube'
  | 'docs'
  | 'task'
  | 'star'
  | 'list'
  | 'check-circle'
  | 'folder'
  | 'plug-in'
  | 'mail'
  | 'group'
  | 'chat'
  | 'user-circle'
  | 'file'
  | 'user'
  | 'pie-chart'
  | 'page'
  | 'box'
  | 'call'

export type NavItem = { href: string; icon: IconName; label: string; slug: string }
export type NavSection = { items: NavItem[]; label: string }
export type NavUser = { email: string; name: string; role: string }

const ICONS: Record<IconName, React.FC<SvgProps>> = {
  'box-cube': BoxCubeIcon,
  docs: DocsIcon,
  task: TaskIcon,
  star: ShootingStarIcon,
  list: ListIcon,
  'check-circle': CheckCircleIcon,
  folder: FolderIcon,
  'plug-in': PlugInIcon,
  mail: MailIcon,
  group: GroupIcon,
  chat: ChatIcon,
  'user-circle': UserCircleIcon,
  file: FileIcon,
  user: UserIcon,
  'pie-chart': PieChartIcon,
  page: PageIcon,
  box: BoxIconLine,
  call: CallIcon,
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

/**
 * TailAdmin's sidebar rendered inside Payload's nav wrapper, so Payload's open/close state, mobile overlay and
 * saved preference keep working; only the look and the content are ours.
 */
export function AdminNavClient({ adminRoute, sections, user }: { adminRoute: string; sections: NavSection[]; user: NavUser }) {
  const { hydrated, navOpen, navRef, setNavOpen, shouldAnimate } = useNav()
  const { getPreference } = usePreferences()
  const pathname = usePathname() || ''

  // Payload only opens the sidebar by default above 1440px. TailAdmin shows it from 1280px, so on desktop widths
  // open it on load unless the user has explicitly closed it (Payload stores that choice as a preference).
  useEffect(() => {
    if (window.innerWidth < 1280) return
    let cancelled = false
    getPreference<{ open?: boolean }>(PREFERENCE_KEYS.NAV)
      .then((pref) => {
        if (!cancelled && pref?.open !== false) setNavOpen(true)
      })
      .catch(() => {
        if (!cancelled) setNavOpen(true)
      })
    return () => {
      cancelled = true
    }
  }, [getPreference, setNavOpen])
  const classes = ['nav', navOpen && 'nav--nav-open', shouldAnimate && 'nav--nav-animate', hydrated && 'nav--nav-hydrated'].filter(Boolean).join(' ')
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <aside className={classes} inert={!navOpen ? true : undefined}>
      <div className="nav__scroll ta flex h-full flex-col bg-white" ref={navRef}>
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <Link href={adminRoute} className="flex items-center" aria-label="Dashboard">
            <Image src="/img/sdg-logo.webp" alt="SDG · Suvarna Durga Group" width={132} height={48} className="h-11 w-auto" priority />
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="flex size-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
            aria-label="Close menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4" aria-label="Admin sections">
          <h2 className="mb-3 text-xs uppercase leading-5 text-gray-400">Menu</h2>
          <ul className="mb-6 flex flex-col gap-1">
            <li>
              <Link href={adminRoute} className={`menu-item group ${pathname === adminRoute ? 'menu-item-active' : 'menu-item-inactive'}`}>
                <span className={pathname === adminRoute ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
                  <GridIcon className="size-6" />
                </span>
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>

          {sections.map((section) => (
            <div key={section.label}>
              <h2 className="mb-3 text-xs uppercase leading-5 text-gray-400">{section.label}</h2>
              <ul className="mb-6 flex flex-col gap-1">
                {section.items.map((item) => {
                  const Icon = ICONS[item.icon]
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link href={item.href} className={`menu-item group ${active ? 'menu-item-active' : 'menu-item-inactive'}`}>
                        <span className={active ? 'menu-item-icon-active' : 'menu-item-icon-inactive'}>
                          <Icon className="size-6" />
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-500">{initialsOf(user.name) || 'S'}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{user.name}</p>
              <p className="truncate text-xs text-gray-500">{user.role || user.email}</p>
            </div>
            <Link
              href={`${adminRoute}/logout`}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-error-500"
              aria-label="Sign out"
              title="Sign out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View website
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </aside>
  )
}
