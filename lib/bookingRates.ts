import { nightsBetween } from '@/lib/dates'

/**
 * Nightly rates for a stay. One rate for the whole stay lives in
 * `Booking.nightlyRate`; when the price changes during the stay the periods
 * live in `Booking.nightlyRates` as [{ from, to, rate }], "YYYY-MM-DD" keys
 * with `to` exclusive (the morning after the last night at that rate).
 */
// `type`, not `interface`, so it's assignable to Prisma's Json input.
export type RatePeriod = {
  from: string
  to: string
  rate: number
}

export type RateLine = RatePeriod & { nights: number }

/** Form rows: strings while editing. */
export interface RateRow {
  from: string
  to: string
  rate: string
}

const KEY = /^\d{4}-\d{2}-\d{2}$/

export function parseRatePeriods(json: unknown): RatePeriod[] {
  if (!Array.isArray(json)) return []
  return json
    .map((r) => ({ from: String(r?.from ?? ''), to: String(r?.to ?? ''), rate: Number(r?.rate) }))
    .filter((r) => KEY.test(r.from) && KEY.test(r.to) && r.to > r.from && Number.isFinite(r.rate) && r.rate >= 0)
    .sort((a, b) => a.from.localeCompare(b.from))
}

/** The stay's rate lines, whichever way they were stored. */
export function bookingRateLines(b: {
  nightlyRate: { toString(): string } | number | null
  nightlyRates: unknown
  checkInKey: string
  checkOutKey: string
}): RateLine[] {
  const periods = parseRatePeriods(b.nightlyRates)
  if (periods.length > 0) return periods.map((p) => ({ ...p, nights: nightsBetween(p.from, p.to) }))
  if (b.nightlyRate === null || b.nightlyRate === undefined) return []
  const rate = Number(b.nightlyRate.toString())
  if (!Number.isFinite(rate)) return []
  return [{ from: b.checkInKey, to: b.checkOutKey, rate, nights: nightsBetween(b.checkInKey, b.checkOutKey) }]
}

/** Rows to pre-fill a form from a booking. */
export function rateRowsFromBooking(b: Parameters<typeof bookingRateLines>[0]): RateRow[] {
  const lines = bookingRateLines(b)
  if (lines.length === 0) return [{ from: b.checkInKey, to: b.checkOutKey, rate: '' }]
  return lines.map((l) => ({ from: l.from, to: l.to, rate: String(l.rate) }))
}

/**
 * Form rows → what the API stores. One row is the whole stay's rate (its
 * dates are ignored); several rows become periods. Returns an error message
 * when the periods don't make sense.
 */
export function rateRowsToPayload(
  rows: RateRow[],
  checkIn: string,
  checkOut: string
): { nightlyRate: number | null; nightlyRates: RatePeriod[] | null; error?: string } {
  const filled = rows.filter((r) => r.rate.trim() !== '')
  if (filled.length === 0) return { nightlyRate: null, nightlyRates: null }
  if (rows.length === 1) return { nightlyRate: Number(filled[0].rate), nightlyRates: null }

  const periods = filled.map((r) => ({ from: r.from, to: r.to, rate: Number(r.rate) }))
  for (const p of periods) {
    if (!KEY.test(p.from) || !KEY.test(p.to) || p.to <= p.from) {
      return { nightlyRate: null, nightlyRates: null, error: 'Each rate needs a start date before its end date.' }
    }
    if ((checkIn && p.from < checkIn) || (checkOut && p.to > checkOut)) {
      return { nightlyRate: null, nightlyRates: null, error: 'Rate dates must be within the stay.' }
    }
  }
  const sorted = [...periods].sort((a, b) => a.from.localeCompare(b.from))
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].from < sorted[i - 1].to) {
      return { nightlyRate: null, nightlyRates: null, error: 'Rate dates overlap.' }
    }
  }
  return { nightlyRate: null, nightlyRates: sorted }
}

/** Σ nights × rate, when every row is complete. */
export function rateRowsTotal(rows: RateRow[], checkIn: string, checkOut: string): { total: number; nights: number } | null {
  if (!checkIn || !checkOut || checkOut <= checkIn) return null
  if (rows.length === 1) {
    const rate = Number(rows[0].rate)
    if (!(rate > 0)) return null
    const nights = nightsBetween(checkIn, checkOut)
    return { total: rate * nights, nights }
  }
  let total = 0
  let nights = 0
  for (const r of rows) {
    const rate = Number(r.rate)
    if (!(rate > 0) || !KEY.test(r.from) || !KEY.test(r.to) || r.to <= r.from) return null
    const n = nightsBetween(r.from, r.to)
    total += rate * n
    nights += n
  }
  return { total: Math.round(total * 100) / 100, nights }
}
