import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { AskAiButton, BookVisitButton, CountUp } from '@/components/ui/actions'
import { IconHeadset, IconPin } from '@/components/ui/icons'
import { TrioScroll } from '@/components/ui/TrioScroll'
import { getFacts, getSettings, getSiteCopy, getTestimonials, paragraphs } from '@/lib/content'
import type { Fact } from '@/payload-types'

export const dynamic = 'force-dynamic'

const BUSINESSES = [
  { n: '01', t: 'Constructions', href: '/real-estate', d: 'High-end residential and Grade A commercial projects in prime locales of Hyderabad, from Kismatpur to the Financial District.', img: '/img/homedusk.webp', key: 'construction', name: 'Constructions' },
  { n: '02', t: 'Paper', href: '/paper', d: 'Machine-finished kraft paper for the packaging industry across Telangana, Andhra Pradesh and South India.', img: '/img/papermill.webp', key: 'paper', name: 'Paper' },
  { n: '03', t: 'Glass Bottles', href: '/glass', d: 'Empty bottles recovered, washed and supplied back to fillers through a warehouse network in two states.', img: '/img/cullet.webp', key: 'glass', name: 'Glass Bottles' },
]

const PRIORITY: Record<string, number> = { 'Group Metrics': 0, Realty: 1, Paper: 1, 'Bottle Recycling': 1 }
const metrics = (facts: Fact[]) => facts.filter((f) => f.value && f.category in PRIORITY).sort((a, b) => PRIORITY[a.category] - PRIORITY[b.category] || (a.order || 0) - (b.order || 0))

/** Headline metric for a business: Group Metrics first, then the business's own figures, never a timeline year. */
const headline = (facts: Fact[], business: string): Fact | undefined => metrics(facts).find((f) => f.business === business)

/** Up to four supporting figures not already on the home strip, spread across the businesses. */
const strip = (facts: Fact[], exclude: Set<string>): Fact[] => {
  const pool = metrics(facts).filter((f) => !exclude.has(f.id))
  const out: Fact[] = []
  for (const business of ['paper', 'glass', 'construction', 'group']) {
    const f = pool.find((x) => x.business === business && !out.includes(x))
    if (f) out.push(f)
  }
  for (const f of pool) if (out.length < 4 && !out.includes(f)) out.push(f)
  return out.slice(0, 4)
}

export default async function HomePage() {
  const [settings, copy, all, home, testimonials] = await Promise.all([getSettings(), getSiteCopy(), getFacts(), getFacts({ homeOnly: true }), getTestimonials(3)])
  const tagline = settings.tagline || 'Recycling to Realty. A promise as good as gold.'
  const cut = tagline.indexOf('.')
  const [line1, line2] = cut > 0 ? [tagline.slice(0, cut + 1), tagline.slice(cut + 1).trim()] : [tagline, '']
  const figures = home.slice(0, 4)
  const compact = figures.some((f) => (f.value || '').length > 4)
  const support = strip(all, new Set([...figures.map((f) => f.id), ...BUSINESSES.map((b) => headline(all, b.key)?.id || '')]))
  const anySample = testimonials.some((t) => t.sample)
  const intro = paragraphs(copy.homeIntro)
  const since = all.find((f) => f.category === 'History & Timeline' && /since/i.test(f.claim))?.value || '1978'

  return (
    <>
      <section className="trio">
        <div className="trio-art">
          <Image src="/img/art-trio-white.webp" alt="Homes, paper manufacturing and glass recycling as three sculptural scenes" width={1920} height={881} priority className="h-auto w-full" />
          <div className="trio-copy">
            <h1>{line1}{line2 && <><br />{line2}</>}</h1>
            <p>Constructions. Paper. Glass bottles. Since {since}.</p>
          </div>
        </div>
        <div className="trio-links">
          <Link href="/real-estate">Explore Projects <i>↗</i></Link>
          <Link href="/paper">Request Paper Quote <i>↗</i></Link>
          <Link href="/glass">Recycle With Us <i>↗</i></Link>
        </div>
        <div className="trio-foot">
          <BookVisitButton className="trio-visit"><span>Planning a visit?</span><span className="trio-visit-cta">Choose a time <i>↗</i></span></BookVisitButton>
          <TrioScroll />
        </div>
      </section>

      <div className="visit8">
        <div className="wrap">
          <span className="v8-ico"><IconPin /></span>
          <span className="v8-copy"><b>Visit us</b><span>Our consultants are available {settings.hoursText}</span></span>
          <span className="v8-div" />
          <Link className="v8-call" href="/schedule"><span className="v8-ico"><IconHeadset /></span>Schedule a call <i>→</i></Link>
        </div>
      </div>

      <section className="idx" id="businesses">
        <div className="wrap">
          <p className="section-mark">The businesses</p>
          <ol className="idx-list">
            {BUSINESSES.map((b) => (
              <li key={b.n}>
                <Link href={b.href}>
                  <span className="n">{b.n}</span>
                  <span className="t">{b.t}</span>
                  <span className="d">{b.d}</span>
                  <Image className="peek" src={b.img} alt="" width={300} height={184} />
                  <i>→</i>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {intro.length > 0 && (
        <section className="home-about">
          <div className="wrap">
            <div className="home-about-grid">
              <div>
                <p className="section-mark">The Group</p>
                <h2 className="closing-line">Recycling to Realty: a story of diversified growth.</h2>
              </div>
              <div className="home-about-copy">
                {intro.map((p, i) => <p key={i} className="lede">{p}</p>)}
                <p className="btn-row"><Link className="btn accent" href="/about">Our story</Link><Link className="btn ghost" href="/leadership">The leadership</Link></p>
              </div>
            </div>
          </div>
        </section>
      )}

      {figures.length > 0 && (
        <section className="figs">
          <div className="wrap">
            <p className="section-mark">By the numbers</p>
            <div className="figs-row">
              {figures.map((f) => (
                <div key={f.id}>
                  <CountUp value={f.value || ''} className={compact ? 'num sm' : 'num'} />
                  <span>{f.claim}</span>
                </div>
              ))}
            </div>
            <p className="note-line">Approved figures, as published by SDG.</p>
          </div>
        </section>
      )}

      <section className="ledger">
        <div className="wrap">
          <p className="section-mark">Where the work stands</p>
          <div className="ledger-rows">
            {BUSINESSES.map((b, i) => {
              const f = headline(all, b.key)
              return (
                <Link className="lrow" href={b.href} key={b.key}>
                  <span className="l-n">0{i + 1}</span>
                  <span className="l-name">{b.name}</span>
                  <span className="l-big num">{f?.value || '—'}</span>
                  <span className="l-unit">{f ? f.claim.toLowerCase() : b.d}</span>
                  <i className="l-go">→</i>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {(testimonials.length > 0 || copy.b2bBody) && (
        <section className="proof">
          <div className="wrap">
            <p className="section-mark">What buyers and partners say</p>
            {copy.b2bBody && <p className="lede proof-lede">{copy.b2bBody}</p>}
            {support.length > 0 && (
              <div className="proof-strip">
                {support.map((f) => <div key={f.id}><b>{f.value}</b><span>{f.claim}</span></div>)}
              </div>
            )}
            {testimonials.length > 0 && (
              <div className="grid g3" style={{ marginTop: 24 }}>
                {testimonials.map((t) => (
                  <blockquote key={t.id} className="quote2">“{t.quote}”<div className="who"><b>{t.name}</b><span>{t.role}</span></div></blockquote>
                ))}
              </div>
            )}
            {anySample && <p className="note-line" style={{ marginTop: 14 }}>Sample testimonials for layout review, pending SDG-approved content.</p>}
          </div>
        </section>
      )}

      <section className="closing">
        <div className="wrap">
          <p className="section-mark">Talk to us</p>
          <h2 className="closing-line">Come and see a project, or send us a requirement.</h2>
          <p className="closing-sub">Our consultants are available {settings.hoursText}, in Hyderabad.</p>
          <p className="opening-links">
            <BookVisitButton className="">Book a visit <i>→</i></BookVisitButton>
            <AskAiButton className="">Ask SDG <i>→</i></AskAiButton>
          </p>
        </div>
      </section>
    </>
  )
}
