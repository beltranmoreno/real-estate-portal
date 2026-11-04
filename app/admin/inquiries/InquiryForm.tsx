'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PropertyOption } from '@/lib/portal/properties'
import { tFor } from '@/lib/i18n'
import { DateInput } from '@/components/admin/DateInput'
import { PropertyMultiPicker } from './PropertyMultiPicker'
import { MANUAL_CHANNELS } from './labels'

export interface InquiryFormValues {
  name: string
  email: string
  whatsapp: string
  nationality: string
  channel: string
  locale: 'en' | 'es'
  checkIn: string
  checkOut: string
  guests: string
  bedrooms: string
  budget: string
  message: string
  notes: string
  propertyIds: string[]
  propertyNotes: Record<string, string>
}

export const EMPTY_INQUIRY: InquiryFormValues = {
  name: '',
  email: '',
  whatsapp: '',
  nationality: '',
  channel: 'WhatsApp',
  locale: 'en',
  checkIn: '',
  checkOut: '',
  guests: '',
  bedrooms: '',
  budget: '',
  message: '',
  notes: '',
  propertyIds: [],
  propertyNotes: {},
}

interface Props {
  properties: PropertyOption[]
  /** Set when editing; omitted when logging a new inquiry. */
  inquiryId?: string
  initial?: InquiryFormValues
  locale?: 'en' | 'es'
}

const inputClass =
  'w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800'

/** Log an inquiry that came in off the site, or edit an existing one. */
export function InquiryForm({ properties, inquiryId, initial = EMPTY_INQUIRY, locale = 'en' }: Props) {
  const t = tFor(locale)
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(initial)
  const set = (key: keyof InquiryFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))
  // A channel saved earlier that's no longer in the list still shows.
  const channels = form.channel && !MANUAL_CHANNELS.includes(form.channel) ? [form.channel, ...MANUAL_CHANNELS] : MANUAL_CHANNELS

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError(t('A name is required.', 'El nombre es obligatorio.'))
      return
    }
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) {
      setError(t('Check-out must be after check-in.', 'La salida debe ser después de la entrada.'))
      return
    }
    setSubmitting(true)
    setError(null)
    const { propertyIds, propertyNotes, ...fields } = form
    try {
      const res = inquiryId
        ? await fetch(`/api/admin/inquiries/${inquiryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields, propertyIds, propertyNotes }),
          })
        : await fetch('/api/admin/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      router.push(`/admin/inquiries/${inquiryId ?? data.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title={t('Guest', 'Huésped')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('Name', 'Nombre')} required>
            <input value={form.name} onChange={set('name')} className={inputClass} />
          </Field>
          <Field label={t('Nationality (optional)', 'Nacionalidad (opcional)')}>
            <input value={form.nationality} onChange={set('nationality')} className={inputClass} />
          </Field>
        </div>
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
              {!form.channel && <option value="">—</option>}
              {channels.map((c) => (
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
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('Check-in', 'Entrada')}>
            <DateInput value={form.checkIn} onChange={(v) => setForm((f) => ({ ...f, checkIn: v }))} />
          </Field>
          <Field label={t('Check-out', 'Salida')}>
            <DateInput
              value={form.checkOut}
              min={form.checkIn || undefined}
              onChange={(v) => setForm((f) => ({ ...f, checkOut: v }))}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label={t('Guests', 'Huéspedes')}>
            <input type="number" min={1} value={form.guests} onChange={set('guests')} className={inputClass} />
          </Field>
          <Field label={t('Bedrooms (optional)', 'Habitaciones (opcional)')}>
            <input type="number" min={1} value={form.bedrooms} onChange={set('bedrooms')} className={inputClass} />
          </Field>
          <Field label={t('Budget (optional)', 'Presupuesto (opcional)')}>
            <input
              value={form.budget}
              onChange={set('budget')}
              placeholder={t('e.g. $1,500/night', 'ej. $1,500/noche')}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label={t('What they asked for', 'Lo que pidieron')}>
          <textarea value={form.message} onChange={set('message')} rows={3} className={inputClass} />
        </Field>
      </Section>

      <Section title={t('Houses', 'Casas')}>
        <PropertyMultiPicker
          properties={properties}
          value={form.propertyIds}
          onChange={(ids) => setForm((f) => ({ ...f, propertyIds: ids }))}
          notes={form.propertyNotes}
          onNotesChange={(n) => setForm((f) => ({ ...f, propertyNotes: n }))}
          locale={locale}
        />
      </Section>

      <Section title={t('Notes', 'Notas')}>
        <textarea
          value={form.notes}
          onChange={set('notes')}
          rows={4}
          placeholder={t('Anything about this inquiry. Only admins see these.', 'Cualquier cosa sobre esta consulta. Solo los administradores las ven.')}
          className={inputClass}
        />
      </Section>

      {error && <p className="text-sm text-red-600 font-light">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
        >
          {submitting
            ? t('Saving…', 'Guardando…')
            : inquiryId
              ? t('Save changes', 'Guardar cambios')
              : t('Save inquiry', 'Guardar consulta')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="px-4 py-3 text-stone-500 text-sm font-light tracking-wide hover:text-stone-900"
        >
          {t('Cancel', 'Cancelar')}
        </button>
      </div>
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
