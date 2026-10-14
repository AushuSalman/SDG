'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'

import { captureSource, post } from '@/lib/client/enquiry'

type Business = 'construction' | 'paper' | 'glass'
type ProjectOpt = { slug: string; name: string }

const TYPES: Record<Business, { value: string; label: string }[]> = {
  construction: [
    { value: 'home', label: 'Construction, buying a home' },
    { value: 'commercial', label: 'Construction, leasing office space' },
  ],
  paper: [{ value: 'paper-trade', label: 'Paper, trade enquiry' }],
  glass: [{ value: 'glass-supply', label: 'Glass, supply or offtake' }],
}
const BUDGETS = [['under-1cr', 'Under ₹1 Cr'], ['1-2cr', '₹1 – 2 Cr'], ['2-4cr', '₹2 – 4 Cr'], ['4cr-plus', '₹4 Cr and above'], ['undisclosed', 'Prefer not to say']]
const TIMELINES = [['0-3m', 'Within 3 months'], ['3-6m', '3 to 6 months'], ['6-12m', '6 to 12 months'], ['12m-plus', 'More than a year'], ['exploring', 'Just exploring']]
const PAPER_PRODUCTS = ['Kraft paper, natural shade', 'Kraft paper, golden shade', 'Corrugation grade', 'Paper plates and bags grade', 'Wrapping grade']
const PAPER_QTY = ['Under 10 tonnes', '10 – 50 tonnes', '50 – 200 tonnes', '200+ tonnes']
const GLASS_ROLES = ['Returning empties (distributor, hotel, retail)', 'Buying washed returnables (bottler, filler)', 'Both', 'Collection partner']
const GLASS_FAMILIES = ['Beverage returnables', 'Beer bottles', 'Spirits & liquor', 'Food & pharma jars', 'Mixed']
const GLASS_VOL = ['Under 10,000 bottles', '10,000 – 50,000', '50,000 – 2,00,000', '2,00,000+']

/**
 * Enquiry form for all three businesses. Saves first so a drop-off at the OTP step is still captured,
 * then verifies the number by OTP and marks the enquiry verified.
 */
export function EnquiryForm(props: { business: Business; projectSlug?: string; projects?: ProjectOpt[]; title?: string; compact?: boolean; dark?: boolean }) {
  const { business } = props
  const [step, setStep] = useState<'form' | 'otp' | 'done'>('form')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mockCode, setMockCode] = useState('')
  const [enquiryId, setEnquiryId] = useState('')
  const [code, setCode] = useState('')
  const [f, setF] = useState<Record<string, string | boolean>>({
    type: TYPES[business][0].value, projectSlug: props.projectSlug || '', purpose: '', budgetBand: '', timeline: '', preferredLocation: '',
    configuration: '', quantity: '', recurring: false, visitReady: false, loanRequired: 'unknown', name: '', phone: '', email: '', message: '', company: '', role: '', consent: false,
  })
  const source = useMemo(() => captureSource(), [])
  // A scenario attached by the decision tools arrives through session storage after navigation; apply it once mounted.
  useEffect(() => {
    let pre: string | null = null
    try { pre = sessionStorage.getItem('sdg-prefill') } catch { /* storage unavailable */ }
    if (!pre) return
    // The stored scenario is cleared only once applied, so a re-run of this effect (StrictMode) still finds it.
    const t = setTimeout(() => {
      setF((s) => ({ ...s, message: pre as string }))
      try { sessionStorage.removeItem('sdg-prefill') } catch { /* storage unavailable */ }
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const set = (k: string, v: string | boolean) => setF((s) => ({ ...s, [k]: v }))
  const str = (k: string) => String(f[k] ?? '')
  const extras = [str('company') && `Company: ${str('company')}`, str('role') && `Role: ${str('role')}`].filter(Boolean).join(' · ')

  const body = () => ({
    phone: str('phone'), name: str('name'), email: str('email') || undefined, business, type: str('type'),
    projectSlug: str('projectSlug') || undefined, purpose: str('purpose') || undefined, budgetBand: str('budgetBand') || undefined,
    timeline: str('timeline') || undefined, preferredLocation: str('preferredLocation') || undefined, configuration: str('configuration') || undefined,
    quantity: str('quantity') || undefined, recurring: Boolean(f.recurring), visitReady: Boolean(f.visitReady), loanRequired: str('loanRequired') || 'unknown',
    message: [str('message'), extras].filter(Boolean).join('\n') || undefined, consent: true, source,
  })

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (str('name').trim().length < 2) return setError('Please tell us your name.')
    if (str('phone').replace(/\D/g, '').length < 10) return setError('Enter a valid mobile number.')
    if (!f.consent) return setError('Please tick the consent box so we can contact you.')
    setBusy(true)
    try {
      const saved = await post<{ id: string }>('/api/site/enquire', body())
      setEnquiryId(saved.id)
      const otp = await post<{ mockCode?: string }>('/api/site/otp/send', { phone: str('phone'), purpose: 'enquiry' })
      if (otp.mockCode) setMockCode(otp.mockCode)
      setStep('otp')
    } catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      const v = await post<{ token: string }>('/api/site/otp/verify', { phone: str('phone'), code, purpose: 'enquiry' })
      await post('/api/site/enquire', { ...body(), token: v.token, enquiryId })
      setStep('done')
    } catch (err) { setError((err as Error).message) } finally { setBusy(false) }
  }

  const cta = business === 'paper' ? 'Request a Quote' : business === 'glass' ? 'Send enquiry' : 'Send enquiry'
  const btnCls = business === 'paper' ? 'btn paper' : business === 'glass' ? 'btn glass' : 'btn accent'
  const kick = props.dark ? { color: '#E3C77A' } : undefined

  if (step === 'done') {
    return (
      <div className="card" id="enquire">
        <p className="eyebrow" style={kick}>Thank you</p>
        <h3 style={{ marginTop: 8 }}>We have your enquiry, {str('name').split(' ')[0]}.</h3>
        <p className="lede" style={{ fontSize: 15, marginTop: 8, color: props.dark ? '#C3CCDC' : undefined }}>An SDG consultant calls you on {str('phone')} within working hours. You can track this enquiry any time in <Link className="plainlink" href="/portal">your portal</Link>.</p>
      </div>
    )
  }
  if (step === 'otp') {
    return (
      <form onSubmit={verify} className="trade-form" id="enquire" aria-label="Verify your number" noValidate>
        <div className="full"><p className="eyebrow" style={kick}>One more step</p><h3 style={{ marginTop: 8 }}>Enter the code we sent to {str('phone')}</h3>
          {mockCode && <p className="notice" style={{ marginTop: 10, color: 'var(--ink)' }}>Development mode: your code is <b>{mockCode}</b>.</p>}
        </div>
        <div className="fld"><label htmlFor="otp-code">6-digit code</label><input id="otp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} /></div>
        <div className="foot"><button className={btnCls} disabled={busy}>{busy ? 'Checking…' : 'Verify and send'}</button><button type="button" className={props.dark ? 'btn outline' : 'btn ghost'} onClick={() => setStep('form')}>Change number</button><p className="form-err" role="alert">{error}</p></div>
      </form>
    )
  }

  const isRe = business === 'construction'
  return (
    <form id="enquire" onSubmit={submitForm} className="trade-form" aria-label={props.title || 'Enquiry form'} noValidate>
      {props.title && <div className="full"><p className="eyebrow" style={kick}>Enquire</p><h3 style={{ marginTop: 8, fontSize: 19 }}>{props.title}</h3></div>}

      {isRe && (
        <>
          <div className="fld"><label htmlFor="eq-type">I&apos;m enquiring about</label>
            <select id="eq-type" value={str('type')} onChange={(e) => set('type', e.target.value)}>{TYPES[business].map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          {props.projects && (
            <div className="fld"><label htmlFor="eq-project">Project</label>
              <select id="eq-project" value={str('projectSlug')} onChange={(e) => set('projectSlug', e.target.value)}><option value="">Any project</option>{props.projects.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></div>
          )}
          <div className="fld"><label htmlFor="eq-purpose">Purpose</label>
            <select id="eq-purpose" value={str('purpose')} onChange={(e) => set('purpose', e.target.value)}><option value="">Select</option><option value="end-use">For my own use</option><option value="investment">Investment</option><option value="business">For my business</option></select></div>
          <div className="fld"><label htmlFor="eq-budget">Budget</label>
            <select id="eq-budget" value={str('budgetBand')} onChange={(e) => set('budgetBand', e.target.value)}><option value="">Select</option>{BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="fld"><label htmlFor="eq-timeline">Timeline</label>
            <select id="eq-timeline" value={str('timeline')} onChange={(e) => set('timeline', e.target.value)}><option value="">Select</option>{TIMELINES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="fld"><label htmlFor="eq-location">Preferred location</label><input id="eq-location" value={str('preferredLocation')} onChange={(e) => set('preferredLocation', e.target.value)} placeholder="e.g. Kokapet" /></div>
          <div className="fld"><label htmlFor="eq-config">Configuration</label><input id="eq-config" value={str('configuration')} onChange={(e) => set('configuration', e.target.value)} placeholder="e.g. 3 BHK, or 5,000 sq ft office" /></div>
          <div className="fld"><label htmlFor="eq-loan">Home loan</label>
            <select id="eq-loan" value={str('loanRequired')} onChange={(e) => set('loanRequired', e.target.value)}><option value="unknown">Not sure yet</option><option value="yes">Needed</option><option value="no">Not needed</option></select></div>
        </>
      )}
      {business === 'paper' && (
        <>
          <div className="fld"><label htmlFor="eq-config">Product type</label>
            <select id="eq-config" value={str('configuration')} onChange={(e) => set('configuration', e.target.value)}><option value="">Select</option>{PAPER_PRODUCTS.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="fld"><label htmlFor="eq-quantity">Monthly quantity</label>
            <select id="eq-quantity" value={str('quantity')} onChange={(e) => set('quantity', e.target.value)}><option value="">Select</option>{PAPER_QTY.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="fld"><label htmlFor="eq-timeline">Timeline</label>
            <select id="eq-timeline" value={str('timeline')} onChange={(e) => set('timeline', e.target.value)}><option value="">Select</option>{TIMELINES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="fld"><label htmlFor="eq-location">Delivery location</label><input id="eq-location" value={str('preferredLocation')} onChange={(e) => set('preferredLocation', e.target.value)} placeholder="City or district" /></div>
          <div className="fld"><label htmlFor="eq-company">Company</label><input id="eq-company" value={str('company')} onChange={(e) => set('company', e.target.value)} placeholder="Company name" autoComplete="organization" /></div>
        </>
      )}
      {business === 'glass' && (
        <>
          <div className="fld"><label htmlFor="eq-role">I am</label>
            <select id="eq-role" value={str('role')} onChange={(e) => set('role', e.target.value)}><option value="">Select</option>{GLASS_ROLES.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="fld"><label htmlFor="eq-config">Bottle family</label>
            <select id="eq-config" value={str('configuration')} onChange={(e) => set('configuration', e.target.value)}><option value="">Select</option>{GLASS_FAMILIES.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="fld"><label htmlFor="eq-quantity">Monthly volume</label>
            <select id="eq-quantity" value={str('quantity')} onChange={(e) => set('quantity', e.target.value)}><option value="">Select</option>{GLASS_VOL.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div className="fld"><label htmlFor="eq-location">Pickup or delivery location</label><input id="eq-location" value={str('preferredLocation')} onChange={(e) => set('preferredLocation', e.target.value)} placeholder="City or district" /></div>
          <div className="fld"><label htmlFor="eq-company">Company</label><input id="eq-company" value={str('company')} onChange={(e) => set('company', e.target.value)} placeholder="Company name" autoComplete="organization" /></div>
        </>
      )}

      <div className="fld"><label htmlFor="eq-name">{isRe ? 'Name' : 'Contact name'}</label><input id="eq-name" value={str('name')} onChange={(e) => set('name', e.target.value)} placeholder="Your full name" autoComplete="name" required /></div>
      <div className="fld"><label htmlFor="eq-phone">Phone</label><input id="eq-phone" value={str('phone')} onChange={(e) => set('phone', e.target.value)} placeholder="+91" inputMode="tel" autoComplete="tel" required /></div>
      <div className="fld"><label htmlFor="eq-email">Email</label><input id="eq-email" type="email" value={str('email')} onChange={(e) => set('email', e.target.value)} placeholder={isRe ? 'you@example.com' : 'you@company.com'} autoComplete="email" /></div>
      {!props.compact && (
        <div className="fld full"><label htmlFor="eq-message">{isRe ? 'Message' : 'Specification notes'}</label>
          <textarea id="eq-message" rows={2} value={str('message')} onChange={(e) => set('message', e.target.value)} placeholder={isRe ? 'What can we help with?' : business === 'paper' ? 'GSM, BF, deckle, delivery schedule' : 'Bottle sizes, counts, pickup days'} /></div>
      )}
      <div className="foot">
        {isRe && <label className="consent" style={{ margin: 0 }}><input type="checkbox" checked={Boolean(f.visitReady)} onChange={(e) => set('visitReady', e.target.checked)} /> I am ready to visit the site</label>}
        {business === 'paper' && <label className="consent" style={{ margin: 0 }}><input type="checkbox" checked={Boolean(f.recurring)} onChange={(e) => set('recurring', e.target.checked)} /> Recurring requirement</label>}
        <label className="consent" style={{ margin: 0 }}><input type="checkbox" checked={Boolean(f.consent)} onChange={(e) => set('consent', e.target.checked)} /> I agree to be contacted about this enquiry. We verify your number by SMS and never share it.</label>
      </div>
      <div className="foot"><button className={btnCls} disabled={busy}>{busy ? 'Sending…' : cta} <i aria-hidden>→</i></button><p className="form-err" role="alert">{error}</p></div>
      <p className="disclaimer">Your enquiry is written to the SDG CRM with its source and campaign, and routed to the {business === 'paper' ? 'trade' : business === 'glass' ? 'operations' : 'sales'} desk.</p>
    </form>
  )
}
