'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'

export interface AdminChargeRow {
  id: string
  description: string
  category: string
  amount: string
  currency: string
  incurredOn: string | null
  receiptName: string | null
  /** What it cost Leticia, if entered. */
  cost: string | null
}

const CATEGORIES = [
  { value: 'GROCERIES', en: 'Groceries', es: 'Supermercado' },
  { value: 'ALCOHOL', en: 'Wine & spirits', es: 'Vinos y licores' },
  { value: 'SERVICE', en: 'Service', es: 'Servicio' },
  { value: 'EXTRA', en: 'Extra', es: 'Extra' },
]

/**
 * Log extras on a stay (supermarket, alcohol, one-offs) and link each to a
 * receipt already uploaded under Documents. The primary guest sees these in
 * the portal's "Extras" section with a running total.
 */
export function ChargesEditor({
  bookingId,
  charges,
  receipts,
  locale = 'en',
}: {
  bookingId: string
  charges: AdminChargeRow[]
  /** Booking documents not yet linked to a charge. */
  receipts: { id: string; label: string }[]
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const empty = { category: 'GROCERIES', description: '', amount: '', cost: '', currency: 'USD', incurredOn: '', documentId: '' }
  const [form, setForm] = useState(empty)
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const add = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/charges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          incurredOn: form.incurredOn || null,
          documentId: form.documentId || null,
          cost: form.cost === '' ? null : form.cost,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not add the charge', 'No se pudo agregar el cargo'))
      }
      setForm(empty)
      setAdding(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm(t('Remove this charge?', '¿Eliminar este cargo?'))) return
    setBusy(true)
    try {
      await fetch(`/api/admin/charges/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const input =
    'w-full border border-stone-300 rounded-xs px-3 py-2 text-sm font-light focus:outline-none focus:border-stone-500 bg-white'
  const label = 'block text-[11px] uppercase tracking-wider text-stone-500 mb-1'

  return (
    <div>
      {charges.length > 0 && (
        <ul className="divide-y divide-stone-200 mb-4">
          {charges.map((c) => (
            <li key={c.id} className="py-2.5 flex items-start justify-between gap-3 text-sm font-light">
              <div className="min-w-0">
                <p className="text-stone-800">{c.description}</p>
                <p className="text-xs text-stone-500">
                  {CATEGORIES.find((x) => x.value === c.category)?.[locale] ?? c.category}
                  {c.incurredOn && ` · ${c.incurredOn}`}
                  {c.receiptName && ` · ${t('receipt', 'recibo')}: ${c.receiptName}`}
                  {c.cost !== null &&
                    ` · ${t('cost', 'costo')} ${Number(c.cost).toFixed(2)} (${t('margin', 'margen')} ${(Number(c.amount) - Number(c.cost)).toFixed(2)})`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="tabular-nums text-stone-900">
                  {c.currency} {Number(c.amount).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  disabled={busy}
                  className="text-xs text-stone-400 hover:text-red-700"
                  aria-label={t('Remove', 'Eliminar')}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 underline underline-offset-4"
        >
          + {t('Add charge', 'Agregar cargo')}
        </button>
      ) : (
        <div className="space-y-3 border-t border-stone-200 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>{t('Category', 'Categoría')}</span>
              <select className={input} value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c[locale]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>{t('Date', 'Fecha')}</span>
              <input type="date" className={input} value={form.incurredOn} onChange={set('incurredOn')} />
            </label>
          </div>
          <label className="block">
            <span className={label}>{t('Description', 'Descripción')}</span>
            <input
              className={input}
              value={form.description}
              onChange={set('description')}
              placeholder={t('e.g. Supermarket run — Jumbo', 'p. ej. Compra en Jumbo')}
            />
          </label>
          <div className="grid grid-cols-[1fr_1fr_6rem] gap-3">
            <label className="block">
              <span className={label}>{t('Charged to guest', 'Cobrado al huésped')}</span>
              <input type="number" min="0" step="0.01" className={input} value={form.amount} onChange={set('amount')} />
            </label>
            <label className="block">
              <span className={label}>{t('Cost (optional)', 'Costo (opcional)')}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={input}
                value={form.cost}
                onChange={set('cost')}
                placeholder={t('Same as charged', 'Igual a lo cobrado')}
              />
            </label>
            <label className="block">
              <span className={label}>{t('Currency', 'Moneda')}</span>
              <select className={input} value={form.currency} onChange={set('currency')}>
                <option value="USD">USD</option>
                <option value="DOP">DOP</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className={label}>{t('Receipt (upload under Documents first)', 'Recibo (súbelo primero en Documentos)')}</span>
            <select className={input} value={form.documentId} onChange={set('documentId')}>
              <option value="">{t('No receipt', 'Sin recibo')}</option>
              {receipts.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={add}
              disabled={busy || !form.description.trim() || !form.amount}
              className="px-4 py-2 bg-stone-900 text-white text-xs uppercase tracking-[0.15em] rounded-xs disabled:opacity-50"
            >
              {busy ? t('Saving…', 'Guardando…') : t('Add', 'Agregar')}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(empty)
                setAdding(false)
              }}
              className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900"
            >
              {t('Cancel', 'Cancelar')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
