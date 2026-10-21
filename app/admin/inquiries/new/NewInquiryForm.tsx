'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PropertyOption } from '@/lib/portal/properties'
import { tFor } from '@/lib/i18n'
import { PropertyMultiPicker } from '../PropertyMultiPicker'
import { MANUAL_CHANNELS } from '../labels'

interface Props {
  properties: PropertyOption[]
  locale?: 'en' | 'es'
}

const inputClass =
  'w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800'

export function NewInquiryForm({ properties, locale = 'en' }: Props) {
  const t = tFor(locale)
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [propertyIds, setPropertyIds] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    channel: 'WhatsApp',
    checkIn: '',
    checkOut: '',
    guests: '',
    message: '',
    notes: '',
    locale: 'en' as 'en' | 'es',
  })
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError(t('A name is required.', 'El nombre es obligatorio.'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, propertyIds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      router.push(`/admin/inquiries/${data.id}`)
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title={t('Guest', 'Huésped')}>
        <Field label={t('Name', 'Nombre')} required>
          <input value={form.name} onChange={set('name')} className={inputClass} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
          </Field>
          <Field label="WhatsApp">
            <input type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+1 …" className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('How they reached out', 'Cómo nos contactó')}>
            <select value={form.channel} onChange={set('channel')} className={inputClass}>
              {MANUAL_CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('Language', 'Idioma')}>
            <select value={form.locale} onChange={set('locale')} className={inputClass}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title={t('Stay', 'Estancia')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label={t('Check-in', 'Entrada')}>
            <input type="date" value={form.checkIn} onChange={set('checkIn')} className={inputClass} />
          </Field>
          <Field label={t('Check-out', 'Salida')}>
            <input type="date" value={form.checkOut} min={form.checkIn || undefined} onChange={set('checkOut')} className={inputClass} />
          </Field>
          <Field label={t('Guests', 'Huéspedes')}>
            <input type="number" min={1} value={form.guests} onChange={set('guests')} className={inputClass} />
          </Field>
        </div>
        <Field label={t('What they asked for', 'Lo que pidieron')}>
          <textarea value={form.message} onChange={set('message')} rows={3} className={inputClass} />
        </Field>
      </Section>

      <Section title={t('Houses', 'Casas')}>
        <PropertyMultiPicker properties={properties} value={propertyIds} onChange={setPropertyIds} locale={locale} />
      </Section>

      <Section title={t('Internal notes', 'Notas internas')}>
        <textarea value={form.notes} onChange={set('notes')} rows={3} className={inputClass} />
      </Section>

      {error && <p className="text-sm text-red-600 font-light">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
      >
        {submitting ? t('Saving…', 'Guardando…') : t('Save inquiry', 'Guardar consulta')}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-stone-200 rounded-xs p-6 space-y-4">
      <h2 className="text-sm uppercase tracking-[0.2em] text-stone-500 font-light">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-light text-stone-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
    </label>
  )
}
