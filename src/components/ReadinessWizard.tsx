'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

import { AskAiButton, BookVisitButton } from './ui/actions'

export type WizProject = { slug: string; name: string; location: string; category: 'residential' | 'commercial'; status: string; img: string; minCr?: number | null; maxCr?: number | null }

type Opt = [string, number, string?]
const WIZ: { q: string; k: string; o: Opt[] }[] = [
  { q: 'What are you looking to do?', k: 'intent', o: [['Buy a home', 3, 'res'], ['Lease office or retail space', 2, 'com'], ['Invest for rental income', 2, 'inv'], ['Just exploring for now', 0, 'res']] },
  { q: 'What budget band are you working with?', k: 'budget', o: [['Under ₹1 Cr', 1, 'low'], ['₹1 – 2 Cr', 2, 'mid'], ['₹2 – 3.5 Cr', 3, 'high'], ['Above ₹3.5 Cr', 3, 'top'], ['Prefer not to say', 0, 'na']] },
  { q: 'Where would you like to be?', k: 'area', o: [['Kokapet / Golden Mile', 1, 'kokapet'], ['Financial District / Raidurg', 1, 'fd'], ['Kismatpur / south-west', 1, 'sw'], ['Anywhere in Hyderabad', 1, 'any'], ['Not sure yet', 0, 'any']] },
  { q: 'When do you want to move in or sign?', k: 'when', o: [['Within 3 months', 3], ['3 – 6 months', 2], ['6 – 12 months', 1], ['More than a year away', 0]] },
  { q: 'How are you placed on financing and a site visit?', k: 'ready', o: [['Loan pre-approved or self-funded; can visit this week', 3], ['Need home-loan help; can visit this month', 2], ['Need loan help; will visit later', 1], ['Not ready to visit yet', 0]] },
]
const MAX = WIZ.reduce((t, q) => t + Math.max(...q.o.map((o) => o[1])), 0)
const AREA_MATCH: Record<string, RegExp> = { kokapet: /kokapet|golden mile/i, fd: /financial district|raidurg|nanakramguda/i, sw: /kismatpur/i }

/** Five questions, rules-based scoring and two matched projects. Nothing is sent until the visitor chooses a next step. */
export function ReadinessWizard({ projects }: { projects: WizProject[] }) {
  const [i, setI] = useState(0)
  const [a, setA] = useState<Record<string, { j: number; pts: number; tag?: string }>>({})
  const [done, setDone] = useState(false)
  const q = WIZ[i]

  const recommend = () => {
    const com = a.intent?.tag === 'com'
    const list = projects.filter((p) => (com ? p.category === 'commercial' : p.category === 'residential' && p.status !== 'completed'))
    const budget = a.budget?.tag, area = a.area?.tag
    const rank = (p: WizProject) => {
      let r = 0
      if (area && AREA_MATCH[area]?.test(p.location)) r += 2
      if (!com && p.minCr != null && p.maxCr != null) {
        const want: Record<string, [number, number]> = { low: [0, 1], mid: [1, 2], high: [2, 3.5], top: [3.5, 99] }
        if (budget && want[budget] && p.maxCr >= want[budget][0] && p.minCr <= want[budget][1]) r += 2
      }
      return -r
    }
    return list.sort((x, y) => rank(x) - rank(y)).slice(0, 2)
  }

  if (done) {
    const score = Object.values(a).reduce((t, x) => t + x.pts, 0)
    const tier = score >= 9 ? ['Ready to move', 'Book a site visit this week; a consultant and the numbers will be ready for you.'] : score >= 5 ? ['Actively exploring', 'Shortlist two projects and schedule a call; a consultant walks you through both.'] : ['Early stage', 'Keep exploring. Ask the AI consultant anything, and we send brochures as projects launch.']
    const recs = recommend()
    const com = a.intent?.tag === 'com'
    try { sessionStorage.setItem('sdg-readiness', JSON.stringify({ tier: tier[0], score, max: MAX, recs: recs.map((p) => p.name) })) } catch { /* storage unavailable */ }
    return (
      <div className="wiz">
        <div className="wiz-bar"><i style={{ width: '100%' }} /></div>
        <p className="wiz-step">Your result</p>
        <h3>{tier[0]}</h3>
        <div className="score"><div className="ring2" style={{ ['--p' as string]: `${Math.round((score / MAX) * 100)}%` }}><span>{score}/{MAX}</span></div><p className="lede" style={{ fontSize: 'var(--fs-small)', margin: 0 }}>{tier[1]}</p></div>
        {recs.length > 0 && (
          <>
            <p className="co-kick">Recommended for you</p>
            <div className="re-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {recs.map((p, k) => (
                <Link key={p.slug} className="re-card" href={`/projects/${p.slug}`} style={{ ['--i' as string]: k }}>
                  <span className="re-card-img"><Image src={p.img} alt="" width={960} height={640} /></span>
                  <h3>{p.name}</h3><p className="re-loc">{p.location}</p>
                  <span className="re-view">View Project<i aria-hidden>↗</i></span>
                </Link>
              ))}
            </div>
          </>
        )}
        <div className="btn-row" style={{ marginTop: 18 }}>
          {score >= 5 && <BookVisitButton project={recs[0]?.slug}>Book a site visit</BookVisitButton>}
          <Link className={`btn ${score >= 5 ? 'ghost' : 'accent'}`} href={`/schedule?desk=${com ? 'construction' : 'construction'}`}>Schedule a call</Link>
          <AskAiButton question="I just did the readiness check. What should I look at first?">Ask the AI consultant</AskAiButton>
        </div>
        <p className="disclaimer" style={{ marginTop: 14 }}>Indicative recommendation; it does not reserve or guarantee availability. Your answers travel with your enquiry when you book or schedule.</p>
        <div className="wiz-nav"><button type="button" className="btn ghost" onClick={() => { setI(0); setA({}); setDone(false) }}>Start over</button></div>
      </div>
    )
  }

  return (
    <div className="wiz">
      <div className="wiz-bar"><i style={{ width: `${(i / WIZ.length) * 100}%` }} /></div>
      <p className="wiz-step">Question {i + 1} of {WIZ.length}</p>
      <h3>{q.q}</h3>
      <div className="opt">
        {q.o.map((o, j) => <button key={o[0]} type="button" aria-pressed={a[q.k]?.j === j} onClick={() => setA({ ...a, [q.k]: { j, pts: o[1], tag: o[2] } })}>{o[0]}</button>)}
      </div>
      <div className="wiz-nav">
        <button type="button" className="btn ghost" hidden={i === 0} onClick={() => setI(i - 1)}>Back</button>
        <button type="button" className="btn accent" disabled={!a[q.k]} onClick={() => (i < WIZ.length - 1 ? setI(i + 1) : setDone(true))}>{i === WIZ.length - 1 ? 'See my result' : 'Next'}</button>
      </div>
    </div>
  )
}
