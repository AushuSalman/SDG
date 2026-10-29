'use client'

import React, { useMemo, useState } from 'react'

import { captureSource, post } from '@/lib/client/enquiry'

import { Modal } from './Modal'
import { useUi } from './UiProvider'

export type BrochureTarget = { slug: string; name: string; url?: string | null }

/** Brochure behind lead capture: name and phone become an enquiry, then the file opens. */
export function BrochureSheet({ target, onClose }: { target: BrochureTarget; onClose: () => void }) {
  const ui = useUi()
  const [d, setD] = useState({ name: '', phone: '', consent: false })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const source = useMemo(() => captureSource(), [])
  const project = ui.projects.find((p) => p.slug === target.slug)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (d.name.trim().length < 2) return setErr('Please tell us your name.')
    if (d.phone.replace(/\D/g, '').length < 10) return setErr('Enter a valid mobile number.')
    if (!d.consent) return setErr('Please tick the consent box.')
    setErr(''); setBusy(true)
    try {
      await post('/api/site/enquire', {
        phone: d.phone, name: d.name, business: 'construction',
        type: project?.category === 'commercial' ? 'commercial' : 'home',
        projectSlug: target.slug, message: `Brochure requested: ${target.name}`, consent: true, source,
      })
      onClose()
      if (target.url) {
        window.open(target.url, '_blank', 'noopener')
        ui.toast(`${target.name} brochure opened. A copy goes to your WhatsApp once the number is verified.`, 5000)
      } else {
        ui.toast(`Request noted. The ${target.name} brochure is sent to ${d.phone} by the project team.`, 5000)
      }
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }

  return (
    <Modal onClose={onClose} label={`${target.name} brochure`}>
      <form onSubmit={submit} noValidate>
        <h3>{target.name} brochure</h3>
        <p className="lede" style={{ fontSize: 'var(--fs-small)' }}>Floor plans, specifications and the payment schedule. Tell us where to send it; a copy also goes to your WhatsApp.</p>
        <label className="vl" htmlFor="brName">Name</label>
        <input className="vf" id="brName" placeholder="Your full name" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} autoComplete="name" />
        <label className="vl" htmlFor="brPhone">Mobile</label>
        <input className="vf" id="brPhone" placeholder="+91" inputMode="tel" value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} autoComplete="tel" />
        <label className="consent" style={{ marginTop: 16 }}><input type="checkbox" checked={d.consent} onChange={(e) => setD({ ...d, consent: e.target.checked })} /> I agree to be contacted about {target.name}.</label>
        <p className="verr" role="alert">{err}</p>
        <div className="foot"><button type="button" className="btn ghost" data-x>Cancel</button><button type="submit" className="btn accent" disabled={busy}>{busy ? 'Sending…' : 'Get the brochure'}</button></div>
      </form>
    </Modal>
  )
}
