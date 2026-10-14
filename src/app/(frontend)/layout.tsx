import type { Metadata } from 'next'
import React from 'react'

import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { CookieNotice } from '@/components/ui/CookieNotice'
import { CtaDock } from '@/components/ui/CtaDock'
import { UiProvider } from '@/components/ui/UiProvider'
import { getProjects, getSettings } from '@/lib/content'

import './globals.css'
import './site.css'

export const metadata: Metadata = {
  title: { default: 'Suvarna Durga Group · SDG', template: '%s · SDG Group' },
  description: 'Suvarna Durga Group: homes and commercial space, paper manufacturing and glass recycling in Hyderabad since 1978.',
  metadataBase: process.env.NEXT_PUBLIC_SERVER_URL ? new URL(process.env.NEXT_PUBLIC_SERVER_URL) : process.env.VERCEL_PROJECT_PRODUCTION_URL ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) : undefined,
  openGraph: { siteName: 'Suvarna Durga Group', type: 'website', images: ['/img/hero.webp'] },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/img/sdg-logo.webp' },
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, projects] = await Promise.all([getSettings(), getProjects({ business: 'construction' })])
  const options = projects.map((p) => ({ slug: p.slug, name: p.name, location: p.location, category: p.category }))
  const ld = {
    '@context': 'https://schema.org', '@type': 'Organization', name: settings.groupName || 'Suvarna Durga Group', foundingDate: '1978',
    telephone: settings.phone, email: settings.email,
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
        <UiProvider projects={options} hoursText={settings.hoursText || 'Mon–Sat, 09:30 – 18:30 IST'} whatsapp={settings.whatsapp || '914040001978'}>
          <SiteHeader />
          <main id="top"><div className="view">{children}</div></main>
          <SiteFooter settings={settings} />
          <CtaDock />
          <CookieNotice />
        </UiProvider>
      </body>
    </html>
  )
}
