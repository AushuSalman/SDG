'use client'

import React from 'react'

import { IconFacebook, IconInstagram, IconLinkedin, IconWhatsapp } from './icons'
import { Modal } from './Modal'
import { useUi } from './UiProvider'

export type ShareOptions = { title?: string; text?: string; path?: string }

/** One-tap sharing of any page or project to WhatsApp, Facebook, LinkedIn and Instagram, plus copy and the native sheet. */
export function ShareSheet({ options, onClose }: { options: ShareOptions; onClose: () => void }) {
  const ui = useUi()
  const url = typeof window === 'undefined' ? '' : window.location.origin + (options.path || window.location.pathname)
  const title = options.title || (typeof document === 'undefined' ? 'SDG' : document.title)
  const text = options.text || title
  const enc = encodeURIComponent
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const copy = async (msg: string) => {
    try { await navigator.clipboard.writeText(url) } catch { /* clipboard blocked: the field below stays selectable */ }
    ui.toast(msg)
  }
  return (
    <Modal onClose={onClose} label="Share">
      <h3>Share</h3>
      <p className="lede" style={{ fontSize: 14 }}>{title}</p>
      <div className="share-grid">
        <a href={`https://wa.me/?text=${enc(text + ' ' + url)}`} target="_blank" rel="noopener"><IconWhatsapp />WhatsApp</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener"><IconFacebook />Facebook</a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener"><IconLinkedin />LinkedIn</a>
        <button type="button" onClick={() => copy('Link copied. Paste it into your Instagram story or bio.')}><IconInstagram />Instagram</button>
      </div>
      <div className="share-url"><input readOnly value={url} aria-label="Page link" onFocus={(e) => e.target.select()} /><button className="btn ghost sm" type="button" onClick={() => copy('Link copied')}>Copy link</button></div>
      <div className="foot">
        <button type="button" className="btn ghost" data-x>Close</button>
        {canNative && <button type="button" className="btn accent" onClick={() => navigator.share({ title, text, url }).catch(() => {})}>More options</button>}
      </div>
    </Modal>
  )
}
