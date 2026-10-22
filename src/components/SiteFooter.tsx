import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { AskAiButton } from './ui/actions'

type Settings = {
  groupName?: string | null
  promise?: string | null
  phone?: string | null
  email?: string | null
  headOffice?: string | null
  hoursText?: string | null
  social?: { label: string; url: string; id?: string | null }[] | null
}

const GROUP: [string, string][] = [
  ['/', 'Home'], ['/about', 'About us'], ['/about#legacy', 'Legacy'], ['/leadership', 'Leadership'], ['/about#csr', 'CSR'], ['/partnerships', 'Partnerships'], ['/careers', 'Careers'],
  ['/blog', 'News & Events'], ['/portal', 'Client portal'], ['/contact', 'Contact'],
]
const VERTICALS: [string, string][] = [
  ['/real-estate', 'Suvarna Durga Constructions'], ['/paper', 'Suvarna Durga Paper'], ['/glass', 'Suvarna Durga Bottles'],
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
            {settings.promise && <p className="fpromise">{settings.promise}</p>}
            <p className="fcontact" style={{ whiteSpace: 'pre-line' }}>{settings.headOffice || 'Hyderabad, Telangana'}<br />{settings.email}<br />{settings.phone}</p>
            {settings.social && settings.social.length > 0 && (
              <p className="fsocial">
                {settings.social.map((s) => <a key={s.id || s.url} href={s.url} target="_blank" rel="noreferrer">{s.label}</a>)}
              </p>
            )}
            {/* PWA install and launch-alert buttons (SOW Layer 01) return here once the manifest, service worker and push pipeline are built; see src/components/ui/PwaButtons.tsx. */}
          </div>
          <div>
            <h4>Verticals</h4>
            {VERTICALS.map(([href, label]) => <Link key={href + label} href={href}>{label}</Link>)}
            <h4 style={{ marginTop: 22 }}>Group</h4>
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
