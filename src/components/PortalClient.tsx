'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { post } from '@/lib/client/enquiry'

import { BookVisitButton } from './ui/actions'
import { useUi } from './ui/UiProvider'

type Enquiry = { id: string; createdAt: string; business: string; type: string; project: { name: string; slug: string } | null; status: string; otpVerified: boolean; visitReady: boolean; message: string | null; consultant: { name: string; phone?: string | null } | null }
type Data = { phone: string; name?: string; email?: string | null; consent: boolean; enquiries: Enquiry[] }

const STAGES = ['Enquiry', 'Site visit', 'Unit selection', 'Booking', 'Agreement', 'Payment', 'Construction progress', 'Demand notes', 'Registration', 'Possession', 'Post-sales support']
const STAGE_OF: Record<string, number> = { new: 0, contacted: 0, 'visit-booked': 1, proposal: 2, negotiation: 2, booked: 3, 'closed-lost': 0 }
const TABS: [string, string][] = [['overview', 'Overview'], ['enquiries', 'Enquiries'], ['visits', 'Visits'], ['support', 'Support'], ['prefs', 'Preferences']]
const nice = (s: string) => s.replace(/-/g, ' ')
const when = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/** OTP sign-in, then the journey: enquiries, visits, support and consent preferences. */
export function PortalClient() {
  const ui = useUi()
  const [state, setState] = useState<'loading' | 'login' | 'otp' | 'in'>('loading')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [mockCode, setMockCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [data, setData] = useState<Data | null>(null)
  const [tab, setTab] = useState('overview')
  const [ticket, setTicket] = useState({ subject: '', details: '' })

  async function load() {
    const res = await fetch('/api/site/portal')
    if (res.ok) { setData(await res.json()); setState('in') } else setState('login')
  }
  useEffect(() => {
    let live = true
    fetch('/api/site/portal').then(async (res) => {
      if (!live) return
      if (res.ok) { setData(await res.json()); setState('in') } else setState('login')
    }).catch(() => { if (live) setState('login') })
    return () => { live = false }
  }, [])

  async function sendCode(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (phone.replace(/\D/g, '').length < 10) return setError('Enter a valid mobile number.')
    setBusy(true)
    try { const r = await post<{ mockCode?: string }>('/api/site/otp/send', { phone, purpose: 'portal' }); if (r.mockCode) setMockCode(r.mockCode); setState('otp') }
    catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await post('/api/site/otp/verify', { phone, code, purpose: 'portal' }); await load(); ui.toast('Signed in') }
    catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }
  async function logout() { await fetch('/api/site/portal', { method: 'DELETE' }); setData(null); setState('login'); ui.toast('Signed out') }
  async function setConsent(v: boolean) {
    try {
      const res = await fetch('/api/site/portal', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ consent: v }) })
      if (!res.ok) throw new Error('Could not save your preference')
      setData((d) => (d ? { ...d, consent: v } : d)); ui.toast(v ? 'Consent recorded' : 'Consent withdrawn. We will not contact you.')
    } catch (err) { ui.toast((err as Error).message) }
  }
  async function raiseTicket(e: React.FormEvent) {
    e.preventDefault()
    if (!ticket.subject.trim() || !data) return
    try {
      await post('/api/site/enquire', { phone: data.phone, name: data.name || 'Portal user', business: 'group', type: 'general', message: `Support: ${ticket.subject}\n${ticket.details}`.trim(), consent: true, source: { channel: 'website', landingPage: '/portal' } })
      setTicket({ subject: '', details: '' }); ui.toast('Ticket raised. Support replies within one business day.', 5000); await load()
    } catch (err) { ui.toast((err as Error).message) }
  }

  if (state === 'loading') return <p className="lede">Loading…</p>

  if (state !== 'in') {
    return (
      <div className="grid g2" style={{ alignItems: 'start', gap: 32 }}>
        <form className="card" onSubmit={state === 'login' ? sendCode : verify} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span className="eyebrow">Sign in</span><h3>Your SDG portal</h3>
          <div className="fld"><label htmlFor="lgPhone">Mobile number</label><input id="lgPhone" placeholder="+91" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={state === 'otp'} /></div>
          {state === 'otp' && (
            <div className="fld"><label htmlFor="lgOtp">One-time password</label><input id="lgOtp" placeholder="6-digit code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} />
              {mockCode && <p className="notice" style={{ marginTop: 8 }}>Development mode: your code is <b>{mockCode}</b>.</p>}
            </div>
          )}
          <p className="form-err" role="alert">{error}</p>
          <div className="btn-row"><button className="btn accent" type="submit" disabled={busy}>{busy ? 'Please wait…' : state === 'login' ? 'Send OTP' : 'Verify and sign in'}</button>{state === 'otp' && <button type="button" className="btn ghost" onClick={() => setState('login')}>Change number</button>}</div>
        </form>
        <div>
          <p className="co-kick">What you&apos;ll find inside</p>
          <div className="mlist">
            <div><span>01</span><b>Your enquiries, site visits and callbacks in one timeline, synced from the CRM.</b></div>
            <div><span>02</span><b>Which consultant is handling each enquiry, and how to reach them.</b></div>
            <div><span>03</span><b>A direct line to support, with your tickets tracked.</b></div>
            <div><span>04</span><b>Your consent and contact preferences, changeable at any time.</b></div>
          </div>
        </div>
      </div>
    )
  }

  const d = data!
  const latest = d.enquiries[0]
  const visits = d.enquiries.filter((e) => e.visitReady || /site visit requested/i.test(e.message || ''))
  const initials = (d.name || 'SDG').split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="pt-layout">
      <nav className="pt-nav" aria-label="Portal">
        <div className="pt-user"><div className="av">{initials}</div><div><b>{d.name || 'Welcome'}</b><br /><span>{d.phone}</span></div></div>
        {TABS.map(([k, l]) => <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}
        <button type="button" className="pt-out" onClick={logout}>Sign out</button>
      </nav>
      <div className="pt-pane">
        {tab === 'overview' && (
          <>
            <h3>{latest ? (latest.project?.name || nice(latest.business)) : 'Your journey with SDG'}</h3>
            <p className="lede" style={{ fontSize: 14, marginBottom: 18 }}>{latest ? 'Stages sync from the CRM as your consultant updates them.' : 'No enquiries yet for this number. Start one on any project page.'}</p>
            {latest && (
              <ol className="stages">
                {STAGES.map((s, i) => { const st = STAGE_OF[latest.status] ?? 0; return (
                  <li key={s} className={i < st ? 'done' : i === st ? 'now' : ''}><span className="dot" /><div>{s}{i === 0 && <><br /><small>{when(latest.createdAt)}{latest.otpVerified ? ' · verified' : ' · verification pending'}</small></>}{i === 1 && latest.consultant && <><br /><small>with {latest.consultant.name}</small></>}</div><small>{i < st ? 'Done' : i === st ? 'Now' : ''}</small></li>
                ) })}
              </ol>
            )}
            {!latest && <BookVisitButton>Book a site visit</BookVisitButton>}
          </>
        )}
        {tab === 'enquiries' && (
          <>
            <h3>Enquiries</h3>
            {d.enquiries.length === 0 ? <p className="lede" style={{ fontSize: 14 }}>No enquiries yet for this number.</p> : (
              <table className="plain"><thead><tr><th>Date</th><th>Enquiry</th><th>Status</th><th>Consultant</th></tr></thead><tbody>
                {d.enquiries.map((e) => <tr key={e.id}><td className="num">{when(e.createdAt)}</td><td>{e.project ? <Link className="plainlink" href={`/projects/${e.project.slug}`}>{e.project.name}</Link> : nice(e.business)} · {nice(e.type)}</td><td><span className={`state ${e.status === 'booked' ? 'ok' : ''}`}>{nice(e.status)}</span></td><td>{e.consultant?.name || 'Being allocated'}</td></tr>)}
              </tbody></table>
            )}
          </>
        )}
        {tab === 'visits' && (
          <>
            <h3>Visits</h3>
            {visits.length === 0 ? <p className="lede" style={{ fontSize: 14 }}>No upcoming visits. <BookVisitButton className="plainlink">Book one</BookVisitButton>.</p> : visits.map((e) => (
              <div className="pt-note" key={e.id}><b>{e.project?.name || nice(e.business)}</b><br />{e.message || 'Site visit requested'}<br /><small style={{ color: 'var(--muted)' }}>Status: {nice(e.status)}{e.consultant ? ` · ${e.consultant.name}` : ''}</small></div>
            ))}
            <div className="btn-row" style={{ marginTop: 14 }}><BookVisitButton className="btn ghost sm">Book another visit</BookVisitButton><Link className="btn ghost sm" href="/schedule">Schedule a call</Link></div>
          </>
        )}
        {tab === 'support' && (
          <>
            <h3>Support</h3>
            <div className="status"><i />Enquiry and CRM sync<span className="r">Operational</span></div>
            <div className="status"><i />Site-visit booking<span className="r">Operational</span></div>
            <div className="status"><i />AI consultant<span className="r">Operational</span></div>
            <p className="co-kick" style={{ marginTop: 22 }}>Your tickets</p>
            {d.enquiries.filter((e) => /^Support:/.test(e.message || '')).map((e) => <div className="status" key={e.id}>{(e.message || '').split('\n')[0].replace(/^Support:\s*/, '')}<span className="r">{nice(e.status)} · {when(e.createdAt)}</span></div>)}
            <form className="trade-form" onSubmit={raiseTicket} noValidate style={{ marginTop: 18 }}>
              <div className="fld full"><label htmlFor="tkSub">Raise a ticket</label><input id="tkSub" placeholder="What is the problem?" value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} /></div>
              <div className="fld full"><label htmlFor="tkMsg">Details</label><textarea id="tkMsg" rows={2} value={ticket.details} onChange={(e) => setTicket({ ...ticket, details: e.target.value })} /></div>
              <div className="foot"><button className="btn accent" type="submit">Submit</button><span style={{ fontSize: 13, color: 'var(--muted)' }}>Support replies within one business day.</span></div>
            </form>
          </>
        )}
        {tab === 'prefs' && (
          <>
            <h3>Preferences</h3>
            <label className="tg"><span>Contact me about my enquiries (call, SMS, WhatsApp)</span><input type="checkbox" checked={d.consent} onChange={(e) => setConsent(e.target.checked)} /></label>
            <label className="tg"><span>Email updates{d.email ? ` to ${d.email}` : ''}</span><input type="checkbox" checked={d.consent && Boolean(d.email)} disabled={!d.email} readOnly /></label>
            <p className="disclaimer" style={{ marginTop: 14 }}>Consent is recorded against your number with a timestamp. Withdraw it here at any time; we keep your enquiry history so a consultant can pick it up again if you return.</p>
          </>
        )}
      </div>
    </div>
  )
}
