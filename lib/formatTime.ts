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
