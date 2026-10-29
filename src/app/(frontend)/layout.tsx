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

import './fonts.css'
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
        {/* Fonts are self-hosted from /public/fonts (see fonts.css); only the Latin files are preloaded. */}
        <link rel="preload" href="/fonts/inter-v20-400-600-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/manrope-v23-600-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <meta name="theme-color" content="#101F3C" />
        {/* "<" is escaped so a value typed into Site settings can never close this script tag. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
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
