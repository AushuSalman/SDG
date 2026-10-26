import { NextResponse, type NextRequest } from 'next/server'

/**
 * First line of defence for the staff sign-in endpoints, which Payload serves and our route handlers cannot wrap:
 * a per-IP window held in memory. Payload also locks an account after 5 wrong passwords (see Users.ts); this stops
 * one address from hammering many accounts. Counters live per server instance, which is exact on the Lightsail
 * container and still useful on serverless hosts. The public form routes use the database-backed limiter in
 * src/lib/ratelimit.ts instead.
 */
const WINDOW_MS = 15 * 60 * 1000
const LIMITS: { test: RegExp; limit: number }[] = [
  { test: /^\/api\/users\/(login|forgot-password|reset-password|unlock)\/?$/, limit: 20 },
  { test: /^\/api\/users\/refresh-token\/?$/, limit: 120 },
]

const hits = new Map<string, { count: number; resetAt: number }>()
let lastSweep = 0

const ip = (req: NextRequest) => (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'

export default function proxy(req: NextRequest) {
  if (req.method !== 'POST') return NextResponse.next()
  const rule = LIMITS.find((r) => r.test.test(req.nextUrl.pathname))
  if (!rule) return NextResponse.next()

  const now = Date.now()
  if (now - lastSweep > WINDOW_MS) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
    lastSweep = now
  }
  const key = `${req.nextUrl.pathname}:${ip(req)}`
  const entry = hits.get(key)
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }
  entry.count += 1
  if (entry.count <= rule.limit) return NextResponse.next()
  const retry = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
  return NextResponse.json(
    { errors: [{ message: 'Too many attempts from this address. Try again later.' }] },
    { status: 429, headers: { 'Retry-After': String(retry), 'Cache-Control': 'no-store' } },
  )
}

export const config = { matcher: ['/api/users/:path*'] }
