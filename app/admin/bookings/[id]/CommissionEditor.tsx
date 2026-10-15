'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'

/** Inline editor for Leticia's commission % on the house total. */
export function CommissionEditor({
  bookingId,
  initial,
  locale = 'en',
}: {
  bookingId: string
  initial: number | null
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const [value, setValue] = useState(initial !== null ? String(initial) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dirty = value !== (initial !== null ? String(initial) : '')

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionPercent: value === '' ? null : value }),
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
      <label className="text-[11px] uppercase tracking-wider text-stone-500">
        {t('Commission on house', 'Comisión sobre la casa')}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="100"
          step="0.5"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 border border-stone-300 rounded-xs px-2 py-1.5 text-sm font-light text-right focus:outline-none focus:border-stone-500"
        />
        <span className="text-sm text-stone-500">%</span>
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
