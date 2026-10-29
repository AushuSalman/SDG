import type { Metadata } from 'next'
import React from 'react'

import { PortalClient } from '@/components/PortalClient'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Client portal', description: 'Track your SDG enquiries, visits and support in one place.' }

export default function PortalPage() {
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 0 }}>
        <p className="co-kick">Client portal</p>
        <h1>Your journey<br /><em>with SDG.</em></h1>
        <p className="lede">Enquiries, visits, consultants and support in one place, from the first click. Sign in with the mobile number you enquired with.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 24 }}><h2 className="sr">Your portal</h2><PortalClient /></section>
    </div>
  )
}
