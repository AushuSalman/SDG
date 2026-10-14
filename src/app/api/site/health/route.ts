import { NextResponse } from 'next/server'

import { AI_MODE } from '@/lib/ai/bedrock'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Used by the uptime monitor and the deploy pipeline's smoke check. */
export async function GET() {
  try {
    const payload = await getPayloadClient()
    const users = await payload.count({ collection: 'users', overrideAccess: true })
    return NextResponse.json({ ok: true, time: new Date().toISOString(), db: 'ok', users: users.totalDocs, ai: AI_MODE })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 503 })
  }
}
