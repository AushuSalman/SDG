'use client'

import React, { useState } from 'react'

import { visitCheck, visitDay } from '@/lib/client/enquiry'

import { useUi } from '../ui/UiProvider'

/** The inline slot picker on the Construction page; a valid slot opens the booking sheet pre-filled. */
export function VisitBandForm() {
  const ui = useUi()
  const [v, setV] = useState({ project: '', date: '', time: '' })
  const [err, setErr] = useState('')
  const [bad, setBad] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = visitCheck(v)
    if (p) { setErr(p.msg); setBad(p.k); document.getElementById('vb' + p.k)?.focus(); return }
    setErr(''); setBad('')
    ui.openBooking(v)
  }
  return (
    <form className="re-band-form" onSubmit={submit} noValidate>
      <label className="re-field"><span className="sr">Project</span>
        <select id="vbproject" value={v.project} aria-invalid={bad === 'project' || undefined} onChange={(e) => { setV({ ...v, project: e.target.value }); setErr('') }}>
          <option value="">Select project</option>
          {ui.projects.map((p) => <option key={p.slug} value={p.slug}>{p.name} · {p.location}</option>)}
        </select>
      </label>
      <label className="re-field"><span className="sr">Preferred date</span>
        <input type="date" id="vbdate" value={v.date} min={visitDay(1)} max={visitDay(60)} aria-invalid={bad === 'date' || undefined} onChange={(e) => { setV({ ...v, date: e.target.value }); setErr('') }} />
      </label>
      <label className="re-field"><span className="sr">Preferred time</span>
        <select id="vbtime" value={v.time} aria-invalid={bad === 'time' || undefined} onChange={(e) => { setV({ ...v, time: e.target.value }); setErr('') }}>
          <option value="">Select time</option>
          {ui.visitSlots.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <button className="btn accent" type="submit">Book a Site Visit <i aria-hidden>→</i></button>
      <p className="re-err" role="alert">{err}</p>
    </form>
  )
}
