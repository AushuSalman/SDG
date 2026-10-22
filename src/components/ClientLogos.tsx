import React from 'react'

import { mediaUrl } from '@/lib/content'
import type { Partner } from '@/payload-types'

/**
 * The client and occupier logos for a business (Website → Partners & clients, kind "Client"). A client without a
 * logo shows as a name tile. Renders nothing when the business has no clients, so a page never shows an empty heading.
 */
export function ClientLogos({ clients, title = 'Clients', kickClass = 'co-kick', intro }: { clients: Partner[]; title?: string; kickClass?: string; intro?: string }) {
  if (!clients.length) return null
  return (
    <div className="clients">
      <p className={kickClass}>{title}</p>
      {intro && <p className="lede clients-intro">{intro}</p>}
      <ul className="client-grid" aria-label={title}>
        {clients.map((c) => {
          const logo = mediaUrl(c.logo, 'thumb')
          return (
            <li key={c.id} title={c.summary || c.name}>
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={c.name} loading="lazy" />
              ) : (
                <b>{c.name}</b>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
