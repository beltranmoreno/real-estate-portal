'use client'

import { X } from 'lucide-react'
import { DateInput } from '@/components/admin/DateInput'
import { nightsBetween } from '@/lib/dates'
import type { RateRow } from '@/lib/bookingRates'
import { tFor } from '@/lib/i18n'

const inputClass =
  'w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800'

/**
 * Price per night. One rate covers the whole stay; "+ Price changes during
 * the stay" splits it into dated periods (each "to" is the morning after
 * the last night at that rate, like a checkout).
 */
export function NightlyRatesInput({
  rows,
  onChange,
  checkIn,
  checkOut,
  currency = 'USD',
  locale = 'en',
}: {
  rows: RateRow[]
  onChange: (rows: RateRow[]) => void
  checkIn: string
  checkOut: string
  currency?: string
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const setRow = (i: number, patch: Partial<RateRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const split = () => {
    // Start the new period where the last one ends; the last runs to checkout.
    const last = rows[rows.length - 1]
    onChange([...rows, { from: last?.to || '', to: checkOut, rate: '' }])
  }

  if (rows.length <= 1) {
    const row = rows[0] ?? { from: checkIn, to: checkOut, rate: '' }
    return (
      <div className="space-y-1.5">
        <input
          type="number"
          min={0}
          step="0.01"
          value={row.rate}
          onChange={(e) => onChange([{ ...row, rate: e.target.value }])}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => onChange([{ ...row, from: checkIn, to: '' }, { from: '', to: checkOut, rate: '' }])}
          className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-2"
        >
          + {t('Price changes during the stay', 'El precio cambia durante la estadía')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="hidden sm:grid grid-cols-[1fr_1fr_8rem_4.5rem_auto] gap-2 text-[11px] uppercase tracking-wider text-stone-500">
        <span>{t('From', 'Desde')}</span>
        <span>{t('To (morning after)', 'Hasta (mañana siguiente)')}</span>
        <span>{t(`Per night (${currency})`, `Por noche (${currency})`)}</span>
        <span />
        <span />
      </div>
      {rows.map((r, i) => {
        const nights = r.from && r.to && r.to > r.from ? nightsBetween(r.from, r.to) : null
        return (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_8rem_4.5rem_auto] gap-2 items-center">
            <DateInput value={r.from} min={checkIn || undefined} onChange={(v) => setRow(i, { from: v })} />
            <DateInput value={r.to} min={r.from || checkIn || undefined} onChange={(v) => setRow(i, { to: v })} />
            <input
              type="number"
              min={0}
              step="0.01"
              value={r.rate}
              onChange={(e) => setRow(i, { rate: e.target.value })}
              placeholder={t('Rate', 'Tarifa')}
              aria-label={t('Price per night', 'Precio por noche')}
              className={inputClass}
            />
            <span className="text-xs text-stone-500 font-light">
              {nights !== null ? t(`${nights} nights`, `${nights} noches`) : ''}
            </span>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              aria-label={t('Remove rate', 'Quitar tarifa')}
              className="justify-self-end p-1 text-stone-400 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
      <button
        type="button"
        onClick={split}
        className="text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 underline underline-offset-4"
      >
        + {t('Add rate', 'Agregar tarifa')}
      </button>
    </div>
  )
}
