'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'
import { AddressFields, hasAddress, type AddressValues } from '@/components/admin/AddressFields'

export interface GuestDetailsValues extends AddressValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationality: string
}

const inputClass =
  'w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800'
const label = 'block space-y-1.5'
const labelText = 'text-sm font-light text-stone-700'

/**
 * Edit the primary guest's name, contact, nationality and address from the
 * booking. The email can only change until the guest signs up.
 */
export function GuestDetailsEditor({
  userId,
  initial,
  emailLocked,
  locale = 'en',
}: {
  userId: string
  initial: GuestDetailsValues
  /** True once the guest has a portal account (their email is Clerk's). */
  emailLocked: boolean
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(initial)
  const [showAddress, setShowAddress] = useState(hasAddress(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = (k: keyof GuestDetailsValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setForm(initial)
          setShowAddress(hasAddress(initial))
          setEditing(true)
        }}
        className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 underline underline-offset-4"
      >
        {t('Edit guest details', 'Editar datos del huésped')}
      </button>
    )
  }

  const save = async () => {
    if (!form.email.trim() && !form.phone.trim()) {
      setError(t('Keep an email or a phone number.', 'Deja un correo o un teléfono.'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details: form }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not save', 'No se pudo guardar'))
      }
      setEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className={label}>
          <span className={labelText}>{t('First name', 'Nombre')}</span>
          <input value={form.firstName} onChange={set('firstName')} className={inputClass} />
        </label>
        <label className={label}>
          <span className={labelText}>{t('Last name', 'Apellido')}</span>
          <input value={form.lastName} onChange={set('lastName')} className={inputClass} />
        </label>
        <label className={label}>
          <span className={labelText}>{t('Email', 'Correo')}</span>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            disabled={emailLocked}
            className={`${inputClass} disabled:bg-stone-50 disabled:text-stone-500`}
          />
        </label>
        <label className={label}>
          <span className={labelText}>{t('Phone / WhatsApp', 'Teléfono / WhatsApp')}</span>
          <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass} />
        </label>
        <label className={label}>
          <span className={labelText}>{t('Nationality', 'Nacionalidad')}</span>
          <input value={form.nationality} onChange={set('nationality')} className={inputClass} />
        </label>
      </div>
      {emailLocked && (
        <p className="-mt-2 text-xs text-stone-500 font-light">
          {t('This guest has signed up, so their email is managed by their account.', 'Este huésped ya tiene cuenta, así que su correo lo gestiona su cuenta.')}
        </p>
      )}

      {showAddress ? (
        <AddressFields value={form} onChange={(a) => setForm((f) => ({ ...f, ...a }))} locale={locale} />
      ) : (
        <button
          type="button"
          onClick={() => setShowAddress(true)}
          className="text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 underline underline-offset-4"
        >
          + {t('Add address', 'Agregar dirección')}
        </button>
      )}

      {error && <p className="text-xs text-red-600 font-light">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
        >
          {saving ? t('Saving…', 'Guardando…') : t('Save', 'Guardar')}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-4 py-2 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100"
        >
          {t('Cancel', 'Cancelar')}
        </button>
      </div>
    </div>
  )
}
