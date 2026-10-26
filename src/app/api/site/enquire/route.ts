import { NextResponse } from 'next/server'
import { z } from 'zod'

import { clientIp, errorResponse, tooMany } from '@/lib/api'
import { normalizePhone, readVerification } from '@/lib/otp'
import { getPayloadClient } from '@/lib/payload'
import { LIMITS, rateLimit } from '@/lib/ratelimit'
import type { Enquiry } from '@/payload-types'

type Channel = NonNullable<NonNullable<Enquiry['source']>['channel']>
const CHANNELS: Channel[] = ['website', 'whatsapp', 'google-ads', 'meta-ads', 'instagram', 'channel-partner', 'walk-in', 'event', 'prop-ai-bot', 'other']
const asChannel = (v?: string): Channel => (CHANNELS.includes(v as Channel) ? (v as Channel) : 'website')

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Source = z.object({
  channel: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  landingPage: z.string().optional(),
  referrer: z.string().optional(),
})

/** A slot chosen on the Book a meeting page; the consultant is the desk the visitor picked. */
const Meeting = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  mode: z.string().max(60),
  consultantId: z.string().optional(),
})

const Body = z.object({
  phone: z.string().min(8).max(20),
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal('')),
  business: z.enum(['construction', 'paper', 'glass', 'group']).default('construction'),
  type: z.enum(['home', 'commercial', 'paper-trade', 'glass-supply', 'careers', 'general']),
  projectSlug: z.string().optional(),
  purpose: z.enum(['end-use', 'investment', 'business']).optional(),
  budgetBand: z.enum(['under-1cr', '1-2cr', '2-4cr', '4cr-plus', 'undisclosed']).optional(),
  timeline: z.enum(['0-3m', '3-6m', '6-12m', '12m-plus', 'exploring']).optional(),
  preferredLocation: z.string().max(120).optional(),
  configuration: z.string().max(120).optional(),
  quantity: z.string().max(120).optional(),
  recurring: z.boolean().optional(),
  visitReady: z.boolean().optional(),
  loanRequired: z.enum(['yes', 'no', 'unknown']).optional(),
  message: z.string().max(2000).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
  source: Source.optional(),
  meeting: Meeting.optional(),
  /** Verification token from /api/site/otp/verify. Optional on first save so a drop-off is still captured. */
  token: z.string().optional(),
  /** When set, this call verifies an enquiry created earlier instead of creating a new one. */
  enquiryId: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json())
    const payload = await getPayloadClient()
    const limit = await rateLimit(payload, { bucket: 'enquire', id: clientIp(req), ...LIMITS.enquire })
    if (!limit.ok) return tooMany(limit.retryAfterSeconds)
    const phone = normalizePhone(body.phone)
    const verified = await readVerification(body.token)
    const otpVerified = Boolean(verified && verified.purpose === 'enquiry' && verified.phone === phone)

    // One customer per phone number; each enquiry is its own record (questionnaire Q4).
    const existing = await payload.find({ collection: 'customers', overrideAccess: true, where: { phone: { equals: phone } }, limit: 1 })
    const customerData = {
      phone,
      name: body.name,
      email: body.email || undefined,
      consent: true,
      consentAt: new Date().toISOString(),
    }
    const customer = existing.docs[0]
      ? await payload.update({ collection: 'customers', id: existing.docs[0].id, overrideAccess: true, data: customerData })
      : await payload.create({ collection: 'customers', overrideAccess: true, data: customerData })

    let projectId: string | undefined
    if (body.projectSlug) {
      const p = await payload.find({ collection: 'projects', overrideAccess: true, where: { slug: { equals: body.projectSlug } }, limit: 1, depth: 0 })
      projectId = p.docs[0] ? String(p.docs[0].id) : undefined
    }

    const data = {
      customer: customer.id,
      business: body.business,
      type: body.type,
      project: projectId,
      purpose: body.purpose,
      budgetBand: body.budgetBand,
      timeline: body.timeline,
      preferredLocation: body.preferredLocation,
      configuration: body.configuration,
      quantity: body.quantity,
      recurring: body.recurring ?? false,
      visitReady: body.visitReady ?? false,
      loanRequired: body.loanRequired || 'unknown',
      message: body.message,
      consent: true,
      otpVerified,
      source: { ...body.source, channel: asChannel(body.source?.channel) },
      ...(body.meeting ? { meeting: { date: body.meeting.date, time: body.meeting.time, mode: body.meeting.mode }, consultant: body.meeting.consultantId } : {}),
    }

    if (body.enquiryId) {
      const current = await payload.findByID({ collection: 'enquiries', id: body.enquiryId, overrideAccess: true, depth: 0 })
      if (String(typeof current.customer === 'object' ? current.customer.id : current.customer) !== String(customer.id)) {
        return NextResponse.json({ ok: false, error: 'Enquiry does not belong to this number' }, { status: 403 })
      }
      const updated = await payload.update({ collection: 'enquiries', id: body.enquiryId, overrideAccess: true, data })
      return NextResponse.json({ ok: true, id: updated.id, score: updated.score, band: updated.band, otpVerified })
    }

    const created = await payload.create({ collection: 'enquiries', overrideAccess: true, data })
    return NextResponse.json({ ok: true, id: created.id, score: created.score, band: created.band, otpVerified })
  } catch (err) {
    return errorResponse(err)
  }
}
