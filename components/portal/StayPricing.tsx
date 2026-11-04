import type { RateLine } from '@/lib/bookingRates'

export interface StayPayment {
  id: string
  /** "YYYY-MM-DD" the payment was made or is due, if known. */
  date: string | null
  amount: number
  currency: string
  method: string | null
  status: 'received' | 'expected' | 'settled'
}

function money(amount: number, currency: string, locale: 'en' | 'es') {
  try {
    return new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function fmtKey(key: string, locale: 'en' | 'es', withYear = false) {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  })
}

/**
 * The guest's view of what the stay costs: price per night (one rate, or
 * the periods when it changes), the house total, the security deposit and
 * the payments log. No commission or internal notes ever reach this.
 */
export function StayPricing({
  rates,
  total,
  currency,
  deposit,
  payments,
  locale,
}: {
  rates: RateLine[]
  total: number | null
  currency: string
  deposit: { amount: number; returned: boolean; returnedOn: string | null } | null
  payments: StayPayment[]
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const nights = (n: number) => (n === 1 ? t('1 night', '1 noche') : t(`${n} nights`, `${n} noches`))
  const statusLabel: Record<StayPayment['status'], string> = {
    received: t('Received', 'Recibido'),
    expected: t('Upcoming', 'Pendiente'),
    settled: t('Settled', 'Liquidado'),
  }

  return (
    <div className="space-y-10">
      {(rates.length > 0 || total !== null) && (
        <div>
          <ul className="border-t border-line">
            {rates.length === 1 && (
              <Line label={t('Price per night', 'Precio por noche')} value={money(rates[0].rate, currency, locale)} />
            )}
            {rates.length > 1 &&
              rates.map((r) => (
                <Line
                  key={r.from}
                  label={`${fmtKey(r.from, locale)} – ${fmtKey(r.to, locale)}`}
                  note={nights(r.nights)}
                  value={`${money(r.rate, currency, locale)} ${t('/ night', '/ noche')}`}
                />
              ))}
            {deposit && (
              <Line
                label={t('Security deposit', 'Depósito de seguridad')}
                note={
                  deposit.returned
                    ? deposit.returnedOn
                      ? t(`Returned ${fmtKey(deposit.returnedOn, locale, true)}`, `Devuelto el ${fmtKey(deposit.returnedOn, locale, true)}`)
                      : t('Returned', 'Devuelto')
                    : t('Refundable after your stay', 'Reembolsable después de tu estadía')
                }
                value={money(deposit.amount, currency, locale)}
              />
            )}
          </ul>
          {total !== null && (
            <div className="flex flex-wrap items-baseline justify-between gap-4 pt-4">
              <span className="eyebrow">{t('Total for the house', 'Total de la casa')}</span>
              <span className="font-display text-2xl text-ink tabular-nums">{money(total, currency, locale)}</span>
            </div>
          )}
        </div>
      )}

      {payments.length > 0 && (
        <div>
          <p className="eyebrow mb-3">{t('Payments', 'Pagos')}</p>
          <ul className="border-t border-line">
            {payments.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 py-3 border-b border-line text-sm font-light"
              >
                <span className="text-xs uppercase tracking-wider text-muted-2 tabular-nums">
                  {p.date ? fmtKey(p.date, locale) : '—'}
                </span>
                <span className="min-w-0">
                  <span className={p.status === 'expected' ? 'text-muted' : 'text-ink'}>{statusLabel[p.status]}</span>
                  {p.method && <span className="text-muted-2"> · {p.method}</span>}
                </span>
                <span className={`tabular-nums whitespace-nowrap ${p.status === 'expected' ? 'text-muted' : 'text-ink'}`}>
                  {money(p.amount, p.currency, locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Line({ label, note, value }: { label: string; note?: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 py-3 border-b border-line text-sm font-light">
      <span className="min-w-0">
        <span className="text-ink">{label}</span>
        {note && <span className="text-muted-2"> · {note}</span>}
      </span>
      <span className="text-ink tabular-nums whitespace-nowrap">{value}</span>
    </li>
  )
}
