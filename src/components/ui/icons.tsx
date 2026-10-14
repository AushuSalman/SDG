import React from 'react'

type P = { className?: string; title?: string }
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const svg = (paths: React.ReactNode, extra: Partial<typeof base> = {}) =>
  function Icon({ className, title }: P) {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} {...base} {...extra}>
        {title && <title>{title}</title>}
        {paths}
      </svg>
    )
  }

/* Header and contact icons, as drawn in the wireframe. */
export const IconShare = svg(<><circle cx="6" cy="12" r="2.6" /><circle cx="17" cy="6.5" r="2.6" /><circle cx="17" cy="17.5" r="2.6" /><path d="m8.4 10.8 6.2-3.1M8.4 13.2l6.2 3.1" /></>, { strokeWidth: 1.9 })
export const IconSearch = svg(<><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>, { strokeWidth: 1.9 })
export const IconPin = svg(<><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>, { strokeWidth: 1.9 })
export const IconHeadset = svg(<><path d="M4 13v-1a8 8 0 0 1 16 0v1" /><rect x="2.6" y="13" width="4.4" height="7" rx="2" /><rect x="17" y="13" width="4.4" height="7" rx="2" /><path d="M19 20v.6a2.4 2.4 0 0 1-2.4 2.4H13" /></>, { strokeWidth: 1.9 })
export const IconPhone = svg(<path d="M6.6 3h2.9l1.5 4.4-2 1.4a12.2 12.2 0 0 0 6.2 6.2l1.4-2L21 14.5v2.9a2.6 2.6 0 0 1-2.8 2.6A16.6 16.6 0 0 1 4 5.8 2.6 2.6 0 0 1 6.6 3Z" />)
export const IconCalendar = svg(<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>)
export const IconShield = svg(<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z" /><path d="m9 12 2 2 4-4" /></>)
export const IconWhatsapp = svg(<><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" /><path d="M9.2 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.5l-.5.6c-.1.2-.2.3 0 .5a7 7 0 0 0 3.1 2.8c.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.6-.1l1.5.7c.2.1.4.2.4.4a2 2 0 0 1-1.5 1.9c-1.1.3-2.4-.1-4.1-1.3a10 10 0 0 1-3.1-3.6c-.6-1.2-.4-2.3.1-3.1Z" fill="currentColor" stroke="none" /></>, { strokeWidth: 1.7 })
export const IconFacebook = svg(<path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.4V5.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.3v3h2.4v7h2.8Z" fill="currentColor" stroke="none" />)
export const IconLinkedin = svg(<path d="M6.5 8.5h-3V20h3V8.5ZM5 3.8a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.5 13c0-3.3-1.8-4.8-4.1-4.8-1.5 0-2.5.8-3 1.5V8.5h-3V20h3v-6.2c0-1.6.6-2.5 2-2.5 1.2 0 1.8.8 1.8 2.5V20h3v-7Z" fill="currentColor" stroke="none" />)
export const IconInstagram = svg(<><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" /></>)

/* Construction process, seven steps. */
export const RE_STEP_ICONS = [
  svg(<><path d="M4 4h12l4 4v12H4Z" /><path d="M16 4v4h4" /><path d="m9 16 6-6 2 2-6 6H9Z" /></>, { strokeWidth: 1.5 }),
  svg(<><path d="M3 19h18" /><rect x="3" y="13" width="7" height="5" rx="1" /><path d="M10 15h4l3-6 3 2" /><circle cx="17" cy="7" r="1.6" /></>, { strokeWidth: 1.5 }),
  svg(<><path d="M3 20h18" /><rect x="5" y="8" width="5" height="12" /><rect x="13" y="4" width="6" height="16" /><path d="M6.5 11h2M6.5 14h2M15 7h2M15 11h2M15 15h2" /></>, { strokeWidth: 1.5 }),
  svg(<><circle cx="12" cy="12" r="3.2" /><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6" /></>, { strokeWidth: 1.5 }),
  svg(<><rect x="3" y="4" width="13" height="5" rx="1.5" /><path d="M16 6.5h4v4h-7v3" /><rect x="11" y="13.5" width="4" height="6.5" rx="1" /></>, { strokeWidth: 1.5 }),
  svg(<><path d="M3.5 17a8.5 8.5 0 0 1 17 0Z" /><path d="M9 17V7.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V17" /><path d="M2.5 17h19" /></>, { strokeWidth: 1.5 }),
  svg(<><circle cx="8" cy="8" r="4" /><path d="m11 11 8 8M16 16l2-2M19 19l2-2" /></>, { strokeWidth: 1.5 }),
]

/* Paper process, seven steps. */
export const PP_STEP_ICONS = [
  svg(<><path d="M4 19c3-7 7-11 16-13" /><path d="M6 19c1-5 4-8 9-9.5" /><path d="M3 19h18" /></>, { strokeWidth: 1.5 }),
  svg(<><path d="M4 8h16v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" /><path d="M4 8c2-3 14-3 16 0" /><path d="M8 13c2 1.5 6 1.5 8 0" /></>, { strokeWidth: 1.5 }),
  svg(<><rect x="3" y="9" width="18" height="8" rx="2" /><circle cx="8" cy="13" r="2" /><circle cx="16" cy="13" r="2" /><path d="M3 20h18M6 9V6h12v3" /></>, { strokeWidth: 1.5 }),
  svg(<><circle cx="12" cy="12" r="4" /><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" /></>, { strokeWidth: 1.5 }),
  svg(<><circle cx="9" cy="12" r="5" /><circle cx="9" cy="12" r="1.4" /><path d="M9 7h9a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9" /></>, { strokeWidth: 1.5 }),
  svg(<><path d="M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" /><path d="M9 3h6" /><path d="M7.5 15h9" /></>, { strokeWidth: 1.5 }),
  svg(<><rect x="2" y="7" width="12" height="9" rx="1" /><path d="M14 10h4l3 3v3h-7Z" /><circle cx="6.5" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></>, { strokeWidth: 1.5 }),
]

/* Glass bottle cycle, seven steps. */
export const GL_STEP_ICONS = [
  svg(<><rect x="2" y="7" width="12" height="9" rx="1" /><path d="M14 10h4l3 3v3h-7Z" /><circle cx="6.5" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></>, { strokeWidth: 1.1 }),
  svg(<><path d="M4.4 8h1.2v3l1 1.2V20H2.2v-7.8L4.4 11Z" /><path d="M11.4 4.5h1.2V9l1 1.2V20H9.2V10.2L11.4 9Z" /><path d="M18.4 7h1.2v3.5l1 1.2V20h-4.4v-8.3L18.4 10.5Z" /></>, { strokeWidth: 1.1 }),
  svg(<><path d="M11.1 2.5h1.8V7l1.3 1.6v12.9H8.5V8.6L11.1 7Z" /><path d="M8.5 15h5.7" /><path d="M5 9.5c0 .8-.6 1.4-1.3 1.4S2.4 10.3 2.4 9.5 3.7 7 3.7 7 5 8.7 5 9.5Z" /><path d="M21.6 9.5c0 .8-.6 1.4-1.3 1.4s-1.3-.6-1.3-1.4S20.3 7 20.3 7s1.3 1.7 1.3 2.5Z" /></>, { strokeWidth: 1.1 }),
  svg(<><path d="M8.1 2.5h1.8V7l1.3 1.6v12.9H5.5V8.6L8.1 7Z" /><path d="m15 15 2.2 2.2L22 12.5" /></>, { strokeWidth: 1.1 }),
  svg(<><rect x="3" y="9" width="18" height="11" rx="1.5" /><path d="M9 9v11M15 9v11M3 14.5h18" /><path d="M6 9V6.5M12 9V6.5M18 9V6.5" /></>, { strokeWidth: 1.1 }),
  svg(<><path d="M2.5 10 12 4l9.5 6V21h-19Z" /><path d="M8 21v-6h8v6" /><path d="M8 15h8" /></>, { strokeWidth: 1.1 }),
  svg(<><path d="M5 12a7 7 0 0 1 12-5" /><path d="M19 12a7 7 0 0 1-12 5" /><path d="M17 4v3.5h-3.5M7 20v-3.5h3.5" /></>, { strokeWidth: 1.1 }),
]

/* Paper customisation options and order flow. */
export const PP_OPT_ICONS = [
  svg(<><path d="M4 9V4h5M20 15v5h-5" /><path d="m4 4 6 6M20 20l-6-6" /></>, { strokeWidth: 1.2 }),
  svg(<path d="M12 3s6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 6-10 6-10Z" />, { strokeWidth: 1.2 }),
  svg(<><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5" /><path d="m3 17.5 9 5 9-5" /></>, { strokeWidth: 1.2 }),
  svg(<><path d="M11 3.5 12.7 8.3 17.5 10l-4.8 1.7L11 16.5 9.3 11.7 4.5 10l4.8-1.7Z" /><path d="M18.5 14.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" /></>, { strokeWidth: 1.2 }),
]
export const PP_FLOW_ICONS = [
  svg(<><path d="M4 5h16v11H9.5L4 20Z" /><path d="M8 9h8M8 12.5h5" /></>, { strokeWidth: 1.2 }),
  svg(<><circle cx="12" cy="12" r="8.2" /><path d="m8.4 12.2 2.5 2.5 4.7-5" /></>, { strokeWidth: 1.2 }),
  svg(<><path d="M5 3h9l5 5v13H5Z" /><path d="M14 3v5h5" /><path d="m9 16.5 2 2 4-4.3" /></>, { strokeWidth: 1.2 }),
  svg(<><rect x="1.8" y="7" width="12" height="9" rx="1" /><path d="M13.8 10h4l3.4 3.2V16h-7.4Z" /><circle cx="6.3" cy="18.4" r="1.7" /><circle cx="17.6" cy="18.4" r="1.7" /></>, { strokeWidth: 1.2 }),
]
export const PP_TRADE_ICONS = [
  ({ className }: P) => <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15 24 7l18 8-18 8-18-8Z" /><path d="M6 15v18l18 8 18-8V15" /><path d="M24 23v18" /><path d="m15 11 18 8v7" /></svg>,
  ({ className }: P) => <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14 24 6l18 8-18 8-18-8Z" /><path d="m6 24 18 8 18-8" /><path d="m6 34 18 8 18-8" /></svg>,
  ({ className }: P) => <svg viewBox="0 0 48 48" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 42V22l10 6v-6l10 6v-6l10 6V8h6v34H5Z" /><path d="M11 36h4M21 36h4M31 36h4" /></svg>,
]
