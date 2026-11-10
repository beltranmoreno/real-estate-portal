/**
 * Every money movement across bookings, for /admin/finances (ADMIN only).
 * Pure functions: the page loads the bookings, these turn them into dated
 * movements and totals. Currencies are never mixed or converted.
 *
 * Movement dates:
 *   stay booked       → when the booking was created (commission earned)
 *   payment / settled → the day it was received (else when it was logged)
 *   expected payment  → the day it's due (else when it was logged)
 *   extra             → the day it was incurred (else when it was logged)
 *   service           → when it was confirmed (else when it was requested)
 *   commission paid   → the day it was marked paid
 *   deposit returned  → the day it was returned
 */

import { dbDateKey } from '@/lib/dates'

type Num = number | string | { toString(): string } | null | undefined

export const MOVEMENT_TYPES = [
  'stay',
  'payment',
  'expected',
  'settled',
  'extra',
  'service',
  'commission',
  'deposit',
] as const
export type MovementType = (typeof MOVEMENT_TYPES)[number]

export interface LedgerBooking {
  id: string
  propertyTitle: string
  status: string
  checkIn: Date
  checkOut: Date
  createdAt: Date
  totalAmount: Num
  currency: string
  commissionPercent: Num
  commissionAmount: Num
  commissionPaid: boolean
  commissionPaidOn: Date | null
  securityDeposit: Num
  depositReturned: boolean
  depositReturnedOn: Date | null
  primaryGuest: { id: string; firstName: string | null; lastName: string | null; email: string | null }
  charges: {
    id: string
    category: string
    description: string
    amount: Num
    cost: Num
    currency: string
    incurredOn: Date | null
    createdAt: Date
  }[]
  payments: {
    id: string
    kind: 'PAYMENT' | 'SETTLED_OUTSIDE'
    amount: Num
    currency: string
    receivedOn: Date | null
    received: boolean
    method: string | null
    note: string | null
    createdAt: Date
  }[]
  serviceRequests: {
    id: string
    serviceName: string
    status: string
    quotedAmount: Num
    vendorCost: Num
    currency: string | null
    confirmedAt: Date | null
    createdAt: Date
  }[]
}

export interface Movement {
  id: string
  type: MovementType
  /** "YYYY-MM-DD" */
  date: string
  bookingId: string
  propertyTitle: string
  guestName: string
  description: string
  currency: string
  /** Billed to the guest (stay, extra, service). */
  billed: number
  /** Money in (payment received). */
  received: number
  /** Logged but not in yet. */
  expected: number
  /** Settled outside the portal (reduces the balance, no money in). */
  settled: number
  /** Money out (deposit returned). */
  out: number
  /** Leticia's share: commission or margin. Null when unknown (no cost). */
  earning: number | null
  /** Commission marked paid (informational; already counted on the stay). */
  commissionPaid: number
  cancelled: boolean
}

const n = (v: Num): number | null => {
  if (v === null || v === undefined || v === '') return null
  const x = Number(typeof v === 'object' ? v.toString() : v)
  return Number.isFinite(x) ? x : null
}
const round = (x: number) => Math.round(x * 100) / 100

/** UTC timestamp → its Dominican calendar day. */
const drDay = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santo_Domingo' }).format(d)

export function guestName(g: LedgerBooking['primaryGuest']): string {
  return [g.firstName, g.lastName].filter(Boolean).join(' ') || g.email || '—'
}

export function bookingCommission(b: Pick<LedgerBooking, 'totalAmount' | 'commissionPercent' | 'commissionAmount'>): number | null {
  const house = n(b.totalAmount)
  if (house === null) return null
  const fixed = n(b.commissionAmount)
  const pct = n(b.commissionPercent)
  return fixed !== null ? fixed : pct !== null ? round((house * pct) / 100) : null
}

export function buildMovements(bookings: LedgerBooking[]): Movement[] {
  const out: Movement[] = []
  for (const b of bookings) {
    const base = {
      bookingId: b.id,
      propertyTitle: b.propertyTitle,
      guestName: guestName(b.primaryGuest),
      cancelled: b.status === 'CANCELLED',
    }
    const zero = { billed: 0, received: 0, expected: 0, settled: 0, out: 0, earning: null as number | null, commissionPaid: 0 }

    const house = n(b.totalAmount)
    const commission = bookingCommission(b)
    if (house !== null) {
      out.push({
        ...base,
        ...zero,
        id: `stay:${b.id}`,
        type: 'stay',
        date: drDay(b.createdAt),
        description: `${dbDateKey(b.checkIn)} → ${dbDateKey(b.checkOut)}`,
        currency: b.currency || 'USD',
        // A cancelled stay isn't billed and earns nothing.
        billed: base.cancelled ? 0 : house,
        earning: base.cancelled ? 0 : commission,
      })
    }
    if (b.commissionPaid && commission !== null && !base.cancelled) {
      out.push({
        ...base,
        ...zero,
        id: `commission:${b.id}`,
        type: 'commission',
        date: b.commissionPaidOn ? dbDateKey(b.commissionPaidOn) : drDay(b.createdAt),
        description: '',
        currency: b.currency || 'USD',
        commissionPaid: commission,
      })
    }
    const deposit = n(b.securityDeposit)
    if (b.depositReturned && deposit !== null) {
      out.push({
        ...base,
        ...zero,
        id: `deposit:${b.id}`,
        type: 'deposit',
        date: b.depositReturnedOn ? dbDateKey(b.depositReturnedOn) : drDay(b.createdAt),
        description: '',
        currency: b.currency || 'USD',
        out: deposit,
      })
    }

    for (const p of b.payments) {
      const amount = n(p.amount)
      if (amount === null) continue
      const type: MovementType = p.kind === 'SETTLED_OUTSIDE' ? 'settled' : p.received ? 'payment' : 'expected'
      out.push({
        ...base,
        ...zero,
        id: `payment:${p.id}`,
        type,
        date: p.receivedOn ? dbDateKey(p.receivedOn) : drDay(p.createdAt),
        description: [p.method, p.note].filter(Boolean).join(' · '),
        currency: p.currency || 'USD',
        received: type === 'payment' ? amount : 0,
        expected: type === 'expected' ? amount : 0,
        settled: type === 'settled' ? amount : 0,
      })
    }

    for (const c of b.charges) {
      const amount = n(c.amount)
      if (amount === null) continue
      const cost = n(c.cost)
      out.push({
        ...base,
        ...zero,
        id: `extra:${c.id}`,
        type: 'extra',
        date: c.incurredOn ? dbDateKey(c.incurredOn) : drDay(c.createdAt),
        description: c.description,
        currency: c.currency || 'USD',
        billed: amount,
        earning: cost === null ? null : round(amount - cost),
      })
    }

    for (const s of b.serviceRequests) {
      if (s.status !== 'CONFIRMED' && s.status !== 'COMPLETED') continue
      const quote = n(s.quotedAmount)
      if (quote === null) continue
      const cost = n(s.vendorCost)
      out.push({
        ...base,
        ...zero,
        id: `service:${s.id}`,
        type: 'service',
        date: drDay(s.confirmedAt ?? s.createdAt),
        description: s.serviceName,
        currency: s.currency || 'USD',
        billed: quote,
        earning: cost === null ? null : round(quote - cost),
      })
    }
  }
  // Newest first; same day → stays before their payments.
  const order = Object.fromEntries(MOVEMENT_TYPES.map((t, i) => [t, i]))
  return out.sort((a, b) => b.date.localeCompare(a.date) || order[a.type] - order[b.type])
}

export interface CurrencyTotals {
  currency: string
  billed: number
  received: number
  expected: number
  settled: number
  out: number
  earnings: number
  commissionPaid: number
  /** Extras and services counted without a cost, so their margin is unknown. */
  missingCosts: number
}

export function totalsByCurrency(movements: Movement[]): CurrencyTotals[] {
  const by = new Map<string, CurrencyTotals>()
  for (const m of movements) {
    const t =
      by.get(m.currency) ??
      { currency: m.currency, billed: 0, received: 0, expected: 0, settled: 0, out: 0, earnings: 0, commissionPaid: 0, missingCosts: 0 }
    t.billed += m.billed
    t.received += m.received
    t.expected += m.expected
    t.settled += m.settled
    t.out += m.out
    t.commissionPaid += m.commissionPaid
    if (m.earning === null) {
      if (m.type === 'extra' || m.type === 'service') t.missingCosts++
    } else t.earnings += m.earning
    by.set(m.currency, t)
  }
  return [...by.values()]
    .map((t) => ({
      ...t,
      billed: round(t.billed),
      received: round(t.received),
      expected: round(t.expected),
      settled: round(t.settled),
      out: round(t.out),
      earnings: round(t.earnings),
      commissionPaid: round(t.commissionPaid),
    }))
    .sort((a, b) => (a.currency === 'USD' ? -1 : b.currency === 'USD' ? 1 : a.currency.localeCompare(b.currency)))
}

/** Quick date ranges, in the order the buttons show. */
export const RANGES = ['24h', '7d', '1m', '3m', '6m', '1y', 'all'] as const
export type RangeKey = (typeof RANGES)[number]

/**
 * The "YYYY-MM-DD" bounds (inclusive) for a quick range ending today in the
 * DR. Movements are dated by day, so "24h" is yesterday and today.
 */
export function rangeBounds(range: RangeKey, today: string): { from: string | null; to: string | null } {
  if (range === 'all') return { from: null, to: null }
  const d = new Date(`${today}T00:00:00Z`)
  if (range === '24h') d.setUTCDate(d.getUTCDate() - 1)
  else if (range === '7d') d.setUTCDate(d.getUTCDate() - 6)
  else d.setUTCMonth(d.getUTCMonth() - { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }[range])
  return { from: d.toISOString().slice(0, 10), to: today }
}
