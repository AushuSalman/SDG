'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { captureSource, inHours, post } from '@/lib/client/enquiry'

import { useUi } from './UiProvider'

type Msg = { role: 'user' | 'assistant'; text: string; kind?: string; category?: string; facts?: string[]; sources?: { title: string }[]; pending?: boolean }
type Lang = 'en' | 'te' | 'hi'

const GREET: Record<Lang, string> = {
  en: 'Hello. I can answer questions on SDG projects, our paper and glass businesses, and help you book a visit.',
  te: 'నమస్కారం. SDG ప్రాజెక్టులు, పేపర్ మరియు గ్లాస్ వ్యాపారాల గురించి, సైట్ విజిట్ బుకింగ్ గురించి నేను సహాయం చేస్తాను.',
  hi: 'नमस्ते। मैं SDG प्रोजेक्ट्स, पेपर और ग्लास व्यवसायों के बारे में बता सकता हूँ और साइट विज़िट बुक करने में मदद कर सकता हूँ।',
}

function sessionId(): string {
  try {
    const k = 'sdg-chat-session'
    let v = localStorage.getItem(k)
    if (!v) { v = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`; localStorage.setItem(k, v) }
    return v
  } catch { return `s_${Date.now()}` }
}

function context(path: string): { business?: 'construction' | 'paper' | 'glass'; projectSlug?: string; greet?: string; chips: string[]; desk: string; deskId: string } {
  const pm = path.match(/^\/projects\/([^/]+)/)
  if (pm) return { business: 'construction', projectSlug: pm[1], greet: 'You are looking at this project. Ask me about configurations, possession, specifications or amenities, or say "talk to a human" at any time.', chips: ['What configurations are available?', 'When is possession?', 'What is the RERA number?', 'Book a site visit'], desk: 'Construction', deskId: 'construction' }
  if (path.startsWith('/paper')) return { business: 'paper', greet: 'Ask me about kraft grades, GSM and BF ranges, markets and how to raise a trade enquiry.', chips: ['What GSM range do you make?', 'Which states do you supply?', 'How do I request a quote?'], desk: 'Paper trade', deskId: 'paper' }
  if (path.startsWith('/glass')) return { business: 'glass', greet: 'Ask me about the bottles we take back, the warehouse network and supply or offtake partnerships.', chips: ['Which bottles do you take back?', 'Where are your warehouses?', 'How do I become a supply partner?'], desk: 'Glass operations', deskId: 'glass' }
  if (path.startsWith('/past-projects')) return { business: 'construction', greet: 'Ask how a completed SDG project was delivered: Centrum, VSD Tech Park and more.', chips: ['Which projects has SDG completed?', 'Tell me about VSD Tech Park', 'What is Centrum?'], desk: 'Construction', deskId: 'construction' }
  return { chips: ['What configurations does Prinia have?', 'Where is VSD Tech Park?', 'What kraft paper grades do you make?', 'Can I schedule a site visit?'], desk: 'Construction', deskId: 'construction' }
}

/** The SDG consultant drawer: grounded answers streamed from the assistant API, hand-off card on restricted subjects. */
export function AiDrawer({ open, question, openKey, onClose }: { open: boolean; question?: string; openKey: number; onClose: () => void }) {
  const ui = useUi()
  const path = usePathname() || '/'
  const ctx = context(path)
  const [lang, setLang] = useState<Lang>('en')
  const [min, setMin] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [cb, setCb] = useState<{ phone: string; sent: boolean; show: boolean }>({ phone: '', sent: false, show: false })
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const started = useRef(false)
  const lastAsked = useRef<string>('')

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }) }, [msgs, open, min])

  // Each openAI() call bumps openKey: greet once, then ask the supplied question.
  useEffect(() => {
    if (!open) return
    setMin(false)
    if (!started.current) {
      started.current = true
      setMsgs([{ role: 'assistant', text: ctx.greet || GREET[lang], kind: 'welcome' }])
    }
    if (question) void send(question)
    setTimeout(() => inputRef.current?.focus(), 50)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, openKey])

  async function send(text: string) {
    const q = text.trim()
    if (!q || busy) return
    setInput('')
    lastAsked.current = q
    const history = msgs.filter((m) => m.kind !== 'welcome' && !m.pending).slice(-8).map((m) => ({ role: m.role, text: m.text }))
    setMsgs((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: '', pending: true }])
    setBusy(true)
    try {
      const res = await fetch('/api/site/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId(), message: q, history, page: path, business: ctx.business, projectSlug: ctx.projectSlug }),
      })
      if (!res.ok || !res.body) throw new Error('The assistant is unavailable right now. Our consultants are on the contact page.')
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let buf = ''
      let acc = ''
      let meta: Msg = { role: 'assistant', text: '' }
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          const evt = JSON.parse(line)
          if (evt.meta) {
            meta = { role: 'assistant', text: '', kind: evt.meta.kind, category: evt.meta.category, facts: evt.meta.facts, sources: evt.meta.sources }
            if (evt.meta.language === 'te' || evt.meta.language === 'hi') setLang(evt.meta.language)
          }
          if (evt.delta) acc += evt.delta
          setMsgs((m) => [...m.slice(0, -1), { ...meta, text: acc }])
        }
      }
    } catch (err) {
      setMsgs((m) => [...m.slice(0, -1), { role: 'assistant', text: (err as Error).message }])
    } finally {
      setBusy(false)
    }
  }

  async function requestCallback(e: React.FormEvent) {
    e.preventDefault()
    if (cb.phone.replace(/\D/g, '').length < 10) return
    try {
      await post('/api/site/enquire', {
        phone: cb.phone, name: 'Website visitor', business: ctx.business || 'group', type: ctx.business === 'paper' ? 'paper-trade' : ctx.business === 'glass' ? 'glass-supply' : ctx.business === 'construction' ? 'home' : 'general',
        projectSlug: ctx.projectSlug, message: `Callback requested from the AI consultant. Last question: ${lastAsked.current}`, consent: true, source: captureSource(),
      })
      setCb({ ...cb, sent: true })
      ui.toast('Callback requested. The transcript is attached to your enquiry.')
    } catch (x) { ui.toast((x as Error).message) }
  }

  if (!open) return null
  const online = inHours()
  const handoff = msgs.some((m) => m.kind === 'handoff')

  return (
    <div className={`drawer ${min ? 'min' : ''}`} role="dialog" aria-label="SDG AI consultant">
      <header>
        <strong>SDG Consultant</strong>
        <div className="langs" role="group" aria-label="Language">
          {(['en', 'te', 'hi'] as Lang[]).map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => { setLang(l); setMsgs((m) => [...m, { role: 'assistant', text: GREET[l] }]) }}>{l === 'en' ? 'EN' : l === 'te' ? 'తె' : 'हि'}</button>
          ))}
        </div>
        <button className="x" type="button" aria-label={min ? 'Expand' : 'Minimise'} title="Minimise" onClick={() => setMin((v) => !v)}>–</button>
        <button className="x" type="button" aria-label="Close" onClick={onClose}>×</button>
      </header>
      <div className="ai-notice">AI-generated responses, for information only. Not an offer, commitment or professional advice on SDG&apos;s behalf.</div>
      <div className="msgs" ref={listRef} aria-live="polite">
        {msgs.map((m, i) => (
          <React.Fragment key={i}>
            <div className={`m ${m.role === 'user' ? 'me' : 'bot'} ${m.kind === 'handoff' ? 'esc' : ''} ${m.pending && !m.text ? 'typing' : ''}`}>
              {m.pending && !m.text ? <><span /><span /><span /></> : (
                <>
                  {m.kind === 'handoff' && <span className="h">Handed to a consultant · {m.category}</span>}
                  {m.text}
                  {m.facts?.map((f, j) => <span key={j} className="src" style={{ color: 'var(--ink2)' }}>{f}</span>)}
                  {m.sources && m.sources.length > 0 && <span className="src">Sources: {m.sources.map((s) => s.title).filter(Boolean).join(' · ')}</span>}
                </>
              )}
            </div>
            {m.kind === 'handoff' && i === msgs.length - 1 && (
              <div className="m bot esc-card">
                <b>Handed to the {ctx.desk} desk</b>
                <span>Your conversation and page context go with it. {online ? 'A consultant replies within working hours, usually within the hour.' : `It is outside our hours (${ui.hoursText}), so your enquiry is queued; pick a callback slot or leave a number.`}</span>
                <div className="row">
                  <Link className="btn accent xs" href={`/schedule?desk=${ctx.deskId}`} onClick={onClose}>Pick a callback slot</Link>
                  <button type="button" className="btn ghost xs" onClick={() => ui.openBooking({ project: ctx.projectSlug })}>Book a visit</button>
                  {!cb.sent && <button type="button" className="btn ghost xs" onClick={() => setCb({ ...cb, show: true })}>Call me back</button>}
                </div>
                {cb.show && !cb.sent && (
                  <form className="cb" onSubmit={requestCallback}>
                    <input placeholder="+91 mobile number" aria-label="Mobile number" inputMode="tel" value={cb.phone} onChange={(e) => setCb({ ...cb, phone: e.target.value })} />
                    <button className="btn accent xs" type="submit">Request callback</button>
                  </form>
                )}
                {cb.sent && <span className="src">Callback queued for {cb.phone}. The transcript is attached to your enquiry.</span>}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {msgs.length <= 1 && !busy && (
        <div className="sugg">{ctx.chips.map((s) => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}</div>
      )}
      <form onSubmit={(e) => { e.preventDefault(); void send(input) }}>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a project, plant or process…" aria-label="Your question" autoComplete="off" />
        <button className="btn sm" type="submit" disabled={busy}>Send</button>
      </form>
      <div className="ai-foot">
        <button type="button" onClick={() => { if (!handoff) setMsgs((m) => [...m, { role: 'assistant', text: 'Of course. Choose how you would like to reach a consultant.', kind: 'handoff', category: 'on request' }]) }}>Talk to a human</button>
        <span>{online ? `Consultants online · ${ui.hoursText}` : 'Outside hours · callbacks from 09:30 IST'}</span>
      </div>
    </div>
  )
}
