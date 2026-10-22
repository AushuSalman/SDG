import Image from 'next/image'
import React from 'react'

/** Sign-in page logo, sized like TailAdmin's auth header. */
export function AdminLogo() {
  return (
    <div className="sdg-logo">
      <Image src="/img/sdg-logo.webp" alt="SDG · Suvarna Durga Group" width={150} height={55} priority />
    </div>
  )
}

/** Compact brand mark used in the breadcrumb home link. */
export function AdminIcon() {
  return (
    <svg className="sdg-icon" viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#101F3C" />
      <text x="16" y="20.5" textAnchor="middle" fontFamily="Outfit, Inter, sans-serif" fontWeight="600" fontSize="11.5" letterSpacing="0.6" fill="#C9A14A">
        SDG
      </text>
    </svg>
  )
}
