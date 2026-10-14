/** Browser-side helpers shared by the enquiry form, booking sheet, brochure sheet and scheduler. */

export type Source = Record<string, string>

export function captureSource(): Source {
  if (typeof window === 'undefined') return {}
  try {
    const saved = sessionStorage.getItem('sdg-source')
    if (saved) return JSON.parse(saved)
    const p = new URLSearchParams(window.location.search)
    const src: Source = { landingPage: window.location.pathname, referrer: document.referrer || '' }
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const v = p.get(k)
      if (v) src[k.replace(/_(\w)/, (_, c) => c.toUpperCase())] = v
    }
    const s = (src.utmSource || '').toLowerCase()
    src.channel = s.includes('google') ? 'google-ads' : s.includes('facebook') || s.includes('meta') ? 'meta-ads' : s.includes('instagram') ? 'instagram' : 'website'
    sessionStorage.setItem('sdg-source', JSON.stringify(src))
    return src
  } catch {
    return {}
  }
}

export async function post<T = Record<string, unknown>>(url: string, body: unknown): Promise<T & { ok?: boolean; error?: string }> {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.ok === false) throw new Error(json.error || 'Something went wrong')
  return json
}

export const VISIT_HOURS = 'Mon–Sat, 09:30–18:30 IST'
export const VISIT_SLOTS = ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30']

export const visitDay = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function visitCheck(v: { project: string; date: string; time: string }): { k: 'project' | 'date' | 'time'; msg: string } | null {
  if (!v.project) return { k: 'project', msg: 'Choose the project you would like to visit.' }
  if (!v.date) return { k: 'date', msg: 'Choose a preferred date.' }
  if (v.date < visitDay(1) || v.date > visitDay(60)) return { k: 'date', msg: 'Choose a date between tomorrow and 60 days from now.' }
  if (new Date(v.date + 'T12:00').getDay() === 0) return { k: 'date', msg: 'Site visits run Monday to Saturday. Please choose another day.' }
  if (!v.time) return { k: 'time', msg: 'Choose a preferred time.' }
  return null
}

export const fmtDay = (iso: string) => new Date(iso + 'T12:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

/** Consultant hours in IST, for the "online now" line. */
export function inHours(): boolean {
  const n = new Date()
  const ist = new Date(n.getTime() + (330 + n.getTimezoneOffset()) * 60000)
  const h = ist.getHours() + ist.getMinutes() / 60
  return ist.getDay() !== 0 && h >= 9.5 && h < 18.5
}
