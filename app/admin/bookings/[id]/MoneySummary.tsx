import type { CurrencyMoney } from '@/lib/admin/bookingMoney'
import { tFor } from '@/lib/i18n'

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

/**
 * The booking's money picture for Leticia — stay total, what's been paid or
 * settled, balance due, and her earnings — one block per currency.
 */
export function MoneySummary({
  money: rows,
  commissionPercent,
  locale = 'en',
}: {
  money: CurrencyMoney[]
  commissionPercent: number | null
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)

  if (rows.length === 0) {
    return (
      <p className="text-sm text-stone-500 font-light">
        {t(
          'No amounts yet. Add the house total (Edit booking), extras, service prices or payments.',
          'Aún no hay montos. Agrega el total de la casa (Editar reserva), extras, precios de servicios o pagos.'
        )}
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {rows.map((m) => (
        <div key={m.currency}>
          {rows.length > 1 && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-3">{m.currency}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {/* Guest side */}
            <dl className="text-sm font-light">
              <Row label={t('House', 'Casa')} value={money(m.house, m.currency)} />
              <Row label={t('Extras', 'Extras')} value={money(m.extras, m.currency)} />
              <Row label={t('Services', 'Servicios')} value={money(m.services, m.currency)} />
              <Row label={t('Stay total', 'Total de la estadía')} value={money(m.stayTotal, m.currency)} strong />
              <Row label={t('Paid', 'Pagado')} value={`− ${money(m.paid, m.currency)}`} />
              {m.settledOutside > 0 && (
                <Row
                  label={t('Settled outside the portal', 'Resuelto fuera del portal')}
                  value={`− ${money(m.settledOutside, m.currency)}`}
                />
              )}
              <Row
                label={t('Balance due', 'Saldo pendiente')}
                value={money(m.balanceDue, m.currency)}
                strong
                tone={m.balanceDue > 0 ? 'due' : m.balanceDue < 0 ? 'over' : 'clear'}
              />
              {m.balanceDue < 0 && (
                <p className="mt-1 text-xs text-stone-500">
                  {t('Overpaid — a refund or credit may be owed.', 'Pagado de más — puede deberse un reembolso o crédito.')}
                </p>
              )}
            </dl>

            {/* Leticia's side */}
            <dl className="text-sm font-light">
              <Row
                label={
                  commissionPercent !== null
                    ? `${t('House commission', 'Comisión casa')} (${commissionPercent}%)`
                    : t('House commission', 'Comisión casa')
                }
                value={commissionPercent !== null ? money(m.earnings.commission, m.currency) : '—'}
              />
              {commissionPercent !== null && m.house > 0 && (
                <Row label={t('Owner payout', 'Pago al propietario')} value={money(m.earnings.ownerPayout, m.currency)} muted />
              )}
              <Row label={t('Extras margin', 'Margen extras')} value={money(m.earnings.extrasMargin, m.currency)} />
              <Row label={t('Services margin', 'Margen servicios')} value={money(m.earnings.servicesMargin, m.currency)} />
              <Row label={t('Leticia’s earnings', 'Ganancias de Leticia')} value={money(m.earnings.total, m.currency)} strong />
              {(m.missingCosts.extras > 0 || m.missingCosts.services > 0) && (
                <p className="mt-2 text-xs text-amber-700">
                  {t(
                    `Margin unknown for ${m.missingCosts.extras + m.missingCosts.services} line(s) without a cost.`,
                    `Margen desconocido en ${m.missingCosts.extras + m.missingCosts.services} línea(s) sin costo.`
                  )}
                </p>
              )}
              {commissionPercent === null && m.house > 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  {t('Set the commission % to see the house earnings.', 'Define el % de comisión para ver las ganancias de la casa.')}
                </p>
              )}
            </dl>
          </div>
        </div>
      ))}
    </div>
  )
}

function Row({
  label,
  value,
  strong = false,
  muted = false,
  tone,
}: {
  label: string
  value: string
  strong?: boolean
  muted?: boolean
  tone?: 'due' | 'over' | 'clear'
}) {
  const toneClass = tone === 'due' ? 'text-amber-800' : tone === 'clear' ? 'text-emerald-800' : ''
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-1.5 ${
        strong ? 'border-t border-stone-200 mt-1 pt-2.5' : ''
      }`}
    >
      <dt className={muted ? 'text-stone-400' : strong ? 'text-stone-900' : 'text-stone-600'}>{label}</dt>
      <dd className={`tabular-nums ${strong ? 'text-stone-900 font-normal' : muted ? 'text-stone-400' : 'text-stone-800'} ${toneClass}`}>
        {value}
      </dd>
    </div>
  )
}
