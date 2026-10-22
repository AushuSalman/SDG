'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

import { captureSource, post } from '@/lib/client/enquiry'

import { useUi } from './ui/UiProvider'

export type Desk = { id: string; business: 'construction' | 'paper' | 'glass'; title: string; name: string; role: string; modes: string[]; type: string; slots: string[] }

const days = (): Date[] => { const out: Date[] = []; const d = new Date(); d.setHours(12, 0, 0, 0); while (out.length < 6) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) out.push(new Date(d)) } return out }
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const EMPTY = new Set<string>()
const stamp = (x: Date) => { const p = (n: number) => String(n).padStart(2, '0'); return `${x.getFullYear()}${p(x.getMonth() + 1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00` }

/** Meeting scheduler: pick the desk, how to meet and a slot, then confirm by OTP. Calendar invites follow. */
export function Scheduler({ desks, preselect, hoursText, slots: defaultSlots }: { desks: Desk[]; preselect?: string; hoursText: string; slots: string[] }) {
  const ui = useUi()
  const [desk, setDesk] = useState<Desk | null>(desks.find((d) => d.id === preselect || d.business === preselect) || null)
  const [mode, setMode] = useState<string | null>(null)
  const [slot, setSlot] = useState<{ di: number; s: string } | null>(null)
  const [f, setF] = useState({ name: '', phone: '', email: '', note: '', consent: false })
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form')
  const [code, setCode] = useState('')
  const [mockCode, setMockCode] = useState('')
  const [enquiryId, setEnquiryId] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const D = useMemo(() => days(), [])
  // The chosen consultant's own hours, else the group's consultation hours from Site settings.
  const slots = desk?.slots.length ? desk.slots : defaultSlots
  // Slots already taken on the consultant's connected Outlook calendar ("YYYY-MM-DD HH:MM"), kept with the desk
  // they were fetched for so switching desks never shows the previous desk's bookings.
  const [fetched, setFetched] = useState<{ deskId: string; slots: Set<string> } | null>(null)
  useEffect(() => {
    if (!desk) return
    let live = true
    fetch(`/api/site/calendar/busy?consultant=${encodeURIComponent(desk.id)}&from=${iso(D[0])}&to=${iso(D[D.length - 1])}`)
      .then((r) => r.json())
      .then((j: { busy?: string[] }) => { if (live) setFetched({ deskId: desk.id, slots: new Set(j.busy || []) }) })
      .catch(() => {})
    return () => { live = false }
  }, [desk, D])
  const taken = fetched && desk && fetched.deskId === desk.id ? fetched.slots : EMPTY
  const source = useMemo(() => captureSource(), [])
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

  const booking = desk && slot && mode ? { date: iso(D[slot.di]), time: slot.s, mode, desk } : null
  const summary = booking ? `Call requested: ${fmt(D[slot!.di])} at ${booking.time} IST · ${booking.mode} · ${booking.desk.name}${f.note ? ` · ${f.note}` : ''}` : ''
  const body = () => ({
    phone: f.phone, name: f.name, email: f.email || undefined, business: desk!.business, type: desk!.type, timeline: '0-3m', message: summary, consent: true, source,
    meeting: booking ? { date: booking.date, time: booking.time, mode: booking.mode, consultantId: booking.desk.id } : undefined,
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (f.name.trim().length < 2) return setErr('Please tell us your name.')
    if (f.phone.replace(/\D/g, '').length < 10) return setErr('Enter a valid mobile number.')
    if (!f.consent) return setErr('Please tick the consent box so we can confirm the meeting.')
    setErr(''); setBusy(true)
    try {
      const saved = await post<{ id: string }>('/api/site/enquire', body())
      setEnquiryId(saved.id)
      const otp = await post<{ mockCode?: string }>('/api/site/otp/send', { phone: f.phone, purpose: 'enquiry' })
      if (otp.mockCode) setMockCode(otp.mockCode)
      setStep('otp')
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const r = await post<{ token: string }>('/api/site/otp/verify', { phone: f.phone, code, purpose: 'enquiry' })
      await post('/api/site/enquire', { ...body(), token: r.token, enquiryId })
      setStep('done'); ui.toast('Meeting requested. The consultant confirms the slot with you.', 5000); window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }

  if (step === 'done' && booking) {
    const d = new Date(`${booking.date}T${booking.time}:00`), e = new Date(d.getTime() + 45 * 60000)
    const whenText = `${d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at ${booking.time} IST`
    const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`SDG consultation, ${booking.desk.title}`)}&dates=${stamp(d)}/${stamp(e)}&ctz=Asia/Kolkata&details=${encodeURIComponent(`With ${booking.desk.name} · ${booking.mode}`)}&location=${encodeURIComponent('Suvarna Durga Group, Hyderabad')}`
    const download = () => {
      // The timestamped fields are built here, in the click handler, so rendering stays pure.
      const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SDG//Platform//EN', 'BEGIN:VEVENT', `UID:${booking.date}-${booking.time.replace(':', '')}-${Date.now()}@sdg`, `DTSTAMP:${stamp(new Date())}`, `DTSTART;TZID=Asia/Kolkata:${stamp(d)}`, `DTEND;TZID=Asia/Kolkata:${stamp(e)}`, `SUMMARY:SDG consultation, ${booking.desk.title}`, `LOCATION:${booking.mode}`, `DESCRIPTION:With ${booking.desk.name}. Requested on the SDG website.`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'sdg-meeting.ics'; document.body.appendChild(a); a.click(); a.remove()
    }
    return (
      <div className="card">
        <p className="co-kick">Requested</p><h2>{whenText}</h2>
        <p className="lede" style={{ marginTop: 8 }}>{booking.desk.title} with <b>{booking.desk.name}</b> · {booking.mode}. The consultant confirms the slot on {f.phone}; a WhatsApp confirmation follows.</p>
        <div className="btn-row" style={{ marginTop: 18 }}><button type="button" className="btn accent" onClick={download}>Download .ics</button><a className="btn ghost" href={gcal} target="_blank" rel="noopener">Add to Google Calendar</a><Link className="btn ghost" href="/portal">See it in your portal</Link></div>
        <p className="co-kick" style={{ marginTop: 24 }}>WhatsApp confirmation (preview)</p>
        <div className="wa-prev">Hi {f.name.split(' ')[0] || 'there'}, your SDG consultation is requested for {whenText} ({booking.mode}) with {booking.desk.name}. We confirm shortly. Reply R to reschedule. — Suvarna Durga Group</div>
      </div>
    )
  }

  return (
    <div className="card">
      <p className="co-kick">1 — What do you need?</p>
      <div className="pick">{desks.map((d) => <button key={d.id} type="button" aria-pressed={desk?.id === d.id} onClick={() => { setDesk(d); setMode(null); setSlot(null) }}><b>{d.title}</b><span>{d.role}</span></button>)}</div>
      {desk && (
        <>
          <p className="co-kick" style={{ marginTop: 26 }}>2 — Your consultant</p>
          <div className="cons"><div className="av">{desk.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}</div><div><b>{desk.name}</b><br /><span style={{ color: 'var(--muted)', fontSize: 14 }}>{desk.role}</span></div></div>
          <p className="co-kick" style={{ marginTop: 26 }}>3 — How would you like to meet?</p>
          <div className="chips-row">{desk.modes.map((m) => <button key={m} type="button" className="chip" aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>)}</div>
          <p className="co-kick" style={{ marginTop: 26 }}>4 — Pick a slot</p>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>{hoursText}. Your consultant confirms the slot against their calendar.</p>
          <div className="wk-wrap"><div className="wk">
            {D.map((d) => <div className="dh" key={iso(d)}>{d.toLocaleDateString('en-IN', { weekday: 'short' })}<b>{d.getDate()} {d.toLocaleDateString('en-IN', { month: 'short' })}</b></div>)}
            {slots.map((s) => D.map((d, di) => {
              const busySlot = taken.has(`${iso(d)} ${s}`)
              return <button key={s + di} type="button" disabled={busySlot} title={busySlot ? 'Already booked' : undefined} aria-pressed={slot?.di === di && slot?.s === s} onClick={() => { setSlot({ di, s }); if (!mode) ui.toast('Choose how you would like to meet (step 3) to continue') }}>{busySlot ? 'Booked' : s}</button>
            }))}
          </div></div>
          <p className="wk-hint">Swipe sideways for more days →{taken.size > 0 ? ' · Greyed slots are already booked on the consultant\'s calendar.' : ''}</p>
        </>
      )}
      {booking && step === 'form' && (
        <>
          <p className="co-kick" style={{ marginTop: 26 }}>5 — Your details</p>
          <form className="trade-form" onSubmit={submit} noValidate style={{ marginTop: 10 }}>
            <div className="fld"><label htmlFor="scName">Name</label><input id="scName" placeholder="Your full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
            <div className="fld"><label htmlFor="scPhone">Phone</label><input id="scPhone" placeholder="+91" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></div>
            <div className="fld"><label htmlFor="scMail">Email</label><input id="scMail" type="email" placeholder="you@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
            <div className="fld full"><label htmlFor="scNote">What would you like to cover?</label><input id="scNote" placeholder="Optional" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
            <div className="foot"><label className="consent" style={{ margin: 0 }}><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> I agree to be contacted about this meeting. We verify your number by SMS.</label></div>
            <div className="foot"><button className="btn accent" type="submit" disabled={busy}>{busy ? 'Saving…' : `Confirm ${fmt(D[slot!.di])}, ${slot!.s}`}</button><p className="form-err" role="alert">{err}</p></div>
          </form>
        </>
      )}
      {step === 'otp' && (
        <form className="trade-form" onSubmit={verify} noValidate style={{ marginTop: 26 }}>
          <div className="full"><p className="co-kick">6 — Verify your number</p><h3>Enter the code we sent to {f.phone}</h3>{mockCode && <p className="notice" style={{ marginTop: 10 }}>Development mode: your code is <b>{mockCode}</b>.</p>}</div>
          <div className="fld"><label htmlFor="scCode">6-digit code</label><input id="scCode" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} /></div>
          <div className="foot"><button className="btn accent" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Verify and request'}</button><button type="button" className="btn ghost" onClick={() => setStep('form')}>Change number</button><p className="form-err" role="alert">{err}</p></div>
        </form>
      )}
    </div>
  )
}
