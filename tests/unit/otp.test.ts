/** @vitest-environment node */
import { describe, expect, it } from 'vitest'

import { normalizePhone, readVerification, signVerification } from '@/lib/otp'

describe('phone normalisation', () => {
  it.each([
    ['9000000000', '+919000000000'],
    ['09000000000', '+919000000000'],
    ['919000000000', '+919000000000'],
    ['+91 90000 00000', '+919000000000'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it('rejects junk', () => {
    expect(() => normalizePhone('12')).toThrow()
  })
})

describe('verification tokens', () => {
  it('round-trips phone and purpose', async () => {
    const token = await signVerification('+919000000000', 'enquiry')
    const v = await readVerification(token)
    expect(v).toEqual({ phone: '+919000000000', purpose: 'enquiry' })
  })

  it('rejects tampered tokens', async () => {
    const token = await signVerification('+919000000000', 'portal')
    expect(await readVerification(token.slice(0, -2) + 'xx')).toBeNull()
  })
})
