'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'
import { keyToDayMonthYear } from '@/lib/dates'
import { DateInput } from '@/components/admin/DateInput'

export interface AdminPaymentRow {
  id: string
  kind: 'PAYMENT' | 'SETTLED_OUTSIDE'
  amount: string
  currency: string
  receivedOn: string | null
  received: boolean
  method: string | null
  note: string | null
}

/**
 * Payments log: money received, plus items settled outside the portal (guest
 * paid the owner directly, a credit, something waived). Both reduce the
 * balance due shown above. A payment can be logged before it arrives
 * (not received yet) and marked received later.
 */
export function PaymentsEditor({
  bookingId,
  payments,
  locale = 'en',
}: {
  bookingId: string
  payments: AdminPaymentRow[]
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const empty = { kind: 'PAYMENT', amount: '', currency: 'USD', receivedOn: '', method: '', note: '', received: true }
  const [form, setForm] = useState(empty)
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const setReceived = async (id: string, received: boolean) => {
    setBusy(true)
    try {
      await fetch(`/api/admin/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received }),
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const add = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not add', 'No se pudo agregar'))
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
    if (!confirm(t('Remove this entry?', '¿Eliminar esta entrada?'))) return
    setBusy(true)
    try {
      await fetch(`/api/admin/payments/${id}`, { method: 'DELETE' })
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
      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
        {t('Payments log', 'Registro de pagos')}
      </p>
      {payments.length > 0 ? (
        <ul className="divide-y divide-stone-200 mb-4">
          {payments.map((p) => (
            <li key={p.id} className="py-2.5 flex items-start justify-between gap-3 text-sm font-light">
              <div className="min-w-0">
                <p className="text-stone-800">
                  {p.kind === 'SETTLED_OUTSIDE'
                    ? t('Settled outside the portal', 'Resuelto fuera del portal')
                    : p.received
                      ? t('Payment received', 'Pago recibido')
                      : t('Payment expected', 'Pago esperado')}
                  {p.method && <span className="text-stone-500"> · {p.method}</span>}
                </p>
                <p className="text-xs text-stone-500">
                  {p.receivedOn ? keyToDayMonthYear(p.receivedOn) : t('No date', 'Sin fecha')}
                  {p.note && ` · ${p.note}`}
                </p>
                {p.kind === 'PAYMENT' && (
                  <button
                    type="button"
                    onClick={() => setReceived(p.id, !p.received)}
                    disabled={busy}
                    className={`mt-1 text-[11px] uppercase tracking-wider underline underline-offset-4 ${
                      p.received ? 'text-stone-400 hover:text-stone-700' : 'text-amber-800 hover:text-amber-950'
                    }`}
                  >
                    {p.received ? t('Mark as not received', 'Marcar como no recibido') : t('Mark as received', 'Marcar como recibido')}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`tabular-nums ${p.received ? 'text-stone-900' : 'text-stone-400'}`}>
                  {p.currency} {Number(p.amount).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
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
      ) : (
        <p className="text-sm text-stone-500 font-light mb-3">{t('Nothing recorded yet.', 'Nada registrado todavía.')}</p>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 underline underline-offset-4"
        >
          + {t('Add payment or settlement', 'Agregar pago o liquidación')}
        </button>
      ) : (
        <div className="space-y-3 border-t border-stone-200 pt-4">
          <label className="block">
            <span className={label}>{t('Type', 'Tipo')}</span>
            <select className={input} value={form.kind} onChange={set('kind')}>
              <option value="PAYMENT">{t('Payment received by Leticia', 'Pago recibido por Leticia')}</option>
              <option value="SETTLED_OUTSIDE">
                {t('Settled outside the portal (paid to owner, credit, waived…)', 'Resuelto fuera del portal (pagado al propietario, crédito, condonado…)')}
              </option>
            </select>
          </label>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <label className="block">
              <span className={label}>{t('Amount', 'Monto')}</span>
              <input type="number" min="0" step="0.01" className={input} value={form.amount} onChange={set('amount')} />
            </label>
            <label className="block">
              <span className={label}>{t('Currency', 'Moneda')}</span>
              <select className={input} value={form.currency} onChange={set('currency')}>
                <option value="USD">USD</option>
                <option value="DOP">DOP</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="block">
              <span className={label}>{t('Date', 'Fecha')}</span>
              <DateInput value={form.receivedOn} onChange={(v) => setForm((f) => ({ ...f, receivedOn: v }))} />
            </div>
            <label className="block">
              <span className={label}>{t('Method', 'Método')}</span>
              <input
                className={input}
                value={form.method}
                onChange={set('method')}
                placeholder={t('Transfer, card, cash…', 'Transferencia, tarjeta, efectivo…')}
              />
            </label>
          </div>
          <label className="block">
            <span className={label}>{t('Note', 'Nota')}</span>
            <input className={input} value={form.note} onChange={set('note')} />
          </label>
          {form.kind === 'PAYMENT' && (
            <label className="flex items-center gap-2 text-sm font-light text-stone-700">
              <input
                type="checkbox"
                checked={form.received}
                onChange={(e) => setForm((f) => ({ ...f, received: e.target.checked }))}
                className="accent-stone-800"
              />
              {t('Received', 'Recibido')}
              <span className="text-xs text-stone-500">
                {t('(untick if it’s due but hasn’t come in)', '(desmarca si está pendiente y no ha llegado)')}
              </span>
            </label>
          )}
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={add}
              disabled={busy || !form.amount}
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
