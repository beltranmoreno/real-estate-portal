'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { fieldClass, fieldLabelClass } from '@/components/ui/field'

export interface PartyGuest {
  id: string
  firstName: string
  lastName: string
  email: string | null
  portalAccess: boolean
}

/**
 * "Your party" on the stay page: the guest who booked lists who's coming.
 * Anyone with an email gets an invite and a read-only view of the stay
 * (plans, itinerary, house details — never prices or documents). Read-only
 * for extra guests and for admins previewing.
 */
export function PartyEditor({
  bookingId,
  guests,
  readOnly,
  locale,
}: {
  bookingId: string
  guests: PartyGuest[]
  readOnly: boolean
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const router = useRouter()
  const empty = { firstName: '', lastName: '', email: '' }
  const [form, setForm] = useState(empty)
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const res = await fetch(`/api/portal/bookings/${bookingId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p?.error || t('Could not add this guest', 'No se pudo agregar este huésped'))
      }
      setNotice(
        form.email
          ? t(`We’ve emailed ${form.email} an invite to the stay.`, `Enviamos una invitación a ${form.email}.`)
          : t(`${form.firstName} has been added.`, `${form.firstName} fue agregado.`)
      )
      setForm(empty)
      setAdding(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (g: PartyGuest) => {
    if (!confirm(t(`Remove ${g.firstName} from the stay?`, `¿Quitar a ${g.firstName} de la estadía?`))) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/portal/bookings/${bookingId}/guests/${g.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setError(t('Could not remove this guest', 'No se pudo quitar a este huésped'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {guests.length > 0 ? (
        <ul className="border-t border-line">
          {guests.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-4 py-3.5 border-b border-line">
              <div className="min-w-0">
                <p className="text-[15px] font-light text-ink">{[g.firstName, g.lastName].filter(Boolean).join(' ')}</p>
                <p className="text-xs text-muted-2 font-light mt-0.5 break-all">
                  {g.email
                    ? g.portalAccess
                      ? `${g.email} · ${t('can view the stay', 'puede ver la estadía')}`
                      : g.email
                    : t('No email — listed only', 'Sin correo — solo en la lista')}
                </p>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => remove(g)}
                  disabled={busy}
                  className="p-1.5 text-muted-2 hover:text-ink disabled:opacity-50"
                  aria-label={t(`Remove ${g.firstName}`, `Quitar a ${g.firstName}`)}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted font-light">
          {readOnly
            ? t('No one else has been added yet.', 'Aún no se ha agregado a nadie más.')
            : t(
                'Add the people staying with you. Anyone with an email gets an invite to see the plans and house details — never prices or documents.',
                'Agrega a las personas que se hospedan contigo. Quien tenga correo recibe una invitación para ver los planes y la información de la casa — nunca precios ni documentos.'
              )}
        </p>
      )}

      {notice && <p className="mt-3 text-sm text-body-strong font-light">{notice}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {!readOnly &&
        (adding ? (
          <form onSubmit={add} className="mt-5 space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={fieldLabelClass}>{t('First name', 'Nombre')}</span>
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className={fieldClass}
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className={fieldLabelClass}>{t('Last name', 'Apellido')}</span>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className={fieldClass}
                  autoComplete="off"
                />
              </label>
            </div>
            <label className="block">
              <span className={fieldLabelClass}>
                {t('Email', 'Correo')} <span className="opacity-60">{t('(optional — to send an invite)', '(opcional — para enviar una invitación)')}</span>
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={fieldClass}
                autoComplete="off"
              />
            </label>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center px-5 py-2.5 bg-ink text-white text-sm font-light tracking-wide rounded-sm disabled:opacity-60"
              >
                {busy ? t('Adding…', 'Agregando…') : form.email ? t('Add & send invite', 'Agregar y enviar invitación') : t('Add', 'Agregar')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false)
                  setForm(empty)
                  setError(null)
                }}
                className="text-sm font-light text-muted hover:text-ink"
              >
                {t('Cancel', 'Cancelar')}
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAdding(true)
              setNotice(null)
            }}
            className="mt-5 inline-flex items-center px-5 py-2.5 border border-line text-ink text-sm font-light tracking-wide rounded-sm hover:bg-sand transition-colors"
          >
            + {t('Add a guest', 'Agregar un huésped')}
          </button>
        ))}
    </div>
  )
}
