'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { tFor } from '@/lib/i18n'
import { keyToDayMonthYear } from '@/lib/dates'
import { rateRowsToPayload, rateRowsTotal, type RateLine, type RateRow } from '@/lib/bookingRates'
import { NightlyRatesInput } from '@/components/admin/NightlyRatesInput'

/**
 * The house price on the booking page — nightly rate(s), house total and the
 * security deposit — shown as figures with an inline "Edit" that saves in
 * place (same PATCH as the Edit booking form). The deposit's returned toggle
 * sits beside it via `depositToggle`.
 */
export function HousePriceEditor({
  bookingId,
  currency,
  checkIn,
  checkOut,
  rateLines,
  initialRates,
  totalAmount,
  securityDeposit,
  depositToggle,
  locale = 'en',
}: {
  bookingId: string
  currency: string
  /** "YYYY-MM-DD" */
  checkIn: string
  checkOut: string
  rateLines: RateLine[]
  initialRates: RateRow[]
  totalAmount: string
  securityDeposit: string
  /** The "Held / Returned" control, rendered next to the deposit. */
  depositToggle?: React.ReactNode
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [rates, setRates] = useState(initialRates)
  const [total, setTotal] = useState(totalAmount)
  const [deposit, setDeposit] = useState(securityDeposit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const money = (n: number) => `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const suggestion = rateRowsTotal(rates, checkIn, checkOut)

  const cancel = () => {
    setRates(initialRates)
    setTotal(totalAmount)
    setDeposit(securityDeposit)
    setError(null)
    setEditing(false)
  }

  const save = async () => {
    const r = rateRowsToPayload(rates, checkIn, checkOut)
    if (r.error) {
      setError(r.error)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nightlyRate: r.nightlyRate,
          nightlyRates: r.nightlyRates,
          totalAmount: total === '' ? null : total,
          securityDeposit: deposit === '' ? null : deposit,
        }),
      })
      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p?.error || t('Could not save', 'No se pudo guardar'))
      }
      setEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setSaving(false)
    }
  }

  const input =
    'w-full border border-stone-300 rounded-xs px-3 py-2 text-sm font-light bg-white focus:outline-none focus:border-stone-500'
  const labelCls = 'block text-[11px] uppercase tracking-wider text-stone-500 mb-1.5'

  if (!editing) {
    return (
      <div>
        <dl className="text-sm font-light">
          {rateLines.length === 0 && (
            <Line label={t('Price per night', 'Precio por noche')} value="—" />
          )}
          {rateLines.length === 1 && (
            <Line
              label={`${t('Price per night', 'Precio por noche')} · ${rateLines[0].nights} ${t('nights', 'noches')}`}
              value={money(rateLines[0].rate)}
            />
          )}
          {rateLines.length > 1 &&
            rateLines.map((l) => (
              <Line
                key={l.from}
                label={`${keyToDayMonthYear(l.from)} – ${keyToDayMonthYear(l.to)} · ${l.nights} ${t('nights', 'noches')}`}
                value={`${money(l.rate)} / ${t('night', 'noche')}`}
              />
            ))}
          <Line label={t('House total', 'Total de la casa')} value={totalAmount ? money(Number(totalAmount)) : '—'} strong />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-1.5">
            <dt className="text-stone-600">{t('Security deposit', 'Depósito de seguridad')}</dt>
            <dd className="flex items-center gap-3">
              {securityDeposit ? depositToggle : null}
              <span className="tabular-nums text-stone-800">{securityDeposit ? money(Number(securityDeposit)) : '—'}</span>
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900"
        >
          <Pencil className="w-3.5 h-3.5" />
          {t('Edit price & deposit', 'Editar precio y depósito')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <span className={labelCls}>{t(`Price per night (${currency})`, `Precio por noche (${currency})`)}</span>
        <NightlyRatesInput rows={rates} onChange={setRates} checkIn={checkIn} checkOut={checkOut} locale={locale} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className={labelCls}>{t(`House total (${currency})`, `Total de la casa (${currency})`)}</span>
          <input type="number" step="0.01" min={0} value={total} onChange={(e) => setTotal(e.target.value)} className={input} />
          {suggestion && String(suggestion.total) !== total && (
            <span className="mt-1.5 block text-xs text-stone-500 font-light">
              {t(`${suggestion.nights} nights at these rates = `, `${suggestion.nights} noches con estas tarifas = `)}
              <button
                type="button"
                onClick={() => setTotal(String(suggestion.total))}
                className="text-stone-800 underline underline-offset-2"
              >
                {currency} {suggestion.total.toLocaleString('en-US')}
              </button>
            </span>
          )}
        </label>
        <label className="block">
          <span className={labelCls}>{t(`Security deposit (${currency}, optional)`, `Depósito (${currency}, opcional)`)}</span>
          <input type="number" step="0.01" min={0} value={deposit} onChange={(e) => setDeposit(e.target.value)} className={input} />
        </label>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] rounded-xs disabled:opacity-50"
        >
          {saving ? t('Saving…', 'Guardando…') : t('Save', 'Guardar')}
        </button>
        <button type="button" onClick={cancel} className="text-sm font-light text-stone-500 hover:text-stone-900">
          {t('Cancel', 'Cancelar')}
        </button>
      </div>
    </div>
  )
}

function Line({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-1.5 ${strong ? 'border-t border-stone-200 mt-1 pt-2.5' : ''}`}>
      <dt className={strong ? 'text-stone-900' : 'text-stone-600'}>{label}</dt>
      <dd className={`tabular-nums ${strong ? 'text-stone-900 font-normal' : 'text-stone-800'}`}>{value}</dd>
    </div>
  )
}
