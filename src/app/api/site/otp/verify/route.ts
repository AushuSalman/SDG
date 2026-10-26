import { NextResponse } from 'next/server'
import { z } from 'zod'

import { PORTAL_COOKIE, clientIp, errorResponse, tooMany } from '@/lib/api'
import { signVerification, verifyOtp } from '@/lib/otp'
import { getPayloadClient } from '@/lib/payload'
import { LIMITS, rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Body = z.object({
  phone: z.string().min(8).max(20),
  code: z.string().min(4).max(8),
  purpose: z.enum(['enquiry', 'portal']).default('enquiry'),
})

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json())
    const payload = await getPayloadClient()
    const limit = await rateLimit(payload, { bucket: 'otp-verify', id: clientIp(req), ...LIMITS.otpVerify })
    if (!limit.ok) return tooMany(limit.retryAfterSeconds)
    const { phone } = await verifyOtp(payload, body)
    if (body.purpose === 'portal') {
      const token = await signVerification(phone, 'portal', '7d')
      const res = NextResponse.json({ ok: true, phone })
      res.cookies.set(PORTAL_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 7 * 24 * 3600,
      })
      return res
    }
    const token = await signVerification(phone, 'enquiry', '15m')
    return NextResponse.json({ ok: true, phone, token })
  } catch (err) {
    return errorResponse(err)
  }
}
