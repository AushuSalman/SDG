import type { CollectionSlug, ServerProps, Where } from 'payload'

import Link from 'next/link'
import React from 'react'

import { hasRole } from '@/lib/access'
import type { Customer, Enquiry, Project, User } from '@/payload-types'

import { BusinessDonut, type DonutSlice } from './dashboard/BusinessDonut'
import { type ChartSeries, EnquiriesChart } from './dashboard/EnquiriesChart'
import { Badge } from './tailadmin/Badge'
import { ArrowDownIcon, ArrowUpIcon, BoltIcon, ChatIcon, CheckCircleIcon, DocsIcon, FileIcon, GroupIcon, MailIcon, PencilIcon } from './tailadmin/icons'

type Count = null | number

const BUSINESS = [
  { color: '#465fff', key: 'construction', label: 'Construction' },
  { color: '#0ba5ec', key: 'paper', label: 'Paper' },
  { color: '#12b76a', key: 'glass', label: 'Glass recycling' },
  { color: '#98a2b3', key: 'group', label: 'Group' },
] as const

const TYPE_LABEL: Record<Enquiry['type'], string> = {
  home: 'Home buyer',
  commercial: 'Commercial space',
  'paper-trade': 'Paper trade',
  'glass-supply': 'Glass supply',
  careers: 'Careers',
  general: 'General',
}

type Status = NonNullable<Enquiry['status']>
const STATUS: Record<Status, { color: 'error' | 'info' | 'light' | 'primary' | 'success' | 'warning'; label: string }> = {
  new: { color: 'primary', label: 'New' },
  contacted: { color: 'info', label: 'Contacted' },
  'visit-booked': { color: 'warning', label: 'Visit booked' },
  proposal: { color: 'warning', label: 'Proposal' },
  negotiation: { color: 'warning', label: 'Negotiation' },
  booked: { color: 'success', label: 'Booked' },
  'closed-lost': { color: 'light', label: 'Closed' },
}

const BAND: Record<NonNullable<Enquiry['band']>, { color: 'error' | 'info' | 'warning'; label: string }> = {
  hot: { color: 'error', label: 'Hot' },
  warm: { color: 'warning', label: 'Warm' },
  cold: { color: 'info', label: 'Cold' },
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })
const iso = (d: Date) => d.toISOString()
const pct = (now: number, prev: number) => (prev === 0 ? (now > 0 ? 100 : 0) : Math.round(((now - prev) / prev) * 100))

function greeting(): string {
  const hour = Number(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()))
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/* ---------- small presentational pieces (TailAdmin markup) ---------- */

function Metric({ delta, icon, label, value }: { delta?: number; icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800">{icon}</div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <span className="text-sm text-gray-500">{label}</span>
          <h4 className="mt-2 text-title-sm font-bold text-gray-800">{value}</h4>
        </div>
        {delta !== undefined && (
          <Badge color={delta >= 0 ? 'success' : 'error'}>
            {delta >= 0 ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3 text-error-500" />}
            {Math.abs(delta)}%
          </Badge>
        )}
      </div>
    </div>
  )
}

function Card({ action, children, subtitle, title }: { action?: React.ReactNode; children: React.ReactNode; subtitle?: string; title: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="mt-1 text-theme-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

const outlineBtn = 'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800'
const primaryBtn = 'inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600'

/**
 * The admin home, built from TailAdmin's dashboard pieces on live Payload data: KPI cards, enquiries per month,
 * the work waiting for this role, recent enquiries and the state of the website content. Every query runs with the
 * signed-in user's access, so each role only sees the numbers it is allowed to see.
 */
export async function AdminDashboard({ payload, user }: ServerProps) {
  const me = user as undefined | User
  if (!me) return null
  const admin = payload.config.routes.admin
  const seesLeads = hasRole(me, 'super-admin', 'management', 'sales', 'support')
  const editsContent = hasRole(me, 'super-admin', 'management', 'marketing', 'business-admin')
  const isSuper = hasRole(me, 'super-admin')

  const count = async (collection: CollectionSlug, where?: Where): Promise<Count> => {
    try {
      return (await payload.count({ collection, where, user, overrideAccess: false })).totalDocs
    } catch {
      return null
    }
  }

  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const prevStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1))
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(yearStart.getUTCFullYear(), yearStart.getUTCMonth() + i, 1))
    return { key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: MONTHS[d.getUTCMonth()]! }
  })

  /* ---------- enquiries, chats, customers ---------- */
  let leads: null | {
    chatsLast: Count
    chatsThis: Count
    customers: Count
    fresh: Count
    handoffs: Count
    hot: Count
    recent: Enquiry[]
    series: ChartSeries
    slices: DonutSlice[]
    thisMonth: Count
    lastMonth: Count
    yearTotal: number
  } = null

  if (seesLeads) {
    const between = (from: Date, to?: Date): Where => ({ and: [{ createdAt: { greater_than_equal: iso(from) } }, ...(to ? [{ createdAt: { less_than: iso(to) } }] : [])] })
    const [thisMonth, lastMonth, chatsThis, chatsLast, hot, customers, fresh, handoffs, year, recent] = await Promise.all([
      count('enquiries', between(monthStart)),
      count('enquiries', between(prevStart, monthStart)),
      count('chat-logs', between(monthStart)),
      count('chat-logs', between(prevStart, monthStart)),
      count('enquiries', { and: [{ band: { equals: 'hot' } }, { createdAt: { greater_than_equal: iso(monthStart) } }] }),
      count('customers'),
      count('enquiries', { status: { equals: 'new' } }),
      count('chat-logs', { and: [{ handoff: { equals: true } }, { pickedUpBy: { exists: false } }] }),
      payload
        .find({ collection: 'enquiries', depth: 0, limit: 5000, overrideAccess: false, select: { business: true, createdAt: true }, user, where: between(yearStart) })
        .then((r) => r.docs)
        .catch(() => [] as Pick<Enquiry, 'business' | 'createdAt'>[]),
      payload
        .find({ collection: 'enquiries', depth: 1, limit: 6, overrideAccess: false, sort: '-createdAt', user })
        .then((r) => r.docs)
        .catch(() => [] as Enquiry[]),
    ])

    const perBiz: Record<string, number[]> = Object.fromEntries(BUSINESS.map((b) => [b.key, Array<number>(12).fill(0)]))
    for (const doc of year) {
      const d = new Date(doc.createdAt)
      const idx = months.findIndex((m) => m.key === `${d.getUTCFullYear()}-${d.getUTCMonth()}`)
      if (idx < 0) continue
      ;(perBiz[doc.business] ??= Array<number>(12).fill(0))[idx]!++
    }
    leads = {
      chatsLast,
      chatsThis,
      customers,
      fresh,
      handoffs,
      hot,
      recent,
      series: BUSINESS.map((b) => ({ name: b.label, data: perBiz[b.key]! })),
      slices: BUSINESS.map((b) => ({ color: b.color, label: b.label, value: perBiz[b.key]!.reduce((a, c) => a + c, 0) })),
      thisMonth,
      lastMonth,
      yearTotal: year.length,
    }
  }

  /* ---------- website content ---------- */
  let content: null | { docsOk: Count; docsPending: Count; drafts: Count; rows: { detail: string; done: number; label: string; total: number }[] } = null
  if (editsContent) {
    const [projPub, projDraft, postPub, postDraft, faqPub, faqDraft, docsOk, docsPending, jobsActive, jobsAll, leadersOn, leadersAll, partnersOn, partnersAll] = await Promise.all([
      count('projects', { _status: { equals: 'published' } }),
      count('projects', { _status: { equals: 'draft' } }),
      count('posts', { _status: { equals: 'published' } }),
      count('posts', { _status: { equals: 'draft' } }),
      count('faqs', { _status: { equals: 'published' } }),
      count('faqs', { _status: { equals: 'draft' } }),
      count('documents', { approved: { equals: true } }),
      count('documents', { approved: { equals: false } }),
      count('jobs', { active: { equals: true } }),
      count('jobs'),
      count('leaders', { active: { equals: true } }),
      count('leaders'),
      count('partners', { active: { equals: true } }),
      count('partners'),
    ])
    const row = (label: string, done: Count, pending: Count, doneWord: string, pendingWord: string) => ({
      label,
      done: done ?? 0,
      total: (done ?? 0) + (pending ?? 0),
      detail: `${done ?? 0} ${doneWord} · ${pending ?? 0} ${pendingWord}`,
    })
    const drafts = [projDraft, postDraft, faqDraft].some((n) => n === null) ? null : (projDraft ?? 0) + (postDraft ?? 0) + (faqDraft ?? 0)
    content = {
      docsOk,
      docsPending,
      drafts,
      rows: [
        row('Projects', projPub, projDraft, 'published', 'draft'),
        row('Blog posts', postPub, postDraft, 'published', 'draft'),
        row('FAQs', faqPub, faqDraft, 'published', 'draft'),
        row('Knowledge documents', docsOk, docsPending, 'approved', 'awaiting approval'),
        row('Job openings', jobsActive, jobsAll !== null && jobsActive !== null ? jobsAll - jobsActive : null, 'active', 'inactive'),
        row('Leadership profiles', leadersOn, leadersAll !== null && leadersOn !== null ? leadersAll - leadersOn : null, 'shown', 'hidden'),
        row('Partners', partnersOn, partnersAll !== null && partnersOn !== null ? partnersAll - partnersOn : null, 'shown', 'hidden'),
      ],
    }
  }

  /* ---------- work waiting for this role ---------- */
  type Queue = { count: Count; href: string; icon: React.ReactNode; label: string; text: string }
  const queue: Queue[] = []
  if (leads) {
    queue.push(
      {
        count: leads.fresh,
        href: `${admin}/collections/enquiries?where[or][0][and][0][status][equals]=new&sort=-createdAt`,
        icon: <MailIcon className="size-5" />,
        label: 'Enquiries to call back',
        text: 'New leads nobody has contacted yet',
      },
      {
        count: leads.handoffs,
        href: `${admin}/collections/chat-logs?where[or][0][and][0][handoff][equals]=true&where[or][0][and][1][pickedUpBy][exists]=false&sort=-updatedAt`,
        icon: <ChatIcon className="size-5" />,
        label: 'AI chats handed to sales',
        text: 'The assistant asked for a consultant',
      },
    )
  }
  if (content) {
    queue.push(
      {
        count: content.docsPending,
        href: `${admin}/collections/documents?where[or][0][and][0][approved][equals]=false`,
        icon: <FileIcon className="size-5" />,
        label: 'Documents awaiting approval',
        text: 'The AI quotes a document only once approved',
      },
      {
        count: content.drafts,
        href: `${admin}/collections/projects?where[or][0][and][0][_status][equals]=draft`,
        icon: <PencilIcon className="size-5" />,
        label: 'Drafts not yet published',
        text: 'Projects, blog posts and FAQs hidden from visitors',
      },
    )
  }
  const visibleQueue = queue.filter((q) => q.count !== null)

  const firstName = (me.name || me.email).split(/\s+/)[0]

  return (
    <div className="ta mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          <p className="mt-1 text-theme-sm text-gray-500">
            {greeting()}, {firstName}. Here is what is happening across the SDG website.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editsContent && (
            <>
              <Link href={`${admin}/collections/projects/create`} className={primaryBtn}>
                <span className="text-lg leading-none">+</span> Add project
              </Link>
              <Link href={`${admin}/collections/posts/create`} className={outlineBtn}>
                Write a post
              </Link>
              <Link href={`${admin}/collections/documents/create`} className={outlineBtn}>
                Upload document
              </Link>
            </>
          )}
          {isSuper && (
            <Link href={`${admin}/collections/users/create`} className={outlineBtn}>
              Add staff user
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {leads && (
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              <Metric icon={<MailIcon className="size-6" />} label="Enquiries this month" value={leads.thisMonth ?? 0} delta={pct(leads.thisMonth ?? 0, leads.lastMonth ?? 0)} />
              <Metric icon={<ChatIcon className="size-6" />} label="AI conversations this month" value={leads.chatsThis ?? 0} delta={pct(leads.chatsThis ?? 0, leads.chatsLast ?? 0)} />
              <Metric icon={<BoltIcon className="size-6" />} label="Hot leads this month" value={leads.hot ?? 0} />
              <Metric icon={<GroupIcon className="size-6" />} label="Customers" value={leads.customers ?? 0} />
            </div>
            <EnquiriesChart categories={months.map((m) => m.label)} series={leads.series} total={leads.yearTotal} />
          </div>
        )}

        <div className={`col-span-12 space-y-6 ${leads ? 'xl:col-span-5' : ''}`}>
          <Card title="Work waiting" subtitle="Things that need a person today">
            {visibleQueue.length === 0 ? (
              <p className="text-theme-sm text-gray-500">Nothing is waiting for your role right now.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {visibleQueue.map((q) => (
                  <li key={q.href}>
                    <Link href={q.href} className="group flex items-center gap-4 py-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 group-hover:bg-brand-50 group-hover:text-brand-500">{q.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-theme-sm font-medium text-gray-800">{q.label}</span>
                        <span className="block text-theme-xs text-gray-500">{q.text}</span>
                      </span>
                      <span className={`inline-flex min-w-9 items-center justify-center rounded-full px-2.5 py-1 text-theme-sm font-semibold ${q.count ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {q.count ?? 0}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {leads && <BusinessDonut title="Enquiries by business" subtitle="Share of the last 12 months" slices={leads.slices} />}
        </div>

        {leads && (
          <div className="col-span-12 xl:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Recent enquiries</h3>
                <Link href={`${admin}/collections/enquiries`} className={outlineBtn}>
                  See all
                </Link>
              </div>
              <div className="max-w-full overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-y border-gray-100">
                    <tr>
                      {['Customer', 'Business', 'Type', 'Project', 'Quality', 'Status', 'Date'].map((h) => (
                        <th key={h} className="py-3 pr-4 text-start text-theme-xs font-medium text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leads.recent.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-theme-sm text-gray-500">
                          No enquiries yet. They appear here as soon as a visitor sends one.
                        </td>
                      </tr>
                    )}
                    {leads.recent.map((e) => {
                      const customer = typeof e.customer === 'object' ? (e.customer as Customer) : null
                      const project = e.project && typeof e.project === 'object' ? (e.project as Project) : null
                      const business = BUSINESS.find((b) => b.key === e.business)
                      return (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <Link href={`${admin}/collections/enquiries/${e.id}`} className="block">
                              <span className="block text-theme-sm font-medium text-gray-800">{customer?.name || 'Unnamed'}</span>
                              <span className="block text-theme-xs text-gray-500">{customer?.phone || ''}</span>
                            </Link>
                          </td>
                          <td className="py-3 pr-4 text-theme-sm text-gray-700">{business?.label ?? e.business}</td>
                          <td className="py-3 pr-4 text-theme-sm text-gray-700">{TYPE_LABEL[e.type]}</td>
                          <td className="py-3 pr-4 text-theme-sm text-gray-700">{project?.name ?? '—'}</td>
                          <td className="py-3 pr-4">{e.band ? <Badge size="sm" color={BAND[e.band].color}>{BAND[e.band].label}</Badge> : <span className="text-gray-400">—</span>}</td>
                          <td className="py-3 pr-4">
                            <Badge size="sm" color={STATUS[(e.status ?? 'new') as Status].color}>
                              {STATUS[(e.status ?? 'new') as Status].label}
                            </Badge>
                          </td>
                          <td className="py-3 text-theme-sm text-gray-500">{dateFmt.format(new Date(e.createdAt))}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {content && (
          <div className={`col-span-12 ${leads ? 'xl:col-span-5' : 'xl:col-span-7'}`}>
            <Card
              title="Content on the website"
              subtitle="Published versus still in draft"
              action={
                <Link href={`${admin}/collections/projects`} className={outlineBtn}>
                  Manage
                </Link>
              }
            >
              <ul className="space-y-5">
                {content.rows.map((r) => (
                  <li key={r.label}>
                    <div className="flex items-center justify-between gap-3 text-theme-sm">
                      <span className="font-medium text-gray-800">{r.label}</span>
                      <span className="text-gray-500">{r.detail}</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${r.total ? Math.round((r.done / r.total) * 100) : 0}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-theme-xs text-gray-500">
                <CheckCircleIcon className="mt-px size-4 shrink-0 text-success-500" />
                Content roles save drafts; Management or a Super Admin publishes. The AI assistant only quotes approved documents and facts.
              </p>
            </Card>
          </div>
        )}

        {!leads && !content && (
          <div className="col-span-12">
            <Card title={`Welcome, ${firstName}`}>
              <p className="flex items-center gap-2 text-theme-sm text-gray-500">
                <DocsIcon className="size-5" /> Use the menu on the left to open the sections your role can work in.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
