/**
 * Money picture for one booking, per currency (USD and DOP are never mixed or
 * converted). Pure function so the admin page and any future report share
 * the same arithmetic.
 *
 *   Stay total  = house + extras + services
 *   Balance due = stay total − payments − settled outside
 *   Earnings    = house commission + extras margin + services margin
 *
 * Services count once CONFIRMED or COMPLETED and only when quoted. Margins
 * are only known where a cost was entered; lines without a cost are counted
 * so the page can say how many are missing.
 */

type Num = number | string | { toString(): string } | null | undefined

export interface MoneyInput {
  house: { amount: Num; currency: string }
  commissionPercent: Num
  charges: { amount: Num; cost: Num; currency: string }[]
  services: { status: string; quotedAmount: Num; vendorCost: Num; currency: string | null }[]
  payments: { kind: 'PAYMENT' | 'SETTLED_OUTSIDE'; amount: Num; currency: string }[]
}

export interface CurrencyMoney {
  currency: string
  house: number
  extras: number
  services: number
  stayTotal: number
  paid: number
  settledOutside: number
  balanceDue: number
  earnings: {
    commission: number
    ownerPayout: number
    extrasMargin: number
    servicesMargin: number
    total: number
  }
  /** Lines whose margin is unknown because no cost was entered. */
  missingCosts: { extras: number; services: number }
}

const n = (v: Num): number | null => {
  if (v === null || v === undefined || v === '') return null
  const x = Number(typeof v === 'object' ? v.toString() : v)
  return Number.isFinite(x) ? x : null
}

const round = (x: number) => Math.round(x * 100) / 100

export function computeBookingMoney(input: MoneyInput): CurrencyMoney[] {
  const by = new Map<string, CurrencyMoney>()
  const bucket = (currency: string | null | undefined) => {
    const c = currency || 'USD'
    if (!by.has(c)) {
      by.set(c, {
        currency: c,
        house: 0,
        extras: 0,
        services: 0,
        stayTotal: 0,
        paid: 0,
        settledOutside: 0,
        balanceDue: 0,
        earnings: { commission: 0, ownerPayout: 0, extrasMargin: 0, servicesMargin: 0, total: 0 },
        missingCosts: { extras: 0, services: 0 },
      })
    }
    return by.get(c)!
  }

  // House + commission
  const house = n(input.house.amount)
  if (house !== null) {
    const b = bucket(input.house.currency)
    b.house += house
    const pct = n(input.commissionPercent)
    if (pct !== null) {
      const commission = (house * pct) / 100
      b.earnings.commission += commission
      b.earnings.ownerPayout += house - commission
    }
  }

  // Extras
  for (const c of input.charges) {
    const amount = n(c.amount)
    if (amount === null) continue
    const b = bucket(c.currency)
    b.extras += amount
    const cost = n(c.cost)
    if (cost === null) b.missingCosts.extras++
    else b.earnings.extrasMargin += amount - cost
  }

  // Services
  for (const s of input.services) {
    if (s.status !== 'CONFIRMED' && s.status !== 'COMPLETED') continue
    const quote = n(s.quotedAmount)
    if (quote === null) continue
    const b = bucket(s.currency)
    b.services += quote
    const cost = n(s.vendorCost)
    if (cost === null) b.missingCosts.services++
    else b.earnings.servicesMargin += quote - cost
  }

  // Payments
  for (const p of input.payments) {
    const amount = n(p.amount)
    if (amount === null) continue
    const b = bucket(p.currency)
    if (p.kind === 'SETTLED_OUTSIDE') b.settledOutside += amount
    else b.paid += amount
  }

  return Array.from(by.values())
    .map((b) => {
      const stayTotal = b.house + b.extras + b.services
      const earningsTotal = b.earnings.commission + b.earnings.extrasMargin + b.earnings.servicesMargin
      return {
        ...b,
        house: round(b.house),
        extras: round(b.extras),
        services: round(b.services),
        stayTotal: round(stayTotal),
        paid: round(b.paid),
        settledOutside: round(b.settledOutside),
        balanceDue: round(stayTotal - b.paid - b.settledOutside),
        earnings: {
          commission: round(b.earnings.commission),
          ownerPayout: round(b.earnings.ownerPayout),
          extrasMargin: round(b.earnings.extrasMargin),
          servicesMargin: round(b.earnings.servicesMargin),
          total: round(earningsTotal),
        },
      }
    })
    .sort((a, b) => (a.currency === 'USD' ? -1 : b.currency === 'USD' ? 1 : a.currency.localeCompare(b.currency)))
}
