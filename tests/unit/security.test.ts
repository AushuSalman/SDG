/** @vitest-environment node */
import { describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'

import { LIMITS, rateLimit } from '@/lib/ratelimit'
import { isHttpUrl, safeHref } from '@/lib/validate'

/** A Payload whose database connection counts in memory the way the Mongo upsert does. */
function fakePayload(opts: { fail?: boolean } = {}) {
  const docs = new Map<string, { count: number; expiresAt: Date }>()
  const warn = vi.fn()
  const collection = () => ({
    findOneAndUpdate: async (filter: { key: string }, update: { $setOnInsert: { expiresAt: Date } }) => {
      if (opts.fail) throw new Error('mongo down')
      const cur = docs.get(filter.key) || { count: 0, expiresAt: update.$setOnInsert.expiresAt }
      cur.count += 1
      docs.set(filter.key, cur)
      return { key: filter.key, ...cur }
    },
  })
  return { payload: { db: { connection: { collection } }, logger: { warn } } as unknown as Payload, docs, warn }
}

describe('rateLimit', () => {
  it('allows up to the limit in a window, then refuses with a retry time', async () => {
    const { payload } = fakePayload()
    const opts = { bucket: 'enquire', id: '1.2.3.4', limit: 3, windowMs: 60_000 }
    const results = []
    for (let i = 0; i < 5; i++) results.push(await rateLimit(payload, opts))
    expect(results.map((r) => r.ok)).toEqual([true, true, true, false, false])
    expect(results[2].remaining).toBe(0)
    expect(results[3].retryAfterSeconds).toBeGreaterThan(0)
    expect(results[3].retryAfterSeconds).toBeLessThanOrEqual(60)
  })

  it('keeps callers and buckets apart', async () => {
    const { payload, docs } = fakePayload()
    await rateLimit(payload, { bucket: 'chat', id: 'a', limit: 1, windowMs: 60_000 })
    const other = await rateLimit(payload, { bucket: 'chat', id: 'b', limit: 1, windowMs: 60_000 })
    const otherBucket = await rateLimit(payload, { bucket: 'enquire', id: 'a', limit: 1, windowMs: 60_000 })
    expect(other.ok).toBe(true)
    expect(otherBucket.ok).toBe(true)
    expect(docs.size).toBe(3)
  })

  it('fails open with a warning when the database is unavailable', async () => {
    const { payload, warn } = fakePayload({ fail: true })
    const r = await rateLimit(payload, { bucket: 'enquire', id: 'x', ...LIMITS.enquire })
    expect(r.ok).toBe(true)
    expect(warn).toHaveBeenCalledTimes(1)
  })
})

describe('isHttpUrl', () => {
  it('accepts empty values and web addresses only', () => {
    expect(isHttpUrl('')).toBe(true)
    expect(isHttpUrl(undefined)).toBe(true)
    expect(isHttpUrl('https://sdg.in/about')).toBe(true)
    expect(isHttpUrl('http://example.com')).toBe(true)
    expect(isHttpUrl('javascript:alert(1)')).not.toBe(true)
    expect(isHttpUrl('data:text/html,hi')).not.toBe(true)
    expect(isHttpUrl('sdg.in')).not.toBe(true)
    expect(isHttpUrl('x'.repeat(3000))).not.toBe(true)
  })
})

describe('safeHref', () => {
  it('keeps web, mail, phone and same-site addresses and neutralises the rest', () => {
    expect(safeHref('https://sdg.in')).toBe('https://sdg.in')
    expect(safeHref('mailto:hello@sdg.in')).toBe('mailto:hello@sdg.in')
    expect(safeHref('tel:+914040001978')).toBe('tel:+914040001978')
    expect(safeHref('/projects/prinia')).toBe('/projects/prinia')
    expect(safeHref('#csr')).toBe('#csr')
    expect(safeHref('javascript:alert(1)')).toBe('#')
    expect(safeHref(' JAVASCRIPT:alert(1)')).toBe('#')
    expect(safeHref('//evil.example')).toBe('#')
    expect(safeHref('')).toBe('#')
    expect(safeHref(undefined)).toBe('#')
  })
})
