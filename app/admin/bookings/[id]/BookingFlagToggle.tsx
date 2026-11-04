'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'

/**
 * One-click yes/no on a booking (commission paid, deposit returned). Turning
 * it on records today's date server-side; turning it off clears the date.
 */
export function BookingFlagToggle({
  bookingId,
  field,
  value,
  onLabel,
  offLabel,
  actionLabel,
  date,
  locale = 'en',
}: {
  bookingId: string
  field: 'commissionPaid' | 'depositReturned'
  value: boolean
  /** Badge text when on / off. */
  onLabel: string
  offLabel: string
  /** Button text to turn it on, e.g. "Mark as paid". */
  actionLabel: string
  /** Day-first date the flag was set, shown next to the "on" badge. */
  date?: string | null
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !value }),
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
    <span className="inline-flex flex-wrap items-center gap-2">
      <span
        className={`text-[11px] uppercase tracking-wider px-2 py-0.5 border ${
          value ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}
      >
        {value ? onLabel : offLabel}
        {value && date ? ` · ${date}` : ''}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-2 disabled:opacity-50"
      >
        {saving ? t('Saving…', 'Guardando…') : value ? t('Undo', 'Deshacer') : actionLabel}
      </button>
      {error && <span className="w-full text-xs text-red-700">{error}</span>}
    </span>
  )
}
