/**
 * Calendar dates on this site are Dominican Republic days.
 *
 * Stays, seasons and blocked ranges are date-only values ("YYYY-MM-DD" in
 * Sanity, `@db.Date` = UTC midnight in Postgres) and check-in/out times are
 * villa-local. The DR is UTC−4 all year (no DST), but visitors browse from
 * anywhere and the server runs in UTC, so never derive a day from
 * `new Date('YYYY-MM-DD')` (UTC midnight → the day before in the Americas)
 * or `date.toISOString()` (shifts a locally picked day east of UTC).
 */

export const DR_TIME_ZONE = 'America/Santo_Domingo'

/** Today's date in the Dominican Republic, as "YYYY-MM-DD". */
export function todayInDR(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: DR_TIME_ZONE }).format(now)
}

/** "YYYY-MM-DD" ± n days. */
export function addDaysToKey(key: string, n: number): string {
  const d = new Date(`${key}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Nights between two "YYYY-MM-DD" keys. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000)
}

/** A day picked in a date picker (browser-local midnight) → "YYYY-MM-DD". */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** "YYYY-MM-DD" (or an ISO string starting with one) → browser-local midnight, for date pickers. */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** A `@db.Date` value (UTC midnight) → "YYYY-MM-DD". */
export function dbDateKey(d: Date | string): string {
  return new Date(d).toISOString().slice(0, 10)
}

/** "YYYY-MM-DD" → the `@db.Date` value Prisma compares against. */
export function keyToDbDate(key: string): Date {
  return new Date(`${key}T00:00:00Z`)
}

/** Format a "YYYY-MM-DD" key for display without any timezone shift. */
export function formatDateKey(
  key: string,
  locale: 'en' | 'es' = 'en',
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string {
  return new Date(`${key.slice(0, 10)}T00:00:00Z`).toLocaleDateString(locale === 'es' ? 'es-DO' : 'en-US', {
    ...options,
    timeZone: 'UTC',
  })
}
