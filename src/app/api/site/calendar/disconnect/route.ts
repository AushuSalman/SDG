import { NextResponse } from 'next/server'

import { hasRole, type Role } from '@/lib/access'
import { sameOrigin } from '@/lib/api'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Staff-only: forgets the consultant's calendar token. Existing events stay on the calendar. A POST from the admin
 * page itself (not a link, so no other site can trigger it with the staff cookie); the button is in CalendarConnect.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, error: 'Cross-site request refused' }, { status: 403 })
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Sign in to the admin first' }, { status: 401 })
  if (!hasRole(user as { role?: Role | null }, 'super-admin', 'management', 'sales', 'support')) return NextResponse.json({ ok: false, error: 'Not allowed' }, { status: 403 })
  const id = new URL(req.url).searchParams.get('consultant') || ''
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ ok: false, error: 'consultant is required' }, { status: 400 })
  await payload.update({ collection: 'consultants', id, overrideAccess: true, data: { calendar: { connectedAs: '', connectedAt: null, refreshToken: '' } } })
  return NextResponse.json({ ok: true })
}
