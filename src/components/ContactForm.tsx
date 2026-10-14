'use client'

import React, { useState } from 'react'

import { EnquiryForm } from './EnquiryForm'

type Business = 'construction' | 'paper' | 'glass'
const BUSINESSES: [Business, string][] = [['construction', 'Construction'], ['paper', 'Paper'], ['glass', 'Glass Recycling']]

/** The contact page's enquiry form with a business switch: each business gets its own fields and routing desk. */
export function ContactForm({ projects }: { projects: { slug: string; name: string }[] }) {
  const [business, setBusiness] = useState<Business>('construction')
  return (
    <div>
      <div className="pd-group" role="group" aria-label="Business" style={{ marginBottom: 18 }}>
        {BUSINESSES.map(([v, l]) => <button key={v} type="button" aria-pressed={business === v} onClick={() => setBusiness(v)}>{l}</button>)}
      </div>
      <EnquiryForm key={business} business={business} projects={business === 'construction' ? projects : undefined} />
    </div>
  )
}
