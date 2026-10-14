'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import { VISIT_HOURS, VISIT_SLOTS, captureSource, fmtDay, post, visitCheck, visitDay } from '@/lib/client/enquiry'

import { Modal } from './Modal'
import { useUi } from './UiProvider'

export type BookingPrefill = { project?: string; date?: string; time?: string }

/**
 * Site-visit booking: slot first, then name and phone, then the OTP. The enquiry is saved before the
 * OTP step so a drop-off is still captured, exactly like the main enquiry form.
 */
export function BookingSheet({ pre, onClose }: { pre: BookingPrefill; onClose: () => void }) {
  const ui = useUi()
  const [step, setStep] = useState<'slot' | 'details' | 'otp' | 'done'>('slot')
  const [v, setV] = useState({ project: pre.project || '', date: pre.date || '', time: pre.time || '' })
  const [d, setD] = useState({ name: '', phone: '', consent: false })
  const [code, setCode] = useState('')
  const [mockCode, setMockCode] = useState('')
  const [enquiryId, setEnquiryId] = useState('')
  const [err, setErr] = useState('')
  const [bad, setBad] = useState('')
  const [busy, setBusy] = useState(false)
  const source = useMemo(() => captureSource(), [])
  const project = ui.projects.find((p) => p.slug === v.project)

  const body = () => ({
    phone: d.phone,
    name: d.name,
    business: 'construction',
    type: project?.category === 'commercial' ? 'commercial' : 'home',
    projectSlug: v.project,
    visitReady: true,
    timeline: '0-3m',
    message: `Site visit requested: ${fmtDay(v.date)} at ${v.time} IST, ${project?.name || v.project}`,
    consent: true,
    source,
  })

  const nextSlot = (e: React.FormEvent) => {
    e.preventDefault()
    const problem = visitCheck(v)
    if (problem) { setErr(problem.msg); setBad(problem.k); return }
    setErr(''); setBad(''); setStep('details')
  }
  const sendDetails = async (e: React.FormEvent) => {
    e.preventDefault()
    if (d.name.trim().length < 2) { setErr('Please tell us your name.'); setBad('name'); return }
    if (d.phone.replace(/\D/g, '').length < 10) { setErr('Enter a valid mobile number.'); setBad('phone'); return }
    if (!d.consent) { setErr('Please tick the consent box so we can confirm the visit.'); setBad('consent'); return }
    setErr(''); setBad(''); setBusy(true)
    try {
      const saved = await post<{ id: string }>('/api/site/enquire', body())
      setEnquiryId(saved.id)
      const otp = await post<{ mockCode?: string }>('/api/site/otp/send', { phone: d.phone, purpose: 'enquiry' })
      if (otp.mockCode) setMockCode(otp.mockCode)
      setStep('otp')
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const r = await post<{ token: string }>('/api/site/otp/verify', { phone: d.phone, code, purpose: 'enquiry' })
      await post('/api/site/enquire', { ...body(), token: r.token, enquiryId })
      setStep('done')
      ui.toast('Visit request received. The team confirms your slot within working hours.', 5000)
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }

  return (
    <Modal onClose={onClose} label="Book a site visit">
      {step === 'slot' && (
        <form onSubmit={nextSlot} noValidate>
          <h3>Book a site visit</h3>
          <p className="lede" style={{ fontSize: 14 }}>Request a visit with the Construction team. Visits {VISIT_HOURS}; the team confirms your slot.</p>
          <label className="vl" htmlFor="vsProj">Project</label>
          <select className="vf" id="vsProj" value={v.project} aria-invalid={bad === 'project' || undefined} onChange={(e) => setV({ ...v, project: e.target.value })}>
            <option value="">Select project</option>
            {ui.projects.map((p) => <option key={p.slug} value={p.slug}>{p.name} · {p.location}</option>)}
          </select>
          <label className="vl" htmlFor="vsDate">Preferred date</label>
          <input className="vf" type="date" id="vsDate" min={visitDay(1)} max={visitDay(60)} value={v.date} aria-invalid={bad === 'date' || undefined} onChange={(e) => setV({ ...v, date: e.target.value })} />
          <label className="vl" htmlFor="vsTime">Preferred time</label>
          <select className="vf" id="vsTime" value={v.time} aria-invalid={bad === 'time' || undefined} onChange={(e) => setV({ ...v, time: e.target.value })}>
            <option value="">Select time</option>
            {VISIT_SLOTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <p className="verr" role="alert">{err}</p>
          <div className="foot"><button type="button" className="btn ghost" data-x>Cancel</button><button type="submit" className="btn accent">Continue</button></div>
        </form>
      )}
      {step === 'details' && (
        <form onSubmit={sendDetails} noValidate>
          <h3>Who should we confirm with?</h3>
          <p className="lede" style={{ fontSize: 14 }}>{project?.name}, {fmtDay(v.date)} at {v.time} IST. We verify your number by SMS and never share it.</p>
          <label className="vl" htmlFor="vsName">Name</label>
          <input className="vf" id="vsName" placeholder="Your full name" value={d.name} aria-invalid={bad === 'name' || undefined} onChange={(e) => setD({ ...d, name: e.target.value })} autoComplete="name" />
          <label className="vl" htmlFor="vsPhone">Mobile</label>
          <input className="vf" id="vsPhone" placeholder="+91" inputMode="tel" value={d.phone} aria-invalid={bad === 'phone' || undefined} onChange={(e) => setD({ ...d, phone: e.target.value })} autoComplete="tel" />
          <label className="consent" style={{ marginTop: 16 }}><input type="checkbox" checked={d.consent} onChange={(e) => setD({ ...d, consent: e.target.checked })} /> I agree to be contacted by SDG about this visit.</label>
          <p className="verr" role="alert">{err}</p>
          <div className="foot"><button type="button" className="btn ghost" onClick={() => setStep('slot')}>Back</button><button type="submit" className="btn accent" disabled={busy}>{busy ? 'Saving…' : 'Request visit'}</button></div>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={verify} noValidate>
          <h3>Enter the code we sent to {d.phone}</h3>
          {mockCode && <p className="notice" style={{ marginTop: 10 }}>Development mode: your code is <b>{mockCode}</b>.</p>}
          <label className="vl" htmlFor="vsCode">6-digit code</label>
          <input className="vf" id="vsCode" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} />
          <p className="verr" role="alert">{err}</p>
          <div className="foot"><button type="button" className="btn ghost" onClick={() => setStep('details')}>Change number</button><button type="submit" className="btn accent" disabled={busy}>{busy ? 'Checking…' : 'Verify and book'}</button></div>
        </form>
      )}
      {step === 'done' && (
        <div>
          <p className="eyebrow">Confirmed request</p>
          <h3 style={{ marginTop: 8 }}>{project?.name}, {fmtDay(v.date)} at {v.time} IST</h3>
          <p className="lede" style={{ fontSize: 14.5, marginTop: 8 }}>Thank you, {d.name.split(' ')[0]}. A consultant confirms the slot with you on {d.phone}, and you can track it any time in your portal.</p>
          <div className="foot"><Link href="/portal" className="btn ghost" onClick={onClose}>See it in your portal</Link><button type="button" className="btn accent" data-x>Done</button></div>
        </div>
      )}
    </Modal>
  )
}
