'use client'

import React, { useMemo, useState } from 'react'

import { captureSource, post } from '@/lib/client/enquiry'

import { useUi } from './ui/UiProvider'

const AREAS = ['Construction, site and project management', 'Construction, sales and customer relations', 'Paper mill, production and quality', 'Glass, warehouse operations and partnerships', 'Group, finance, HR and administration']

/** Careers application. Writes a `careers` enquiry so HR sees it in the admin with consent recorded. */
export function CareerForm({ role }: { role?: string }) {
  const ui = useUi()
  const [f, setF] = useState({ area: AREAS[0], name: '', phone: '', email: '', message: role ? `Applying for: ${role}` : '', consent: false })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const source = useMemo(() => captureSource(), [])
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (f.name.trim().length < 2) return setErr('Please tell us your name.')
    if (f.phone.replace(/\D/g, '').length < 10) return setErr('Enter a valid mobile number.')
    if (!f.consent) return setErr('Please tick the consent box so we can store your application.')
    setErr(''); setBusy(true)
    try {
      await post('/api/site/enquire', { phone: f.phone, name: f.name, email: f.email || undefined, business: 'group', type: 'careers', message: `Area: ${f.area}\n${f.message}`.trim(), consent: true, source })
      setDone(true)
      ui.toast('Application received. HR comes back to you by email or phone.', 5000)
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  if (done) return <div className="card"><p className="eyebrow">Received</p><h3 style={{ marginTop: 8 }}>Thank you, {f.name.split(' ')[0]}.</h3><p className="lede" style={{ fontSize: 'var(--fs-small)', marginTop: 8 }}>Your application is with HR. Send your CV to careers@sdg.in quoting your name and the area you applied for.</p></div>
  return (
    <form className="card" id="apply" onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h3>Apply</h3>
      <div className="fld"><label htmlFor="jbRole">Area</label><select id="jbRole" value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></div>
      <div className="fld"><label htmlFor="jbName">Name</label><input id="jbName" placeholder="Your full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
      <div className="grid g2" style={{ gap: 14 }}>
        <div className="fld"><label htmlFor="jbPhone">Phone</label><input id="jbPhone" placeholder="+91" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></div>
        <div className="fld"><label htmlFor="jbMail">Email</label><input id="jbMail" type="email" placeholder="you@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
      </div>
      <div className="fld"><label htmlFor="jbMsg">Message</label><textarea id="jbMsg" rows={3} placeholder="A line about your experience" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
      <label className="consent"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> I consent to SDG storing my application for recruitment purposes.</label>
      <div className="btn-row" style={{ alignItems: 'center' }}><button className="btn accent" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Submit application'}</button><p className="form-err" role="alert">{err}</p></div>
      <p className="disclaimer">Your application reaches HR with consent recorded. Attach your CV by email to careers@sdg.in.</p>
    </form>
  )
}
