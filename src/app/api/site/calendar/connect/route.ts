import { NextResponse } from 'next/server'

import { hasRole, type Role } from '@/lib/access'
import { authUrl, calendarConfigured, signState } from '@/lib/integrations/graph'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Staff-only: starts Microsoft sign-in for a consultant's calendar and comes back through /callback. */
export async function GET(req: Request) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) return NextResponse.json({ ok: false, error: 'Sign in to the admin first' }, { status: 401 })
  if (!hasRole(user as { role?: Role | null }, 'super-admin', 'management', 'sales', 'support')) return NextResponse.json({ ok: false, error: 'Not allowed' }, { status: 403 })
  if (!calendarConfigured()) {
    return new NextResponse('The Outlook calendar connection is not configured on this server. Set MS_CLIENT_ID, MS_CLIENT_SECRET and MS_TENANT in the environment, then try again.', { status: 503, headers: { 'content-type': 'text/plain' } })
  }
  const consultantId = new URL(req.url).searchParams.get('consultant') || ''
  const consultant = await payload.findByID({ collection: 'consultants', id: consultantId, depth: 0, overrideAccess: true }).catch(() => null)
  if (!consultant) return NextResponse.json({ ok: false, error: 'Consultant not found' }, { status: 404 })
  const state = await signState({ consultant: String(consultant.id), user: String(user.id) })
  return NextResponse.redirect(authUrl(state))
}
