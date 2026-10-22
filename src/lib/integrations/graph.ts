import { SignJWT, jwtVerify } from 'jose'

/**
 * Microsoft Graph calendar adapter. Each consultant connects their own Microsoft 365 or Outlook.com calendar from the
 * admin (OAuth authorisation-code flow with offline access); the stored refresh token lets the booking job create
 * events on that calendar and lets the scheduler grey out busy slots.
 * Live when MS_CLIENT_ID and MS_CLIENT_SECRET are set (an Entra app registration). MS_TENANT: "common" (any
 * Microsoft account), "consumers" (personal Outlook.com only), "organizations", or a tenant ID.
 */
const login = () => (process.env.MS_LOGIN_URL || 'https://login.microsoftonline.com').replace(/\/$/, '')
const graphUrl = () => (process.env.MS_GRAPH_URL || 'https://graph.microsoft.com/v1.0').replace(/\/$/, '')
const tenant = () => process.env.MS_TENANT || 'common'

export const SCOPES = 'offline_access openid profile email User.Read Calendars.ReadWrite'
export const TIME_ZONE = 'Asia/Kolkata'

export function calendarConfigured(): boolean {
  return Boolean(process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET)
}

export function redirectUri(): string {
  return process.env.MS_REDIRECT_URI || `${(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')}/api/site/calendar/callback`
}

export function authUrl(state: string): string {
  const q = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: redirectUri(),
    response_mode: 'query',
    scope: SCOPES,
    state,
    prompt: 'select_account',
  })
  return `${login()}/${tenant()}/oauth2/v2.0/authorize?${q}`
}

export type Tokens = { access_token: string; refresh_token?: string; expires_in?: number }

async function tokenRequest(params: Record<string, string>): Promise<Tokens> {
  const body = new URLSearchParams({ client_id: process.env.MS_CLIENT_ID || '', client_secret: process.env.MS_CLIENT_SECRET || '', ...params })
  const res = await fetch(`${login()}/${tenant()}/oauth2/v2.0/token`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body })
  const json = (await res.json().catch(() => ({}))) as Tokens & { error?: string; error_description?: string }
  if (!res.ok || !json.access_token) throw new Error(`Microsoft sign-in failed: ${json.error_description || json.error || res.status}`)
  return json
}

export const exchangeCode = (code: string): Promise<Tokens> => tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: redirectUri(), scope: SCOPES })
export const refreshTokens = (refreshToken: string): Promise<Tokens> => tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken, scope: SCOPES })

async function graph<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${graphUrl()}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', Prefer: `outlook.timezone="${TIME_ZONE}"`, ...(init.headers || {}) },
  })
  if (!res.ok) throw new Error(`Microsoft Graph ${res.status}: ${(await res.text()).slice(0, 300)}`)
  return (res.status === 204 ? {} : await res.json()) as T
}

export async function me(token: string): Promise<{ email: string; name: string }> {
  const j = await graph<{ mail?: string; userPrincipalName?: string; displayName?: string }>(token, '/me?$select=mail,userPrincipalName,displayName')
  return { email: j.mail || j.userPrincipalName || '', name: j.displayName || '' }
}

export type EventInput = {
  subject: string
  bodyText: string
  date: string // YYYY-MM-DD
  time: string // HH:MM, consultant's local time
  minutes: number
  attendees?: { email: string; name?: string | null }[]
  location?: string
  online?: boolean
}

/** Adds minutes to a local "YYYY-MM-DDTHH:MM:00" without any time-zone conversion. */
export function addMinutes(dateTime: string, minutes: number): string {
  const [d, t] = dateTime.split('T')
  const [h, m] = t.split(':').map(Number)
  const total = h * 60 + m + minutes
  const day = Math.floor(total / 1440)
  const hh = Math.floor((total % 1440) / 60)
  const mm = total % 60
  let date = d
  if (day) {
    const x = new Date(`${d}T00:00:00Z`)
    x.setUTCDate(x.getUTCDate() + day)
    date = x.toISOString().slice(0, 10)
  }
  return `${date}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`
}

/** The Graph event body for a booking; attendees receive Outlook's own invitation. */
export function buildEvent(i: EventInput): Record<string, unknown> {
  const start = `${i.date}T${i.time}:00`
  return {
    subject: i.subject,
    body: { contentType: 'text', content: i.bodyText },
    start: { dateTime: start, timeZone: TIME_ZONE },
    end: { dateTime: addMinutes(start, i.minutes), timeZone: TIME_ZONE },
    location: i.location ? { displayName: i.location } : undefined,
    attendees: (i.attendees || []).filter((a) => a.email).map((a) => ({ emailAddress: { address: a.email, name: a.name || undefined }, type: 'required' })),
    isOnlineMeeting: Boolean(i.online),
    onlineMeetingProvider: i.online ? 'teamsForBusiness' : undefined,
    reminderMinutesBeforeStart: 30,
    categories: ['SDG website'],
  }
}

export type CreatedEvent = { id: string; webLink?: string; joinUrl?: string }

export async function createEvent(token: string, body: Record<string, unknown>): Promise<CreatedEvent> {
  type EventJson = { id: string; webLink?: string; onlineMeeting?: { joinUrl?: string } }
  try {
    const j = await graph<EventJson>(token, '/me/events', { method: 'POST', body: JSON.stringify(body) })
    return { id: j.id, webLink: j.webLink, joinUrl: j.onlineMeeting?.joinUrl }
  } catch (err) {
    // Personal accounts and unlicensed mailboxes cannot create Teams meetings; book the slot without one.
    if (body.isOnlineMeeting) {
      const plain = { ...body, isOnlineMeeting: false, onlineMeetingProvider: undefined }
      const j = await graph<EventJson>(token, '/me/events', { method: 'POST', body: JSON.stringify(plain) })
      return { id: j.id, webLink: j.webLink }
    }
    throw err
  }
}

export type BusyBlock = { start: string; end: string }

/** Events between two local date-times (exclusive of "free" entries), as local ISO strings. */
export async function busyTimes(token: string, from: string, to: string): Promise<BusyBlock[]> {
  const q = new URLSearchParams({ startDateTime: from, endDateTime: to, $select: 'start,end,showAs', $top: '200' })
  const j = await graph<{ value?: { start: { dateTime: string }; end: { dateTime: string }; showAs?: string }[] }>(token, `/me/calendarView?${q}`)
  return (j.value || []).filter((e) => e.showAs !== 'free').map((e) => ({ start: e.start.dateTime.slice(0, 19), end: e.end.dateTime.slice(0, 19) }))
}

/** "YYYY-MM-DD HH:MM" keys for every hourly slot that overlaps a busy block. */
export function busySlots(blocks: BusyBlock[], dates: string[], slots: string[], minutes = 60): string[] {
  const out: string[] = []
  for (const date of dates) {
    for (const slot of slots) {
      const s = `${date}T${slot}:00`
      const e = addMinutes(s, minutes)
      if (blocks.some((b) => b.start < e && b.end > s)) out.push(`${date} ${slot}`)
    }
  }
  return out
}

// ---- signed OAuth state: which consultant is being connected, by which staff member
const secret = () => new TextEncoder().encode(process.env.PAYLOAD_SECRET || 'dev-secret')

export async function signState(data: { consultant: string; user: string }): Promise<string> {
  return new SignJWT(data).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('15m').sign(secret())
}

export async function readState(state: string | null): Promise<{ consultant: string; user: string } | null> {
  if (!state) return null
  try {
    const { payload } = await jwtVerify(state, secret())
    return typeof payload.consultant === 'string' && typeof payload.user === 'string' ? { consultant: payload.consultant, user: payload.user } : null
  } catch {
    return null
  }
}
