'use client'

import React, { useState } from 'react'

import { useUi } from '../ui/UiProvider'

/** A question box that opens the AI consultant with the question already asked. */
export function CaseAsk({ placeholder, suffix }: { placeholder: string; suffix?: string }) {
  const ui = useUi()
  const [q, setQ] = useState('')
  return (
    <form className="card askrow" style={{ padding: '16px 0' }} onSubmit={(e) => { e.preventDefault(); const t = q.trim(); if (t) { ui.openAI(suffix ? `${t} (${suffix})` : t); setQ('') } }}>
      <label htmlFor="caseQ" className="sr">Ask a question</label>
      <input id="caseQ" placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} />
      <button className="btn accent sm" type="submit">Ask</button>
    </form>
  )
}
