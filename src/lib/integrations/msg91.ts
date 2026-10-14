/**
 * MSG91 OTP SMS (DLT registered). Live when MSG91_AUTH_KEY and MSG91_TEMPLATE_ID are set,
 * otherwise the code is logged to the server console (dev mode).
 */
export async function sendOtpSms(phoneE164: string, code: string): Promise<{ mock: boolean }> {
  const authkey = process.env.MSG91_AUTH_KEY
  const template = process.env.MSG91_TEMPLATE_ID
  if (!authkey || !template || process.env.OTP_MODE === 'mock') {
    console.info(`[otp:mock] ${phoneE164} code ${code}`)
    return { mock: true }
  }
  const mobile = phoneE164.replace('+', '')
  const url = new URL('https://control.msg91.com/api/v5/otp')
  url.searchParams.set('template_id', template)
  url.searchParams.set('mobile', mobile)
  url.searchParams.set('otp', code)
  url.searchParams.set('otp_expiry', '5')
  const res = await fetch(url, { method: 'POST', headers: { authkey, 'content-type': 'application/json' } })
  if (!res.ok) throw new Error(`MSG91 ${res.status}: ${await res.text()}`)
  return { mock: false }
}
