'use client'

import React from 'react'

/**
 * Loads Outfit, the TailAdmin typeface, for the admin only. Registered as an admin provider so it wraps every
 * admin page including sign-in; React hoists the links into <head>. The public site loads its own fonts.
 */
export function AdminFonts({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* App Router: React hoists this into <head> for every admin page, so the pages/_document rule does not apply. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" />
      {children}
    </>
  )
}
