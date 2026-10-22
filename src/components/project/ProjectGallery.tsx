'use client'

import React, { useState } from 'react'

import { useUi } from '../ui/UiProvider'

export type GalleryImage = { src: string; alt: string; credit?: string | null }

const youtubeId = (url?: string | null): string | null => {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/)
  return m ? m[1] : null
}

/** Photos with previous and next, thumbnails and a lightbox; a video walkthrough tab when the project has one. */
export function ProjectGallery({ images, videoUrl, name }: { images: GalleryImage[]; videoUrl?: string | null; name: string }) {
  const ui = useUi()
  const [i, setI] = useState(0)
  const [mode, setMode] = useState<'photos' | 'video'>('photos')
  const yt = youtubeId(videoUrl)
  const cur = images[i] || images[0]
  const show = (n: number) => setI((n + images.length) % images.length)
  return (
    <div className="gallery">
      {yt && (
        <div className="media-tabs" role="group" aria-label="Media">
          <button type="button" aria-pressed={mode === 'photos'} onClick={() => setMode('photos')}>Photos</button>
          <button type="button" aria-pressed={mode === 'video'} onClick={() => setMode('video')}>Video walkthrough</button>
        </div>
      )}
      <div className={`ph gal-main ${mode === 'video' ? 'media-on' : ''}`} onClick={() => mode === 'photos' && cur && ui.openLightbox(cur.src, cur.alt)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {cur && <img src={cur.src} alt={cur.alt} />}
        <span className="lbl tag">{mode === 'video' ? 'Video walkthrough' : 'Photos'}</span>
        {mode === 'photos' && images.length > 1 && (
          <>
            <button className="gal-nav prev" type="button" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); show(i - 1) }}>‹</button>
            <button className="gal-nav next" type="button" aria-label="Next image" onClick={(e) => { e.stopPropagation(); show(i + 1) }}>›</button>
            <span className="gal-count">{i + 1} / {images.length}</span>
          </>
        )}
        {mode === 'video' && yt && (
          <div className="media-pane">
            <iframe src={`https://www.youtube-nocookie.com/embed/${yt}`} title={`${name} video walkthrough`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((im, k) => (
            <button key={im.src + k} type="button" className="ph thumb" aria-label={`Show image ${k + 1}`} aria-pressed={k === i} onClick={() => { setMode('photos'); setI(k) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {cur?.alt && <p className="gal-cap">{cur.alt}{cur.credit ? ` · Photo: ${cur.credit}` : ''}</p>}
    </div>
  )
}
