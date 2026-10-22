import type { Metadata } from 'next'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { AiLauncher } from '@/components/ui/AiLauncher'
import { CookieNotice } from '@/components/ui/CookieNotice'
import { CtaDock } from '@/components/ui/CtaDock'
import { UiProvider } from '@/components/ui/UiProvider'
import { getProjects, getSettings, getSiteCopy } from '@/lib/content'
import { slotsFromHours } from '@/lib/hours'

import './globals.css'
import './site.css'

const metadataBase = process.env.NEXT_PUBLIC_SERVER_URL ? new URL(process.env.NEXT_PUBLIC_SERVER_URL) : process.env.VERCEL_PROJECT_PRODUCTION_URL ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) : process.env.RENDER_EXTERNAL_URL ? new URL(process.env.RENDER_EXTERNAL_URL) : undefined

/** Site-wide metadata from Site settings: the group name and short name drive every page title. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const group = settings.groupName || 'Suvarna Durga Group'
  const short = settings.shortName || 'SDG'
  return {
    title: { default: `${group} · ${short}`, template: `%s · ${short} Group` },
    description: `${group}: constructions, paper and glass bottles from Hyderabad since 1978. A brand whose promise is as good as gold.`,
    metadataBase,
    openGraph: { siteName: group, type: 'website', images: ['/img/hero.webp'] },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/img/sdg-logo.webp' },
  }
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, copy, projects] = await Promise.all([getSettings(), getSiteCopy(), getProjects({ business: 'construction' })])
  const options = projects.map((p) => ({ slug: p.slug, name: p.name, location: p.location, category: p.category }))
  const ld = {
    '@context': 'https://schema.org', '@type': 'Organization', name: settings.groupName || 'Suvarna Durga Group', foundingDate: '1978',
    telephone: settings.phone, email: settings.email, sameAs: (settings.social || []).map((s) => s.url),
    address: { '@type': 'PostalAddress', streetAddress: settings.headOffice, addressLocality: 'Hyderabad', addressRegion: 'Telangana', addressCountry: 'IN' },
  }
  return (
    <html lang="en" data-theme="refined">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* The root layout wraps every route, so this stylesheet loads once; the rule below targets the pages router. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#101F3C" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </head>
      <body>
        <UiProvider projects={options} hoursText={settings.hoursText || 'Mon–Sat, 09:30 – 18:30 IST'} whatsapp={settings.whatsapp || '914040001978'} visitSlots={slotsFromHours(settings.consultHours?.from, settings.consultHours?.to)}>
          <SiteHeader />
          <main id="top"><div className="view">{children}</div></main>
          <SiteFooter settings={{ ...settings, promise: copy.promise }} />
          <CtaDock />
          <AiLauncher />
          <CookieNotice />
        </UiProvider>
      </body>
    </html>
  )
}
