import React from 'react'

/** A responsive grid of photographs from a gallery field; nothing is rendered when the gallery is empty. */
export function PhotoGrid({ photos, kicker, title, kickClass = 'co-kick', columns = 4 }: { photos: { id: string; src: string; alt: string }[]; kicker?: string; title?: string; kickClass?: string; columns?: 3 | 4 | 6 }) {
  if (!photos.length) return null
  return (
    <div className="photo-sec">
      {kicker && <p className={kickClass}>{kicker}</p>}
      {title && <h2>{title}</h2>}
      <ul className={`photo-grid cols-${columns}`}>
        {photos.map((p) => (
          <li key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} loading="lazy" />
          </li>
        ))}
      </ul>
    </div>
  )
}
