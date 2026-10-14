import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { AskAiButton } from './ui/actions'
import { PwaButtons } from './ui/PwaButtons'

type Settings = { groupName?: string | null; phone?: string | null; email?: string | null; headOffice?: string | null; hoursText?: string | null }

const GROUP: [string, string][] = [
  ['/', 'Home'], ['/about', 'About'], ['/leadership', 'Leadership'], ['/partnerships', 'Partnerships'], ['/careers', 'Careers'],
  ['/real-estate', 'Construction'], ['/paper', 'Paper Manufacturing'], ['/glass', 'Glass Recycling'], ['/portal', 'Client portal'], ['/contact', 'Contact'],
]
const EXPLORE_A: [string, string][] = [['/projects', 'Project experience'], ['/proposal', 'Space designer']]
const EXPLORE_B: [string, string][] = [
  ['/portal', 'Support status'], ['/readiness', 'Readiness check'], ['/roi', 'ROI calculator'], ['/schedule', 'Book a meeting'],
  ['/past-projects', 'Ask Our Past Projects'], ['/documents', 'Document summaries'], ['/map', 'Delivery map'], ['/privacy', 'Privacy & cookies'],
]

export function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="site-foot" id="site-foot">
      <div className="wrap-wide">
        <div className="fcols">
          <div>
            <Image src="/img/sdg-logo.webp" alt="SDG · Suvarna Durga Group" width={350} height={128} className="flogo" />
            <div className="fsub">Since 1978</div>
            <p className="fcontact">Hyderabad, Telangana<br />{settings.email}<br />{settings.phone}</p>
            <PwaButtons />
          </div>
          <div>
            <h4>Group</h4>
            {GROUP.map(([href, label]) => <Link key={href + label} href={href}>{label}</Link>)}
          </div>
          <div>
            <h4>Explore</h4>
            {EXPLORE_A.map(([href, label]) => <Link key={href + label} href={href}>{label}</Link>)}
            <AskAiButton className="flink">Ask SDG (AI)</AskAiButton>
            {EXPLORE_B.map(([href, label]) => <Link key={href + label} href={href}>{label}</Link>)}
            <Link href="/admin" style={{ opacity: .7 }}>Staff sign-in</Link>
          </div>
        </div>
        <div className="legal">
          <span>© {new Date().getFullYear()} {settings.groupName || 'Suvarna Durga Group'}. RERA numbers are published on each project page.</span>
          <span>Prices and dates are indicative and confirmed by an SDG consultant.</span>
        </div>
      </div>
    </footer>
  )
}
