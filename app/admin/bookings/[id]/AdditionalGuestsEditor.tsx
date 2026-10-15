'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'

export interface AdminGuestRow {
  id: string
  firstName: string
  lastName: string
  email: string | null
  portalAccess: boolean
}

/**
 * Extra guests on a stay. With portal access on, they can sign in at /portal
 * with that email and see the stay read-only: plans, itinerary and house
 * details — no requests, prices, costs or documents.
 */
export function AdditionalGuestsEditor({
  bookingId,
  guests,
  locale = 'en',
}: {
  bookingId: string
  guests: AdminGuestRow[]
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const empty = { firstName: '', lastName: '', email: '', portalAccess: true }
  const [form, setForm] = useState(empty)
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = async (url: string, method: string, body?: unknown) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Something went wrong', 'Algo salió mal'))
      }
      router.refresh()
      return true
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
      return false
    } finally {
      setBusy(false)
    }
  }

  const input =
    'w-full border border-stone-300 rounded-xs px-3 py-2 text-sm font-light focus:outline-none focus:border-stone-500'
  const label = 'block text-[11px] uppercase tracking-wider text-stone-500 mb-1'

  return (
    <div>
      {guests.length > 0 ? (
        <ul className="divide-y divide-stone-200 mb-4">
          {guests.map((g) => (
            <li key={g.id} className="py-2.5 flex items-start justify-between gap-3 text-sm font-light">
              <div className="min-w-0">
                <p className="text-stone-800">{[g.firstName, g.lastName].filter(Boolean).join(' ')}</p>
                <p className="text-xs text-stone-500 break-all">{g.email || t('No email', 'Sin correo')}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <label className="flex items-center gap-1.5 text-xs text-stone-600">
                  <input
                    type="checkbox"
                    checked={g.portalAccess}
                    disabled={busy || !g.email}
                    onChange={(e) => call(`/api/admin/guests/${g.id}`, 'PATCH', { portalAccess: e.target.checked })}
                  />
                  {t('Portal', 'Portal')}
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (confirm(t('Remove this guest?', '¿Eliminar este huésped?')))
                      call(`/api/admin/guests/${g.id}`, 'DELETE')
                  }}
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
        <p className="text-sm text-stone-500 font-light mb-3">{t('No extra guests.', 'Sin huéspedes adicionales.')}</p>
      )}

      {!adding ? (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 underline underline-offset-4"
        >
          + {t('Add guest', 'Agregar huésped')}
        </button>
      ) : (
        <div className="space-y-3 border-t border-stone-200 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={label}>{t('First name', 'Nombre')}</span>
              <input className={input} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </label>
            <label className="block">
              <span className={label}>{t('Last name', 'Apellido')}</span>
              <input className={input} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className={label}>{t('Email', 'Correo')}</span>
            <input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="flex items-start gap-2 text-sm font-light text-stone-700">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.portalAccess}
              onChange={(e) => setForm({ ...form, portalAccess: e.target.checked })}
            />
            <span>
              {t(
                'Portal access — they sign in at /portal with this email and see the stay read-only, without prices.',
                'Acceso al portal — entran en /portal con este correo y ven la estadía en solo lectura, sin precios.'
              )}
            </span>
          </label>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy || !form.firstName.trim() || (form.portalAccess && !form.email.trim())}
              onClick={async () => {
                if (await call(`/api/admin/bookings/${bookingId}/guests`, 'POST', form)) {
                  setForm(empty)
                  setAdding(false)
                }
              }}
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
