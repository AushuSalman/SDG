/** Bookable time slots, derived from the hours set in the admin. Shared by server pages and client forms. */

export const DEFAULT_SLOTS = ['09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30']

const minutes = (s?: string | null): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec((s || '').trim())
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

/** Hourly slots from `from` up to the last full hour before `to`, e.g. 10:00–18:00 gives 10:00 … 17:00. */
export function slotsFromHours(from?: string | null, to?: string | null, stepMinutes = 60): string[] {
  const a = minutes(from)
  const b = minutes(to)
  if (a === null || b === null || b <= a) return DEFAULT_SLOTS
  const out: string[] = []
  for (let t = a; t + stepMinutes <= b; t += stepMinutes) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`)
  }
  return out.length ? out : DEFAULT_SLOTS
}
