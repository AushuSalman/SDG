import React from 'react'

/** Right-hand side of the admin header on every view: a quick way back to the public site. */
export function HeaderActions() {
  return (
    <div className="ta flex items-center gap-2">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 sm:inline-flex"
      >
        View website
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 3H3v10h10v-3M9 3h4v4M13 3 7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  )
}
