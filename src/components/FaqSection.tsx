import React from 'react'

import type { Faq } from '@/payload-types'

/**
 * Published FAQs for a business or the whole group, as the same expandable list the project pages use.
 * Renders nothing when there are no FAQs, so a page never shows an empty heading.
 */
export function FaqSection({ faqs, title, kicker = 'Questions', kickClass = 'co-kick', intro }: { faqs: Faq[]; title: string; kicker?: string; kickClass?: string; intro?: string }) {
  if (!faqs.length) return null
  return (
    <div className="faq-sec">
      <p className={kickClass}>{kicker}</p>
      <h2>{title}</h2>
      {intro && <p className="lede" style={{ margin: '8px 0 18px', fontSize: 15.5 }}>{intro}</p>}
      <div className="faq-list" style={{ marginTop: intro ? 0 : 18 }}>
        {faqs.map((f) => (
          <details key={f.id}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
