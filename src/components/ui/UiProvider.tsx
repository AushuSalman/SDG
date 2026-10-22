'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { AiDrawer } from './AiDrawer'
import { BookingSheet, type BookingPrefill } from './BookingSheet'
import { BrochureSheet, type BrochureTarget } from './BrochureSheet'
import { ShareSheet, type ShareOptions } from './ShareSheet'

export type ProjectOption = { slug: string; name: string; location: string; category: 'residential' | 'commercial' }

type Ui = {
  toast: (msg: string, ms?: number) => void
  openAI: (question?: string) => void
  openBooking: (pre?: BookingPrefill) => void
  openShare: (o?: ShareOptions) => void
  openBrochure: (target: BrochureTarget) => void
  openLightbox: (src: string, caption?: string) => void
  aiOpen: boolean
  projects: ProjectOption[]
  hoursText: string
  whatsapp: string
  /** Bookable times, from Site settings → Consultation hours */
  visitSlots: string[]
}

const UiContext = createContext<Ui | null>(null)
export const useUi = () => {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi must be used inside UiProvider')
  return ctx
}

export function UiProvider({ children, projects, hoursText, whatsapp, visitSlots }: { children: React.ReactNode; projects: ProjectOption[]; hoursText: string; whatsapp: string; visitSlots: string[] }) {
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ai, setAi] = useState<{ open: boolean; question?: string; key: number }>({ open: false, key: 0 })
  const [booking, setBooking] = useState<BookingPrefill | null>(null)
  const [share, setShare] = useState<ShareOptions | null>(null)
  const [brochure, setBrochure] = useState<BrochureTarget | null>(null)
  const [lightbox, setLightbox] = useState<{ src: string; caption?: string } | null>(null)

  const toast = useCallback((msg: string, ms = 2600) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), ms)
  }, [])
  const openAI = useCallback((question?: string) => setAi((s) => ({ open: true, question, key: s.key + 1 })), [])
  const openBooking = useCallback((pre?: BookingPrefill) => setBooking(pre || {}), [])
  const openShare = useCallback((o?: ShareOptions) => setShare(o || {}), [])
  const openBrochure = useCallback((target: BrochureTarget) => setBrochure(target), [])
  const openLightbox = useCallback((src: string, caption?: string) => setLightbox({ src, caption }), [])

  useEffect(() => {
    if (!lightbox) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [lightbox])

  const value = useMemo<Ui>(() => ({ toast, openAI, openBooking, openShare, openBrochure, openLightbox, aiOpen: ai.open, projects, hoursText, whatsapp, visitSlots }), [toast, openAI, openBooking, openShare, openBrochure, openLightbox, ai.open, projects, hoursText, whatsapp, visitSlots])

  return (
    <UiContext.Provider value={value}>
      {children}
      <AiDrawer open={ai.open} question={ai.question} openKey={ai.key} onClose={() => setAi((s) => ({ ...s, open: false }))} />
      {booking && <BookingSheet pre={booking} onClose={() => setBooking(null)} />}
      {share && <ShareSheet options={share} onClose={() => setShare(null)} />}
      {brochure && <BrochureSheet target={brochure} onClose={() => setBrochure(null)} />}
      {lightbox && (
        <div className="lb" role="dialog" aria-label="Image viewer" onClick={(e) => { if (e.target === e.currentTarget) setLightbox(null) }}>
          <button className="x" aria-label="Close" onClick={() => setLightbox(null)}>×</button>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.src} alt={lightbox.caption || ''} />
            {lightbox.caption && <div className="cap">{lightbox.caption}</div>}
          </div>
        </div>
      )}
      {toastMsg && <div id="toast" role="status">{toastMsg}</div>}
    </UiContext.Provider>
  )
}
