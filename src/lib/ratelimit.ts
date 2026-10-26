import type { Payload } from 'payload'

/**
 * Fixed-window rate limiter backed by MongoDB, so every instance of the app (Vercel functions, the Render container,
 * the Lightsail container) shares the same counters. One document per bucket, caller and window; a TTL index on
 * expiresAt (created at init, see payload.config.ts) removes old windows. A database error fails open with a warning:
 * a broken limiter must not take the forms down.
 */
export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number }

type Opts = {
  /** What is being limited, e.g. "enquire" */
  bucket: string
  /** Who is being limited: usually the client IP, sometimes a session or phone */
  id: string | undefined
  /** Requests allowed per window */
  limit: number
  windowMs: number
}

export const RATE_LIMIT_COLLECTION = 'rate-limits'

type Doc = { key: string; count: number; expiresAt: Date }
type Conn = { collection: (name: string) => { findOneAndUpdate: (filter: object, update: object, options: object) => Promise<Doc | { value?: Doc | null } | null> } }

export async function rateLimit(payload: Payload, opts: Opts): Promise<RateLimitResult> {
  const id = (opts.id || 'unknown').slice(0, 120)
  const windowStart = Math.floor(Date.now() / opts.windowMs) * opts.windowMs
  const windowEnd = windowStart + opts.windowMs
  const key = `${opts.bucket}:${id}:${windowStart}`
  try {
    const conn = (payload.db as unknown as { connection?: Conn }).connection
    if (!conn) return { ok: true, remaining: opts.limit, retryAfterSeconds: 0 }
    const raw = await conn.collection(RATE_LIMIT_COLLECTION).findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { key, expiresAt: new Date(windowEnd + opts.windowMs) } },
      { upsert: true, returnDocument: 'after' },
    )
    const doc = (raw && 'value' in (raw as object) ? (raw as { value?: Doc | null }).value : (raw as Doc | null)) || null
    const count = doc?.count ?? 1
    const ok = count <= opts.limit
    return { ok, remaining: Math.max(0, opts.limit - count), retryAfterSeconds: ok ? 0 : Math.max(1, Math.ceil((windowEnd - Date.now()) / 1000)) }
  } catch (err) {
    payload.logger.warn(`rate limit unavailable (${opts.bucket}): ${String(err)}`)
    return { ok: true, remaining: opts.limit, retryAfterSeconds: 0 }
  }
}

/** Limits used by the public routes: generous for people, tight for scripts. */
export const LIMITS = {
  enquire: { limit: 10, windowMs: 10 * 60 * 1000 },
  otpSend: { limit: 15, windowMs: 10 * 60 * 1000 },
  otpVerify: { limit: 30, windowMs: 10 * 60 * 1000 },
  chat: { limit: 40, windowMs: 10 * 60 * 1000 },
  chatSession: { limit: 60, windowMs: 60 * 60 * 1000 },
  calendarBusy: { limit: 60, windowMs: 10 * 60 * 1000 },
  portal: { limit: 60, windowMs: 10 * 60 * 1000 },
} as const
