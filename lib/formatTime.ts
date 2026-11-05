/**
 * Format a time-of-day for display. Inputs are the "HH:mm" (24h) strings that
 * `<input type="time">` produces; output is friendly 12-hour text (e.g.
 * "7:30 PM"). Legacy free-text values (older data like "7:30pm") are returned
 * as-is so nothing breaks. All times are villa-local (Dominican time).
 */
export function formatTime(value?: string | null): string {
  if (!value) return ''
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return value // not HH:mm — legacy free text, show verbatim
  let h = parseInt(m[1], 10)
  const min = m[2]
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${min} ${ampm}`
}

/**
 * End time a concierge request carries in its service details (see
 * lib/portal/serviceForms.ts): "Until" for chauffeur/nanny, "Return time" for
 * boats. Departure flight time is deliberately not an end time.
 */
export function detailsEndTime(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null
  const d = details as Record<string, unknown>
  const v = d.timeUntil ?? d.returnTime
  return typeof v === 'string' && v.trim() ? v : null
}

/** "10:00 AM – 2:00 PM", or just the start when there's no end. */
export function formatTimeRange(start?: string | null, end?: string | null): string {
  const a = formatTime(start)
  const b = formatTime(end)
  if (a && b) return `${a} – ${b}`
  return a
}
