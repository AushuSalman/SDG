import type { Metadata } from 'next'
import React from 'react'

import { DeliveryMap, type MapItem } from '@/components/tools/DeliveryMap'
import { CATEGORY_LABEL, STATUS_LABEL, getProjects, getSettings } from '@/lib/content'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Delivery map', description: 'Where SDG builds and makes: projects, the paper mill, the bottle warehouses and the head office.' }

const WAREHOUSES = ['Batasingaram', 'Shadnagar', 'Bachupally', 'Jeedimetla', 'Pragnyapur', 'Pebbair', 'Sangareddy']

export default async function MapPage() {
  const [projects, settings] = await Promise.all([getProjects({ business: 'construction' }), getSettings()])
  const items: MapItem[] = [
    ...projects.map((p) => ({ id: p.slug, name: p.name, loc: p.location, query: `${p.address || p.location}, Hyderabad`, business: 'Construction' as const, desc: `${CATEGORY_LABEL[p.category]} · ${STATUS_LABEL[p.status]}`, href: `/projects/${p.slug}` })),
    { id: 'hq', name: 'SDG Head Office', loc: 'Financial District', query: settings.headOffice || 'VSD Tech Park, Nanakramguda, Hyderabad', business: 'Group', desc: 'Group headquarters', href: '/contact' },
    { id: 'mill', name: 'Suvarna Durga Paper Mills', loc: 'Sangareddy', query: 'Mucharla, Hathnoora, Sangareddy, Telangana', business: 'Paper', desc: 'Two paper machines, 175,000 tonnes a year', href: '/paper' },
    ...WAREHOUSES.map((w) => ({ id: `wh-${w.toLowerCase()}`, name: `Bottle warehouse, ${w}`, loc: w, query: `${w}, Telangana`, business: 'Glass Recycling' as const, desc: 'Recovery, washing and supply', href: '/glass' })),
  ]
  return (
    <div className="wrap">
      <section className="co-hero" style={{ paddingBottom: 0 }}>
        <p className="co-kick">Delivery map</p>
        <h1>Where SDG<br /><em>builds and makes.</em></h1>
        <p className="lede">Projects, the paper mill, the bottle warehouses and the head office, across the Group. Pick a location for details and a live map.</p>
      </section>
      <section className="co-section" style={{ paddingTop: 20 }}><DeliveryMap items={items} /></section>
    </div>
  )
}
