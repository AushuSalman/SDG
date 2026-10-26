/**
 * Field validators shared by collections. Links that staff type into the admin end up as href attributes on the
 * public site, so only web addresses are accepted: no javascript:, data: or other schemes.
 */

const MAX_URL = 2048

export const isHttpUrl = (value: unknown): true | string => {
  if (value === undefined || value === null || value === '') return true
  if (typeof value !== 'string' || value.length > MAX_URL) return 'Enter a web address'
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? true : 'Links must start with http:// or https://'
  } catch {
    return 'Enter a full web address, e.g. https://example.com/page'
  }
}

/** The subset of schemes an href rendered from stored content may use; anything else becomes "#". */
export const safeHref = (value: unknown): string => {
  if (typeof value !== 'string') return '#'
  const v = value.trim()
  if (!v) return '#'
  if (v.startsWith('/') && !v.startsWith('//')) return v
  if (v.startsWith('#')) return v
  try {
    const url = new URL(v)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? v : '#'
  } catch {
    return '#'
  }
}
