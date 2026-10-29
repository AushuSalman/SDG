import type { Metadata } from 'next'
import React from 'react'

import { getSettings } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Privacy & cookies', description: 'How the SDG platform collects and uses your information.' }

export default async function PrivacyPage() {
  const s = await getSettings()
  return (
    <div className="wrap">
      <section className="co-hero">
        <p className="co-kick">Policy</p>
        <h1>Privacy &amp;<br /><em>cookies.</em></h1>
        <p className="lede">How the SDG platform collects and uses your information. The final legal text is supplied by SDG and published here through the admin.</p>
      </section>
      <section className="prose co-section" style={{ paddingTop: 8 }}>
        <h2>What we collect</h2>
        <p>Details you give us in enquiry, site-visit, quote and application forms: name, phone, email, company and your requirement. Usage data from analytics cookies, if you accept them.</p>
        <h2>Why we collect it</h2>
        <p>To respond to your enquiry, book your visit, prepare a proposal and keep you informed about the project or product you asked about. Enquiries are written to the SDG CRM so that no lead is lost.</p>
        <h2>Number verification</h2>
        <p>We verify your mobile number with a one-time code before a consultant calls you. Codes are stored hashed and expire within minutes.</p>
        <h2>AI consultant conversations</h2>
        <p>Conversations with the AI consultant are stored with a timestamp and page context, and attached to your enquiry where you qualify as a lead. They are retained for the period in SDG&apos;s retention policy, and you can ask for a human at any point.</p>
        <h2>Cookies and analytics</h2>
        <p>Essential cookies run the site. With your consent we also use analytics to measure how the platform performs. You can change your choice at any time by clearing the site data in your browser.</p>
        <h2>Your choices</h2>
        <ul><li>Ask what we hold about you, or ask us to correct or delete it.</li><li>Withdraw consent to be contacted at any time, from the portal or by writing to us.</li><li>Decline analytics cookies without losing any site functionality.</li></ul>
        <h2>Contact</h2>
        <p>{s.email} · {s.groupName}, {s.headOffice}</p>
      </section>
    </div>
  )
}
