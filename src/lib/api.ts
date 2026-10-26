import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

import { OtpError } from './otp'

export function clientIp(req: Request): string | undefined {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || undefined
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const first = err.issues[0]
    return NextResponse.json({ ok: false, error: `${first?.path.join('.') || 'input'}: ${first?.message || 'invalid'}` }, { status: 400 })
  }
  if (err instanceof OtpError) return NextResponse.json({ ok: false, error: err.message }, { status: err.status })
  console.error(err)
  return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
}

/** 429 for the public routes once a caller has used up its window (see src/lib/ratelimit.ts). */
export function tooMany(retryAfterSeconds: number): NextResponse {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60))
  return NextResponse.json(
    { ok: false, error: `Too many requests. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds), 'Cache-Control': 'no-store' } },
  )
}

/** True when the browser says the request came from this site itself (Fetch Metadata, with Origin as fallback). */
export function sameOrigin(req: Request): boolean {
  const site = req.headers.get('sec-fetch-site')
  if (site) return site === 'same-origin'
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export const PORTAL_COOKIE = 'sdg_portal'
