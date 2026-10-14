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

export const PORTAL_COOKIE = 'sdg_portal'
