import type { Metadata } from 'next'
import Image from 'next/image'
import React from 'react'

import { ContactForm } from '@/components/ContactForm'
import { FaqSection } from '@/components/FaqSection'
import { IconCalendar, IconHeadset, IconPhone } from '@/components/ui/icons'
import { BUSINESS_LABEL, getConsultants, getFaqs, getProjects, getSettings } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Contact', description: 'Talk to the right SDG desk first time: construction, paper trade or glass recycling.' }

export default async function ContactPage() {
  const [settings, projects, consultants, faqs] = await Promise.all([getSettings(), getProjects({ business: 'construction' }), getConsultants(), getFaqs({ business: 'group' })])
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 28 }}>
        <p className="co-kick">Contact</p>
        <h1>Talk to the right person, first time</h1>
        <p className="lede">Tell us which business you are enquiring about: constructions, paper or glass bottles. Your message is routed to the SDG consultant for that business and written straight into the CRM.</p>
      </section>
      <div className="grid g2" style={{ alignItems: 'start', paddingBottom: 56 }}>
        <ContactForm projects={projects.map((p) => ({ slug: p.slug, name: p.name }))} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="ph" style={{ aspectRatio: '16 / 9' }}><Image src="/img/hero.webp" alt="SDG head office, VSD Tech Park, Financial District" width={1200} height={675} /><span className="lbl tag">Head office · Hyderabad</span></div>
            <div style={{ padding: '20px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="cline"><span className="ci"><IconPhone /></span><div><b>Call us</b><span><a href={`tel:${(settings.phone || '').replace(/[^+\d]/g, '')}`}>{settings.phone}</a></span></div></div>
              <div className="cline"><span className="ci"><IconHeadset /></span><div><b>Reach us</b><span><a href={`mailto:${settings.email}`}>{settings.email}</a></span></div></div>
              <div className="cline"><span className="ci"><IconCalendar /></span><div><b>Site visits</b><span>{settings.hoursText}</span></div></div>
              <p style={{ fontSize: 14, color: 'var(--ink2)', whiteSpace: 'pre-line' }}>{settings.headOffice}</p>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 10 }}>Per-business desks</h3>
            <div className="mlist" style={{ margin: 0 }}>
              {consultants.map((c, i) => <div key={c.id}><span>0{i + 1}</span><b>{c.name} · {c.businesses.map((b) => BUSINESS_LABEL[b]).join(', ')}{c.phone ? ` · ${c.phone}` : ''}</b></div>)}
            </div>
            <p className="disclaimer" style={{ marginTop: 14 }}>Each enquiry is allocated to the desk for its business and project.</p>
          </div>
        </div>
      </div>
      {faqs.length > 0 && (
        <section className="co-section" style={{ paddingTop: 0 }}>
          <FaqSection faqs={faqs} title="Common questions." />
        </section>
      )}
    </div>
  )
}
