import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { ClientLogos } from '@/components/ClientLogos'
import { ReProjects } from '@/components/construction/ReProjects'
import { VisitBandForm } from '@/components/construction/VisitBandForm'
import { FaqSection } from '@/components/FaqSection'
import { SectionBar } from '@/components/SectionBar'
import { BookVisitButton, ScrollLink } from '@/components/ui/actions'
import { RE_STEP_ICONS } from '@/components/ui/icons'
import { getFacts, getFaqs, getPartners, getProjects, getSettings, getSiteCopy, projectImage } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Constructions', description: 'Suvarna Durga Constructions: commercial projects now leasing and residential projects under construction in Hyderabad. VSD Tech Park, Centrum, Premise, Prinia and Trilight.' }

const STEPS = [
  ['Planning & Design', 'Understanding your goals and creating detailed plans.'],
  ['Site Preparation', 'Preparing and levelling the site for construction.'],
  ['Structural Construction', 'Building a strong and durable foundation and structure.'],
  ['Building Services', 'Installing essential electrical, plumbing and mechanical systems.'],
  ['Finishing', 'High-quality finishes that bring your space to life.'],
  ['Quality & Safety', 'Ongoing inspections to ensure the highest standards.'],
  ['Project Handover', 'A smooth handover and a space ready for life.'],
]

export default async function RealEstatePage() {
  const [projects, settings, copy, realty, metrics, faqs, clients] = await Promise.all([
    getProjects({ business: 'construction' }),
    getSettings(),
    getSiteCopy(),
    getFacts({ category: 'Realty' }),
    getFacts({ category: 'Group Metrics', business: 'construction' }),
    getFaqs({ business: 'construction', generalOnly: true }),
    getPartners({ kind: 'client', business: 'construction' }),
  ])
  // Approved construction numbers for the strip; wording-only Realty facts as lines under it.
  const figures = [...metrics.filter((f) => f.business === 'construction' && f.value), ...realty.filter((f) => f.value)].slice(0, 4)
  const lines = realty.filter((f) => !f.value)
  const cards = [...projects].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))).map((p) => ({ slug: p.slug, name: p.name, location: p.location, category: p.category, status: p.status, img: projectImage(p, 'card') }))
  const leasing = projects.filter((p) => p.category === 'commercial' && p.status === 'completed')
  return (
    <div className="re-page" id="re-top">
      <SectionBar
        sub="Constructions" variant="caps" label="Constructions"
        links={[{ to: 're-about', label: 'About' }, { to: 're-projects', label: 'Projects' }, { to: 're-process', label: 'Our Process' }, { to: 'site-foot', label: 'Contact' }]}
        cta={<Link className="btn accent sm" href="/contact">Enquire <i aria-hidden>→</i></Link>}
      />

      <section className="re-hero" id="re-about">
        <Image className="re-hero-img" src="/img/sdg/construction-hero.jpg" alt="VSD Tech Park at twilight, Financial District, Hyderabad" width={1600} height={900} priority />
        <div className="re-hero-copy">
          <h1>From vision<br /><em>to completion.</em></h1>
          <span className="re-rule" aria-hidden />
          <p>{copy.constructionIntro || 'Thoughtfully planned. Carefully built. Ready for life.'}</p>
          <div className="re-cta">
            <Link className="btn" href="/projects">Explore Projects <i aria-hidden>→</i></Link>
            <ScrollLink to="re-visit" focus="vbproject" className="btn ghost">Book a Site Visit</ScrollLink>
          </div>
        </div>
      </section>

      <div className="trio-foot">
        <BookVisitButton className="trio-visit"><span>Planning a visit?</span><span className="trio-visit-cta">Choose a time <i>↗</i></span></BookVisitButton>
        <ScrollLink to="re-process" className="trio-scroll"><span>See the process</span><span className="trio-dashes"><i className="on" /><i /><i /></span></ScrollLink>
      </div>

      {leasing.length > 0 && (
        <section className="re-leasing">
          <div className="wrap-wide">
            <p className="re-kick">Now leasing</p>
            <div className="re-leasing-grid">
              {leasing.map((p) => (
                <Link key={p.slug} className="re-lease" href={`/projects/${p.slug}`}>
                  <span className="re-lease-img"><Image src={projectImage(p, 'card')} alt="" width={960} height={640} /></span>
                  <span className="re-lease-copy">
                    <span className="eyebrow">{p.location}{p.rera ? ` · RERA ${p.rera}` : ''}</span>
                    <h2>{p.name}</h2>
                    {p.tagline && <p>{p.tagline}</p>}
                    <ul>
                      {p.specs?.saleableArea && <li>Saleable area: {p.specs.saleableArea}</li>}
                      {p.specs?.floors && <li>{p.specs.floors}</li>}
                      {p.specs?.floorPlate && <li>Floor plates {p.specs.floorPlate}</li>}
                      {p.specs?.certification && <li>{p.specs.certification}</li>}
                    </ul>
                    <span className="re-view">View project<i aria-hidden>↗</i></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="re-process" id="re-process">
        <div className="wrap-wide">
          <p className="re-kick">Our process</p>
          <h2>From planning to handover.</h2>
          <div className="re-steps">
            {STEPS.map(([t, d], i) => {
              const Icon = RE_STEP_ICONS[i]
              return (
                <div className="re-step" key={t}>
                  <span className="pico"><Icon /></span>
                  <span className="pnum">0{i + 1}</span>
                  <b>{t}</b>
                  <small>{d}</small>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {(figures.length > 0 || lines.length > 0) && (
        <section className="re-facts">
          <div className="wrap-wide">
            <p className="re-kick">By the numbers</p>
            {figures.length > 0 && <div className="figs-row re-figs">{figures.map((f) => <div key={f.id}><b className="sm">{f.value}</b><span>{f.claim}</span></div>)}</div>}
            {lines.map((f) => <p key={f.id} className="re-fact-line">{f.wording}</p>)}
          </div>
        </section>
      )}

      <section className="re-projects" id="re-projects">
        <div className="wrap-wide">
          <div className="re-head">
            <div><p className="re-kick">Projects</p><h2>Explore our projects.</h2></div>
            <Link className="plainlink" href="/projects">All projects, filters and map <i>↗</i></Link>
          </div>
          {cards.length === 0 ? <p className="notice">Projects appear here once they are published in the admin.</p> : <ReProjects projects={cards} />}
        </div>
      </section>

      {clients.length > 0 && (
        <section className="re-clients">
          <div className="wrap-wide"><ClientLogos clients={clients} kickClass="re-kick" title="Clients and occupiers" /></div>
        </section>
      )}

      <section className="re-tools" id="re-tools">
        <div className="wrap-wide">
          <p className="re-kick">Plan your move</p>
          <h2>Tools before you talk to us.</h2>
          <div className="grid g3" style={{ marginTop: 22 }}>
            <Link className="tool" href="/readiness"><span className="co-kick">2 minutes</span><h3>Buyer-readiness check</h3><p>Five questions, a recommendation and the right next step.</p><span className="go">Start →</span></Link>
            <Link className="tool" href="/projects/prinia#tools"><span className="co-kick">Decision tools</span><h3>EMI, bills and house tax</h3><p>Run the numbers on an SDG home before you visit.</p><span className="go">Open →</span></Link>
            <Link className="tool" href="/roi"><span className="co-kick">Investors &amp; occupiers</span><h3>ROI calculator</h3><p>Indicative yields and returns for leasing or investing in SDG space.</p><span className="go">Calculate →</span></Link>
          </div>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="re-faq">
          <div className="wrap-wide"><FaqSection faqs={faqs} kickClass="re-kick" title="Before you visit." /></div>
        </section>
      )}

      <section className="re-band" id="re-visit">
        <div className="wrap-wide">
          <div className="re-band-copy">
            <h2>See your future space in person.</h2>
            <span className="re-rule" />
            <p>Site visits {settings.hoursText}. Choose a preferred slot and our team confirms it with you.</p>
          </div>
          <VisitBandForm />
        </div>
      </section>
    </div>
  )
}
