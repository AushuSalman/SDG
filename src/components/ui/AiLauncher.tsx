'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { IconChat } from './icons'
import { useUi } from './UiProvider'

/** The always-visible way into the AI consultant: a pill above the quick-actions dock on every public page. */
export function AiLauncher() {
  const ui = useUi()
  const path = usePathname() || '/'
  if (ui.aiOpen || path.startsWith('/admin')) return null
  return (
    <button type="button" className="ai-launch" onClick={() => ui.openAI()} aria-label="Ask SDG, the AI consultant">
      <IconChat className="ai-launch-ico" />
      <span>Ask SDG</span>
    </button>
  )
}
