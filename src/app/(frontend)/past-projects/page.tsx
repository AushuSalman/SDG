import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { CaseAsk } from '@/components/tools/CaseAsk'
import { AskAiButton } from '@/components/ui/actions'
import { CATEGORY_LABEL, getProjects } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Ask Our Past Projects', description: 'How SDG delivered its completed projects, with the AI consultant answering from approved documents.' }

export default async function PastProjectsPage() {
  const completed = await getProjects({ business: 'construction', status: 'completed' })
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 0 }}>
        <p className="co-kick">Ask Our Past Projects</p>
        <h1>How we delivered<br /><em>last time.</em></h1>
        <p className="lede">Completed SDG projects, with the AI consultant answering from the documents SDG has approved. No customer is named and no commercial terms are disclosed.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 20 }}>
        <CaseAsk placeholder="e.g. Which projects has SDG completed, and where?" />
        <div className="grid g2" style={{ marginTop: 20 }}>
          {completed.length === 0 && <p className="lede">Completed projects appear here once they are published.</p>}
          {completed.map((p) => {
            const facts = [
              p.specs?.saleableArea && `${p.specs.saleableArea} ${p.category === 'commercial' ? 'of office space' : 'built'}`,
              p.specs?.floors && `${p.specs.floors}`,
              p.specs?.floorPlate && `Floor plates ${p.specs.floorPlate}`,
              p.specs?.certification,
              ...(p.highlights || []).map((h) => h.text),
            ].filter(Boolean).slice(0, 5) as string[]
            return (
              <article className="card case" key={p.id}>
                <span className="eyebrow">{CATEGORY_LABEL[p.category]} · {p.location}{p.rera ? ` · RERA ${p.rera}` : ''}</span>
                <h3>{p.name}</h3>
                {p.tagline && <p className="lede" style={{ fontSize: 15 }}>{p.tagline}</p>}
                <ul>{facts.map((f) => <li key={f}>{f}</li>)}</ul>
                <div className="btn-row" style={{ marginTop: 'auto' }}>
                  <AskAiButton className="btn ghost sm" question={`How was ${p.name} delivered, and who occupies it?`}>Ask about this</AskAiButton>
                  <Link className="btn ghost sm" href={`/projects/${p.slug}`}>View project</Link>
                </div>
              </article>
            )
          })}
        </div>
        <p className="disclaimer" style={{ marginTop: 16 }}>Answers are drawn only from documents SDG approves; anything withheld is never disclosed.</p>
      </section>
    </div>
  )
}
