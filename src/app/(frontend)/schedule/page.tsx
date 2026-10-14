import type { Metadata } from 'next'
import React from 'react'

import { Scheduler, type Desk } from '@/components/Scheduler'
import { getConsultants, getSettings } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Book a meeting', description: 'Book a call or a meeting with the right SDG consultant for your enquiry.' }

const MODES: Record<string, string[]> = {
  construction: ['In person at the site', 'Video call', 'Phone call'],
  paper: ['Mill visit', 'Video call', 'Phone call'],
  glass: ['Warehouse visit', 'Video call', 'Phone call'],
}
const TITLE: Record<string, string> = { construction: 'Buying a home or leasing space', paper: 'Paper trade enquiry', glass: 'Glass supply or offtake' }
const TYPE: Record<string, string> = { construction: 'home', paper: 'paper-trade', glass: 'glass-supply' }

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ desk?: string }> }) {
  const [consultants, settings, sp] = await Promise.all([getConsultants(), getSettings(), searchParams])
  const desks: Desk[] = consultants.map((c) => {
    const b = c.businesses[0] || 'construction'
    return { id: String(c.id), business: b, title: TITLE[b], name: c.name, role: `${c.locations?.map((l) => l.name).join(', ') || 'Hyderabad'} · ${c.hoursFrom || '10:00'}–${c.hoursTo || '18:00'} IST`, modes: MODES[b], type: TYPE[b] }
  })
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 0 }}>
        <p className="co-kick">Book a meeting</p>
        <h1>Talk to the<br /><em>right person.</em></h1>
        <p className="lede">Tell us what you need and we route you to the SDG consultant for that business. Confirmation by phone and WhatsApp.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 24 }}>
        {desks.length === 0 ? <p className="notice">Consultant desks are set up in the admin; the scheduler opens once they are.</p> : <Scheduler desks={desks} preselect={sp.desk} hoursText={settings.hoursText || 'Mon–Sat, 09:30 – 18:30 IST'} />}
      </section>
    </div>
  )
}
