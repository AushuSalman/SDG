import { NextResponse } from 'next/server'

import { exchangeCode, me, readState } from '@/lib/integrations/graph'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const adminPage = (req: Request, consultant: string, status: string) => NextResponse.redirect(new URL(`/admin/collections/consultants/${consultant}?calendar=${status}`, req.url))

/** Microsoft returns here after sign-in; the refresh token is stored on the consultant named in the signed state. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const state = await readState(url.searchParams.get('state'))
  if (!state) return NextResponse.json({ ok: false, error: 'Sign-in state expired. Start again from the consultant page.' }, { status: 400 })
  const error = url.searchParams.get('error')
  if (error) return adminPage(req, state.consultant, `error:${encodeURIComponent(url.searchParams.get('error_description') || error)}`)
  const code = url.searchParams.get('code')
  if (!code) return adminPage(req, state.consultant, 'error:No%20code%20returned')
  try {
    const tokens = await exchangeCode(code)
    if (!tokens.refresh_token) throw new Error('Microsoft did not return a refresh token; the app registration needs the offline_access permission')
    const who = await me(tokens.access_token)
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'consultants',
      id: state.consultant,
      overrideAccess: true,
      data: { calendar: { connectedAs: who.email, connectedAt: new Date().toISOString(), refreshToken: tokens.refresh_token } },
    })
    return adminPage(req, state.consultant, 'connected')
  } catch (err) {
    return adminPage(req, state.consultant, `error:${encodeURIComponent(String(err instanceof Error ? err.message : err).slice(0, 200))}`)
  }
}
