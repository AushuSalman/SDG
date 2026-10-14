import { createHash, randomBytes, randomInt } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import type { Payload } from 'payload'

import { sendOtpSms } from './integrations/msg91'

const OTP_TTL_MS = 5 * 60 * 1000
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_PHONE = 3
const MAX_PER_IP = 12
const MAX_ATTEMPTS = 5

export type OtpPurpose = 'enquiry' | 'portal'

export class OtpError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

/** Indian mobile numbers to E.164. Accepts 10 digits, 0-prefixed, 91-prefixed or +91. */
export function normalizePhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`
  throw new OtpError('Enter a valid mobile number')
}

const hash = (salt: string, code: string) => createHash('sha256').update(`${salt}:${code}`).digest('hex')

export async function createOtp(
  payload: Payload,
  opts: { phone: string; purpose: OtpPurpose; ip?: string },
): Promise<{ sent: true; mockCode?: string }> {
  const phone = normalizePhone(opts.phone)
  const since = new Date(Date.now() - WINDOW_MS).toISOString()

  const byPhone = await payload.count({
    collection: 'otps',
    overrideAccess: true,
    where: { and: [{ phone: { equals: phone } }, { createdAt: { greater_than: since } }] },
  })
  if (byPhone.totalDocs >= MAX_PER_PHONE) {
    throw new OtpError('Too many codes requested for this number. Try again in a few minutes.', 429)
  }
  if (opts.ip) {
    const byIp = await payload.count({
      collection: 'otps',
      overrideAccess: true,
      where: { and: [{ ip: { equals: opts.ip } }, { createdAt: { greater_than: since } }] },
    })
    if (byIp.totalDocs >= MAX_PER_IP) throw new OtpError('Too many requests. Try again later.', 429)
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const salt = randomBytes(8).toString('hex')
  await payload.create({
    collection: 'otps',
    overrideAccess: true,
    data: {
      phone,
      purpose: opts.purpose,
      codeHash: hash(salt, code),
      salt,
      expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      attempts: 0,
      verified: false,
      ip: opts.ip,
    },
  })

  const result = await sendOtpSms(phone, code)
  return result.mock ? { sent: true, mockCode: code } : { sent: true }
}

export async function verifyOtp(
  payload: Payload,
  opts: { phone: string; purpose: OtpPurpose; code: string },
): Promise<{ phone: string }> {
  const phone = normalizePhone(opts.phone)
  const { docs } = await payload.find({
    collection: 'otps',
    overrideAccess: true,
    where: {
      and: [
        { phone: { equals: phone } },
        { purpose: { equals: opts.purpose } },
        { verified: { equals: false } },
        { expiresAt: { greater_than: new Date().toISOString() } },
      ],
    },
    sort: '-createdAt',
    limit: 1,
  })
  const otp = docs[0]
  if (!otp) throw new OtpError('No active code for this number. Request a new one.')
  if ((otp.attempts || 0) >= MAX_ATTEMPTS) throw new OtpError('Too many wrong attempts. Request a new code.', 429)

  const ok = hash(otp.salt, String(opts.code || '').trim()) === otp.codeHash
  await payload.update({
    collection: 'otps',
    id: otp.id,
    overrideAccess: true,
    data: { attempts: (otp.attempts || 0) + 1, verified: ok },
  })
  if (!ok) throw new OtpError('That code is not right. Check the SMS and try again.')
  return { phone }
}

// ---- short-lived proof that a phone was verified, carried by the form submit or the portal cookie
const secret = () => new TextEncoder().encode(process.env.PAYLOAD_SECRET || 'dev-secret')

export async function signVerification(phone: string, purpose: OtpPurpose, ttl = '15m'): Promise<string> {
  return new SignJWT({ phone, purpose })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret())
}

export async function readVerification(token: string | undefined | null): Promise<{ phone: string; purpose: OtpPurpose } | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    if (typeof payload.phone !== 'string' || typeof payload.purpose !== 'string') return null
    return { phone: payload.phone, purpose: payload.purpose as OtpPurpose }
  } catch {
    return null
  }
}
