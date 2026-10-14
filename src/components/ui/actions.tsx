'use client'

import React, { useEffect, useRef } from 'react'

import { useUi } from './UiProvider'

type Common = { className?: string; children: React.ReactNode; title?: string }

/** Opens the site-visit booking sheet. */
export function BookVisitButton({ className = 'btn accent', children, project, title }: Common & { project?: string }) {
  const ui = useUi()
  return <button type="button" className={className} title={title} onClick={() => ui.openBooking({ project })}>{children}</button>
}

/** Opens the AI consultant, optionally with a first question. */
export function AskAiButton({ className = 'btn ghost', children, question, title }: Common & { question?: string }) {
  const ui = useUi()
  return <button type="button" className={className} title={title} onClick={() => ui.openAI(question)}>{children}</button>
}

export function ShareButton({ className = 'btn ghost', children, shareTitle, text, path }: Common & { shareTitle?: string; text?: string; path?: string }) {
  const ui = useUi()
  return <button type="button" className={className} onClick={() => ui.openShare({ title: shareTitle, text, path })}>{children}</button>
}

export function BrochureButton({ className = 'btn ghost', children, slug, name, url }: Common & { slug: string; name: string; url?: string | null }) {
  const ui = useUi()
  return <button type="button" className={className} onClick={() => ui.openBrochure({ slug, name, url })}>{children}</button>
}

/** Smooth in-page scroll to an id, with an optional field to focus on arrival. */
export function ScrollLink({ to, focus, className, children }: { to: string; focus?: string; className?: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        const el = document.getElementById(to)
        if (!el) return
        e.preventDefault()
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
        if (focus) setTimeout(() => document.getElementById(focus)?.focus({ preventScroll: true }), reduce ? 0 : 600)
      }}
    >
      {children}
    </a>
  )
}

/** Fades children in when they scroll into view (adds .is-in to .rv). */
export function Reveal({ children, className = '', as: Tag = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { el?.classList.add('is-in'); return }
    const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target) } }), { threshold: 0.12, rootMargin: '0px 0px -30px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Tag ref={ref as any} className={`rv ${className}`}>{children}</Tag>
}

/** Counts a number up from zero when it first appears. Keeps any prefix or suffix text. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const m = value.match(/([\d.,]+)/)
    if (!m || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const raw = m[1].replace(/,/g, '')
    const target = parseFloat(raw)
    if (!Number.isFinite(target)) return
    const dec = (raw.split('.')[1] || '').length
    const grouped = m[1].includes(',')
    const fmt = (v: number) => (grouped ? Math.round(v).toLocaleString('en-IN') : v.toFixed(dec))
    let started = false
    const run = () => {
      if (started) return
      started = true
      const t0 = performance.now()
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 900)
        el.textContent = value.replace(m[1], fmt(target * (1 - Math.pow(1 - k, 3))))
        if (k < 1) requestAnimationFrame(step)
        else el.textContent = value
      }
      requestAnimationFrame(step)
    }
    if (!('IntersectionObserver' in window)) { run(); return }
    const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { run(); io.disconnect() } }), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [value])
  return <b ref={ref} className={className}>{value}</b>
}
