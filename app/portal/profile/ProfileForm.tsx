'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { cn } from '@/lib/utils'
import { fieldClass, fieldLabelClass } from '@/components/ui/field'

interface Props {
  locale: 'en' | 'es'
  email: string
  initialFirstName: string
  initialLastName: string
  initialPhone: string
  /** Where to go after saving (e.g. back to the stay). */
  returnTo?: string
}

export function ProfileForm({
  locale,
  email,
  initialFirstName,
  initialLastName,
  initialPhone,
  returnTo,
}: Props) {
  const router = useRouter()
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [phone, setPhone] = useState(initialPhone)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = firstName.trim() !== '' && lastName.trim() !== ''

  const save = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/portal/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || null,
        }),
      })
      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p?.error || 'Could not save')
      }
      setSaved(true)
      router.refresh()
      if (returnTo) router.push(returnTo)
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className={fieldLabelClass}>
            {t('First name', 'Nombre')}
          </span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value)
              setSaved(false)
            }}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className={fieldLabelClass}>
            {t('Last name', 'Apellido')}
          </span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value)
              setSaved(false)
            }}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block">
        <span className={fieldLabelClass}>
          {t('Phone (optional)', 'Teléfono (opcional)')}
        </span>
        <PhoneInput
          international
          defaultCountry="DO"
          value={phone || undefined}
          onChange={(v) => {
            setPhone(v ?? '')
            setSaved(false)
          }}
          className={cn(fieldClass, 'focus-within:border-ink')}
          numberInputProps={{
            className:
              'w-full text-sm font-light bg-transparent focus:outline-none',
          }}
        />
      </label>

      <label className="block">
        <span className={fieldLabelClass}>
          {t('Email', 'Correo')}
        </span>
        <input
          type="email"
          value={email}
          disabled
          className={fieldClass}
        />
      </label>

      {error && <p className="text-sm text-status-attention font-light">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !canSave}
          className="px-6 py-2.5 bg-ink text-white text-sm font-light tracking-wide rounded-sm hover:bg-brand disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? t('Saving…', 'Guardando…') : t('Save', 'Guardar')}
        </button>
        {saved && (
          <span className="text-sm text-emerald-700 font-light">
            {t('Saved ✓', 'Guardado ✓')}
          </span>
        )}
      </div>
    </div>
  )
}
