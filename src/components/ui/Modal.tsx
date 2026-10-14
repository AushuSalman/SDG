'use client'

import React, { useEffect, useRef } from 'react'

/** Centred sheet. Closes on the overlay, Escape or any element with data-x; restores focus on close. */
export function Modal({ children, onClose, label, wide }: { children: React.ReactNode; onClose: () => void; label: string; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    const first = ref.current?.querySelector<HTMLElement>('input, select, button, [href]')
    first?.focus()
    return () => { document.removeEventListener('keydown', esc); prev?.focus?.() }
  }, [onClose])
  return (
    <div
      className="modal"
      onClick={(e) => { const t = e.target as HTMLElement; if (t === e.currentTarget || t.closest('[data-x]')) onClose() }}
    >
      <div ref={ref} className={`sheet ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={label}>
        {children}
      </div>
    </div>
  )
}
