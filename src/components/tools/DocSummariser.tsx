'use client'

import React, { useState } from 'react'

import { useUi } from '../ui/UiProvider'

export type DocRow = { id: string; title: string; kind: string; business: string; url?: string | null }

const KIND: Record<string, string> = { brochure: 'Brochure', 'fact-sheet': 'Fact sheet', faq: 'FAQ', specification: 'Specification', amenities: 'Amenities', 'company-profile': 'Company profile', product: 'Product document' }
const BIZ: Record<string, string> = { construction: 'Construction', paper: 'Paper', glass: 'Glass Recycling', group: 'Group' }

function sessionId(): string {
  try { const k = 'sdg-chat-session'; let v = localStorage.getItem(k); if (!v) { v = `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`; localStorage.setItem(k, v) } return v } catch { return `s_${Date.now()}` }
}

/** Plain-language summaries of approved documents, streamed from the assistant; the source always prevails. */
export function DocSummariser({ docs }: { docs: DocRow[] }) {
  const ui = useUi()
  const [cur, setCur] = useState<DocRow | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState('')

  async function summarise(d: DocRow) {
    setCur(d); setText(''); setBusy(true)
    try {
      const res = await fetch('/api/site/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: sessionId(), message: `Summarise the key points of the document "${d.title}" in five short bullet points.`, page: '/documents', business: d.business === 'group' ? undefined : d.business, documentId: d.id }) })
      if (!res.ok || !res.body) throw new Error('The summariser is unavailable right now.')
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ''; let acc = ''
      for (;;) {
        const { value, done } = await reader.read(); if (done) break
        buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop() || ''
        for (const line of lines) { if (!line.trim()) continue; const evt = JSON.parse(line); if (evt.delta) { acc += evt.delta; setText(acc) } }
      }
    } catch (err) { setText((err as Error).message) } finally { setBusy(false) }
  }
  const download = () => { if (!cur) return; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([`${cur.title}\n\n${text}\n\nFor understanding only; the source document prevails.`], { type: 'text/plain' })); a.download = `${cur.title}.summary.txt`; document.body.appendChild(a); a.click(); a.remove() }

  return (
    <div className="grid g2" style={{ alignItems: 'start', gap: 28 }}>
      <div className="card" style={{ padding: 0 }}>
        <table className="doclist">
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className={cur?.id === d.id ? 'on' : ''}>
                <td><b>{d.title}</b><br /><span>{KIND[d.kind] || d.kind} · {BIZ[d.business] || d.business}</span></td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><button type="button" className="btn accent xs" onClick={() => summarise(d)} disabled={busy && cur?.id === d.id}>{busy && cur?.id === d.id ? 'Reading…' : 'Summarise'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" aria-live="polite">
        {!cur ? (
          <><span className="eyebrow">Summary</span><p className="lede" style={{ fontSize: 15, marginTop: 8 }}>Pick a document to see its key points, then ask a follow-up question.</p></>
        ) : (
          <>
            <span className="eyebrow">Summary · {cur.title}</span>
            <h3 style={{ margin: '8px 0 12px' }}>Key points</h3>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--ink2)', fontSize: 15, lineHeight: 1.7 }}>{text || (busy ? '…' : '')}</div>
            <form className="askrow" onSubmit={(e) => { e.preventDefault(); const t = q.trim(); if (t) { ui.openAI(`${t} (about ${cur.title})`); setQ('') } }}>
              <input placeholder="Ask a follow-up about this document" aria-label="Follow-up question" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn accent sm" type="submit">Ask</button>
            </form>
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button type="button" className="btn ghost sm" onClick={download} disabled={!text}>Download summary</button>
              {cur.url && <a className="btn ghost sm" href={cur.url} target="_blank" rel="noopener">Open the source</a>}
              <button type="button" className="btn ghost sm" onClick={() => ui.openShare({ title: `${cur.title}, summary`, path: '/documents' })}>Share</button>
            </div>
            <p className="disclaimer" style={{ marginTop: 14 }}>For understanding only, not legal interpretation. This summary does not vary the document; the source prevails in all cases.</p>
          </>
        )}
      </div>
    </div>
  )
}
