'use client'

import Link from 'next/link'
import React, { useState } from 'react'

export type MapItem = { id: string; name: string; loc: string; query: string; business: 'Construction' | 'Paper' | 'Glass Recycling' | 'Group'; desc: string; href: string }

const FILTERS: MapItem['business'][] = ['Construction', 'Paper', 'Glass Recycling']
const COLOR: Record<string, string> = { Construction: 'var(--navy2)', Paper: 'var(--brass)', 'Glass Recycling': 'var(--muted)', Group: 'var(--gold)' }

/** Projects, the paper mill, the bottle warehouses and the head office, each with a live map. */
export function DeliveryMap({ items }: { items: MapItem[] }) {
  const [f, setF] = useState<string>('All')
  const list = items.filter((i) => f === 'All' || i.business === f || (f === 'Construction' && i.business === 'Group'))
  const [sel, setSel] = useState<MapItem>(items[0])
  const cur = list.find((i) => i.id === sel.id) || list[0] || items[0]
  return (
    <>
      <div className="pd-group" role="group" aria-label="Business">
        {['All', ...FILTERS].map((v) => <button key={v} type="button" aria-pressed={f === v} onClick={() => setF(v)}>{v}</button>)}
      </div>
      <div className="pd-map" style={{ marginTop: 14 }}>
        <div>
          {cur && <iframe className="nb-map" style={{ aspectRatio: '16 / 11' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${encodeURIComponent(cur.query)}&output=embed`} title={`Map of ${cur.name}`} />}
          <div className="map-list" style={{ marginTop: 12 }}>
            {list.map((i) => (
              <button key={i.id} type="button" className="map-row" aria-pressed={cur?.id === i.id} onClick={() => setSel(i)}>
                <b><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: COLOR[i.business], marginRight: 8 }} />{i.name}</b><span>{i.loc} · {i.business}</span>
              </button>
            ))}
          </div>
        </div>
        {cur && (
          <div className="card">
            <span className="eyebrow" style={{ color: COLOR[cur.business] }}>{cur.business}</span>
            <h3 style={{ margin: '6px 0 4px' }}>{cur.name}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 12px' }}>{cur.loc} · {cur.desc}</p>
            <div className="btn-row">
              <Link className="btn accent sm" href={cur.href}>Open page</Link>
              <a className="btn ghost sm" href={`https://www.google.com/maps/search/${encodeURIComponent(cur.query)}`} target="_blank" rel="noopener">Directions</a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
