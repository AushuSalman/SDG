import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { PORTAL_COOKIE, errorResponse } from '@/lib/api'
import { readVerification } from '@/lib/otp'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function session() {
  const jar = await cookies()
  const s = await readVerification(jar.get(PORTAL_COOKIE)?.value)
  return s && s.purpose === 'portal' ? s : null
}

/** The signed-in customer's journey: their enquiries, consultants, statuses and consent. */
export async function GET() {
  try {
    const s = await session()
    if (!s) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 })
    const payload = await getPayloadClient()
    const customer = await payload.find({ collection: 'customers', overrideAccess: true, where: { phone: { equals: s.phone } }, limit: 1 })
    const c = customer.docs[0]
    if (!c) return NextResponse.json({ ok: true, phone: s.phone, consent: false, enquiries: [] })
    const enquiries = await payload.find({ collection: 'enquiries', overrideAccess: true, where: { customer: { equals: c.id } }, sort: '-createdAt', depth: 1, limit: 50 })
    return NextResponse.json({
      ok: true,
      phone: s.phone,
      name: c.name,
      email: c.email || null,
      consent: Boolean(c.consent),
      enquiries: enquiries.docs.map((e) => ({
        id: e.id,
        createdAt: e.createdAt,
        business: e.business,
        type: e.type,
        project: typeof e.project === 'object' && e.project ? { name: e.project.name, slug: e.project.slug } : null,
        status: e.status,
        otpVerified: Boolean(e.otpVerified),
        visitReady: Boolean(e.visitReady),
        message: e.message || null,
        consultant: typeof e.consultant === 'object' && e.consultant ? { name: e.consultant.name, phone: e.consultant.phone } : null,
      })),
    })
  } catch (err) {
    return errorResponse(err)
  }
}

const Prefs = z.object({ consent: z.boolean() })

/** Consent is recorded per customer and can be withdrawn here at any time. */
export async function PATCH(req: Request) {
  try {
    const s = await session()
    if (!s) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 })
    const body = Prefs.parse(await req.json())
    const payload = await getPayloadClient()
    const customer = await payload.find({ collection: 'customers', overrideAccess: true, where: { phone: { equals: s.phone } }, limit: 1 })
    if (!customer.docs[0]) return NextResponse.json({ ok: false, error: 'No record for this number yet' }, { status: 404 })
    await payload.update({ collection: 'customers', id: customer.docs[0].id, overrideAccess: true, data: { consent: body.consent, consentAt: new Date().toISOString() } })
    return NextResponse.json({ ok: true, consent: body.consent })
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(PORTAL_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
