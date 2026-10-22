import { NextResponse } from 'next/server'

import { hasRole, type Role } from '@/lib/access'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Staff-only: forgets the consultant's calendar token. Existing events stay on the calendar. */
export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Sign in to the admin first' }, { status: 401 })
  if (!hasRole(user as { role?: Role | null }, 'super-admin', 'management', 'sales', 'support')) return NextResponse.json({ ok: false, error: 'Not allowed' }, { status: 403 })
  const id = new URL(req.url).searchParams.get('consultant') || ''
  await payload.update({ collection: 'consultants', id, overrideAccess: true, data: { calendar: { connectedAs: '', connectedAt: null, refreshToken: '' } } })
  return NextResponse.redirect(new URL(`/admin/collections/consultants/${id}?calendar=disconnected`, req.url))
}
