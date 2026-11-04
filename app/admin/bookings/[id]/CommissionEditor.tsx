'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'

/** Inline editor for Leticia's commission on the house: a % of the total or a fixed amount. */
export function CommissionEditor({
  bookingId,
  initialPercent,
  initialAmount,
  currency,
  locale = 'en',
}: {
  bookingId: string
  initialPercent: number | null
  initialAmount: number | null
  currency: string
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const initialMode: 'amount' | 'percent' = initialAmount !== null || initialPercent === null ? 'amount' : 'percent'
  const initialValue = initialMode === 'amount' ? initialAmount : initialPercent
  const [mode, setMode] = useState(initialMode)
  const [value, setValue] = useState(initialValue !== null ? String(initialValue) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dirty = mode !== initialMode || value !== (initialValue !== null ? String(initialValue) : '')

  const save = async () => {
    setSaving(true)
    setError(null)
    const v = value === '' ? null : value
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // One or the other: setting one clears the other.
        body: JSON.stringify(
          mode === 'amount' ? { commissionAmount: v, commissionPercent: null } : { commissionPercent: v, commissionAmount: null }
        ),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not save', 'No se pudo guardar'))
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-[11px] uppercase tracking-wider text-stone-500">{t('Commission on house', 'Comisión sobre la casa')}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max={mode === 'percent' ? 100 : undefined}
          step={mode === 'percent' ? '0.5' : '0.01'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-28 border border-stone-300 rounded-xs px-2 py-1.5 text-sm font-light text-right focus:outline-none focus:border-stone-500"
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'amount' | 'percent')}
          aria-label={t('Commission type', 'Tipo de comisión')}
          className="border border-stone-300 rounded-xs px-2 py-1.5 text-sm font-light bg-white focus:outline-none focus:border-stone-500"
        >
          <option value="amount">{currency}</option>
          <option value="percent">%</option>
        </select>
      </div>
      {dirty && (
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-3 py-1.5 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] rounded-xs disabled:opacity-50"
        >
          {saving ? t('Saving…', 'Guardando…') : t('Save', 'Guardar')}
        </button>
      )}
      {error && <p className="w-full text-xs text-red-700">{error}</p>}
    </div>
  )
}
