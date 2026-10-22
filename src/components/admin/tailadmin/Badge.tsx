import React from 'react'

type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark'

const LIGHT: Record<BadgeColor, string> = {
  primary: 'bg-brand-50 text-brand-500',
  success: 'bg-success-50 text-success-600',
  error: 'bg-error-50 text-error-600',
  warning: 'bg-warning-50 text-warning-600',
  info: 'bg-blue-light-50 text-blue-light-500',
  light: 'bg-gray-100 text-gray-700',
  dark: 'bg-gray-500 text-white',
}

const SOLID: Record<BadgeColor, string> = {
  primary: 'bg-brand-500 text-white',
  success: 'bg-success-500 text-white',
  error: 'bg-error-500 text-white',
  warning: 'bg-warning-500 text-white',
  info: 'bg-blue-light-500 text-white',
  light: 'bg-gray-400 text-white',
  dark: 'bg-gray-700 text-white',
}

/** TailAdmin's pill badge (light or solid), used for statuses and deltas. */
export function Badge({
  color = 'primary',
  variant = 'light',
  size = 'md',
  children,
}: {
  color?: BadgeColor
  variant?: 'light' | 'solid'
  size?: 'sm' | 'md'
  children: React.ReactNode
}) {
  const palette = variant === 'solid' ? SOLID : LIGHT
  return (
    <span className={`inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${size === 'sm' ? 'text-theme-xs' : 'text-sm'} ${palette[color]}`}>
      {children}
    </span>
  )
}
