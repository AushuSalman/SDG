import { NextResponse } from 'next/server'

import { clientIp, tooMany } from '@/lib/api'
import { slotsFromHours } from '@/lib/hours'
import { busySlots, busyTimes, calendarConfigured, refreshTokens } from '@/lib/integrations/graph'
import { getPayloadClient } from '@/lib/payload'
import { LIMITS, rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DAY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Public: which hourly slots a consultant already has taken between two dates (at most 14 days), as
 * "YYYY-MM-DD HH:MM" keys. Only the slot keys leave the server, never the events. Empty when no calendar is connected.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const consultantId = url.searchParams.get('consultant') || ''
  const from = url.searchParams.get('from') || ''
  const to = url.searchParams.get('to') || from
  if (!consultantId || !DAY.test(from) || !DAY.test(to)) return NextResponse.json({ ok: false, error: 'consultant, from and to (YYYY-MM-DD) are required' }, { status: 400 })
  const span = (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000
  if (span < 0 || span > 14) return NextResponse.json({ ok: false, error: 'Range must be 0 to 14 days' }, { status: 400 })
  try {
    const payload = await getPayloadClient()
    const limit = await rateLimit(payload, { bucket: 'calendar-busy', id: clientIp(req), ...LIMITS.calendarBusy })
    if (!limit.ok) return tooMany(limit.retryAfterSeconds)
    const consultant = await payload.findByID({ collection: 'consultants', id: consultantId, depth: 0, overrideAccess: true })
    const refresh = consultant.calendar?.refreshToken
    if (!calendarConfigured() || !refresh) return NextResponse.json({ ok: true, connected: false, busy: [] })
    const tokens = await refreshTokens(refresh)
    const blocks = await busyTimes(tokens.access_token, `${from}T00:00:00`, `${to}T23:59:59`)
    const dates: string[] = []
    for (let i = 0; i <= span; i++) {
      const d = new Date(`${from}T00:00:00Z`)
      d.setUTCDate(d.getUTCDate() + i)
      dates.push(d.toISOString().slice(0, 10))
    }
    const busy = busySlots(blocks, dates, slotsFromHours(consultant.hoursFrom, consultant.hoursTo))
    return NextResponse.json({ ok: true, connected: true, busy }, { headers: { 'cache-control': 'private, max-age=60' } })
  } catch (err) {
    // Availability is a convenience: a Graph hiccup must never block the scheduler.
    return NextResponse.json({ ok: true, connected: false, busy: [], note: String(err instanceof Error ? err.message : err).slice(0, 120) })
  }
}
