import type { Metadata } from 'next'
import React from 'react'

import { DocSummariser } from '@/components/tools/DocSummariser'
import { getDocuments } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Document summaries', description: 'Brochures, specifications and fact sheets summarised in plain language. The source document always prevails.' }

export default async function DocumentsPage() {
  const docs = await getDocuments()
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 0 }}>
        <p className="co-kick">Documentation summariser</p>
        <h1>The key points,<br /><em>in plain language.</em></h1>
        <p className="lede">Brochures, specifications and fact sheets, summarised for understanding by the AI consultant from the documents SDG has approved. The source document always prevails.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 20 }}>
        {docs.length === 0 ? <p className="notice">Approved documents appear here once they are indexed in the admin.</p> : <DocSummariser docs={docs.map((d) => ({ id: String(d.id), title: d.title, kind: d.kind, business: d.business || 'group', url: d.url }))} />}
      </section>
    </div>
  )
}
