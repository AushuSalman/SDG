import { NextResponse } from 'next/server'
import { z } from 'zod'

import { clientIp, errorResponse } from '@/lib/api'
import { createOtp } from '@/lib/otp'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Body = z.object({
  phone: z.string().min(8).max(20),
  purpose: z.enum(['enquiry', 'portal']).default('enquiry'),
})

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json())
    const payload = await getPayloadClient()
    const res = await createOtp(payload, { phone: body.phone, purpose: body.purpose, ip: clientIp(req) })
    // The code is shown to the caller only when no SMS can go out: development, or OTP_MODE=mock set
    // deliberately on a staging host without an SMS provider. Production must never set OTP_MODE=mock.
    const expose = res.mockCode && (process.env.NODE_ENV !== 'production' || process.env.OTP_MODE === 'mock')
    return NextResponse.json({ ok: true, ...(expose ? { mockCode: res.mockCode } : {}) })
  } catch (err) {
    return errorResponse(err)
  }
}
