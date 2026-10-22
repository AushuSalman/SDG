/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addMinutes, authUrl, buildEvent, busySlots, createEvent, readState, signState } from '@/lib/integrations/graph'

describe('calendar event building', () => {
  it('adds minutes within a day and across midnight without time-zone drift', () => {
    expect(addMinutes('2026-10-22T10:00:00', 45)).toBe('2026-10-22T10:45:00')
    expect(addMinutes('2026-10-31T23:30:00', 45)).toBe('2026-11-01T00:15:00')
  })

  it('builds a Graph event in IST with the visitor as attendee', () => {
    const e = buildEvent({ subject: 'SDG consultation: A', bodyText: 'notes', date: '2026-10-22', time: '11:00', minutes: 45, attendees: [{ email: 'a@example.com', name: 'A' }], location: 'Video call', online: true })
    expect(e).toMatchObject({
      subject: 'SDG consultation: A',
      start: { dateTime: '2026-10-22T11:00:00', timeZone: 'Asia/Kolkata' },
      end: { dateTime: '2026-10-22T11:45:00', timeZone: 'Asia/Kolkata' },
      location: { displayName: 'Video call' },
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    })
    expect((e.attendees as { emailAddress: { address: string } }[])[0].emailAddress.address).toBe('a@example.com')
  })

  it('marks hourly slots that overlap a busy block', () => {
    const blocks = [{ start: '2026-10-22T10:30:00', end: '2026-10-22T11:15:00' }, { start: '2026-10-23T09:00:00', end: '2026-10-23T18:00:00' }]
    const busy = busySlots(blocks, ['2026-10-22', '2026-10-23'], ['10:00', '11:00', '12:00'])
    expect(busy).toEqual(['2026-10-22 10:00', '2026-10-22 11:00', '2026-10-23 10:00', '2026-10-23 11:00', '2026-10-23 12:00'])
  })
})

describe('calendar sign-in', () => {
  beforeEach(() => {
    process.env.MS_CLIENT_ID = 'client-1'
    process.env.MS_CLIENT_SECRET = 's'
    process.env.MS_TENANT = 'consumers'
    process.env.MS_REDIRECT_URI = 'https://sdg.test/api/site/calendar/callback'
    process.env.MS_GRAPH_URL = 'https://graph.test'
  })
  afterEach(() => vi.unstubAllGlobals())

  it('sends the consultant through the consumers endpoint with offline access', () => {
    const u = new URL(authUrl('state-1'))
    expect(u.origin + u.pathname).toBe('https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize')
    expect(u.searchParams.get('client_id')).toBe('client-1')
    expect(u.searchParams.get('redirect_uri')).toBe('https://sdg.test/api/site/calendar/callback')
    expect(u.searchParams.get('scope')).toContain('offline_access')
    expect(u.searchParams.get('scope')).toContain('Calendars.ReadWrite')
    expect(u.searchParams.get('state')).toBe('state-1')
  })

  it('signs and reads back the OAuth state', async () => {
    const s = await signState({ consultant: 'c1', user: 'u1' })
    expect(await readState(s)).toEqual({ consultant: 'c1', user: 'u1' })
    expect(await readState('nonsense')).toBeNull()
  })

  it('retries without a Teams meeting when the mailbox cannot host one', async () => {
    const bodies: Record<string, unknown>[] = []
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit = {}) => {
      const body = JSON.parse(String(init.body)) as Record<string, unknown>
      bodies.push(body)
      if (body.isOnlineMeeting) return new Response(JSON.stringify({ error: { message: 'No Teams licence' } }), { status: 400 })
      return new Response(JSON.stringify({ id: 'ev-1', webLink: 'https://outlook.live.com/ev-1' }), { status: 201, headers: { 'content-type': 'application/json' } })
    })
    const r = await createEvent('tok', buildEvent({ subject: 's', bodyText: 'b', date: '2026-10-22', time: '10:00', minutes: 45, online: true }))
    expect(r).toEqual({ id: 'ev-1', webLink: 'https://outlook.live.com/ev-1' })
    expect(bodies).toHaveLength(2)
    expect(bodies[1].isOnlineMeeting).toBe(false)
  })
})
