'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { PropertyOption } from '@/lib/portal/properties'
import { PropertyPicker } from './PropertyPicker'
import { tFor } from '@/lib/i18n'

interface Guest {
  email: string
  firstName: string | null
  lastName: string | null
  locale: 'en' | 'es'
}

interface Props {
  properties: PropertyOption[]
  guests: Guest[]
  locale?: 'en' | 'es'
}

type BookingMode = 'draft' | 'invite' | 'send'

export function CreateBookingForm({ properties, guests, locale = 'en' }: Props) {
  const t = tFor(locale)
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    propertySanityId: '',
    email: '',
    firstName: '',
    lastName: '',
    checkIn: '',
    checkOut: '',
    guestCount: '',
    totalAmount: '',
    balanceDue: '',
    notes: '',
    locale: 'en' as 'en' | 'es',
  })

  const [pendingMode, setPendingMode] = useState<BookingMode | null>(null)

  const submit = async (mode: BookingMode) => {
    if (!form.propertySanityId || !form.email || !form.checkIn || !form.checkOut) {
      setError(
        t(
          'Property, guest email, check-in and check-out are required.',
          'La propiedad, el correo del huésped, la entrada y la salida son obligatorios.'
        )
      )
      return
    }
    setSubmitting(true)
    setPendingMode(mode)
    setError(null)

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, mode }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || t('Failed to create booking', 'No se pudo crear la reserva'))
      }
      const { bookingId } = await res.json()
      router.push(`/admin/bookings/${bookingId}`)
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
      setSubmitting(false)
      setPendingMode(null)
    }
  }

  // Enter-to-submit defaults to the primary action (create & send).
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit('send')
  }

  // Primary-guest picker: search an existing guest, or enter a new one.
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>(
    guests.length > 0 ? 'existing' : 'new'
  )
  const [guestSearch, setGuestSearch] = useState('')

  const applyGuest = (g: Guest) => {
    setForm((p) => ({
      ...p,
      email: g.email,
      firstName: g.firstName ?? '',
      lastName: g.lastName ?? '',
      locale: g.locale,
    }))
    setGuestMode('existing')
  }

  const clearGuest = () =>
    setForm((p) => ({ ...p, email: '', firstName: '', lastName: '' }))

  const q = guestSearch.trim().toLowerCase()
  const filteredGuests = (
    q
      ? guests.filter((g) => {
          const name = `${g.firstName ?? ''} ${g.lastName ?? ''}`.toLowerCase()
          return g.email.toLowerCase().includes(q) || name.includes(q)
        })
      : guests
  ).slice(0, 8)

  // The guest whose email exactly matches what's in the form (if any).
  const matchedGuest =
    guests.find(
      (g) => g.email.toLowerCase() === form.email.trim().toLowerCase()
    ) ?? null

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Property */}
      <Section title={t('Property', 'Propiedad')}>
        <Field label={t('Property', 'Propiedad')} required>
          <PropertyPicker
            properties={properties}
            value={form.propertySanityId}
            onChange={(id) =>
              setForm((p) => ({ ...p, propertySanityId: id }))
            }
            required
            locale={locale}
          />
        </Field>
      </Section>

      {/* Guest */}
      <Section title={t('Primary guest', 'Huésped principal')}>
        {/* Mode toggle: search an existing guest, or add a new one. */}
        <div className="inline-flex rounded-sm border border-stone-300 p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setGuestMode('existing')}
            className={`px-4 py-1.5 rounded-sm transition-colors ${
              guestMode === 'existing'
                ? 'bg-stone-800 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Existing guest', 'Huésped existente')}
          </button>
          <button
            type="button"
            onClick={() => {
              setGuestMode('new')
              clearGuest()
            }}
            className={`px-4 py-1.5 rounded-sm transition-colors ${
              guestMode === 'new'
                ? 'bg-stone-800 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('New guest', 'Huésped nuevo')}
          </button>
        </div>

        {guestMode === 'existing' ? (
          matchedGuest ? (
            // A guest is selected — show them, with a way to change.
            <div className="flex items-center justify-between gap-4 p-4 bg-stone-50 border border-stone-200 rounded-sm">
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {[matchedGuest.firstName, matchedGuest.lastName]
                    .filter(Boolean)
                    .join(' ') || matchedGuest.email}
                </p>
                <p className="text-xs text-stone-500 font-light">
                  {matchedGuest.email} · {matchedGuest.locale.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearGuest()
                  setGuestSearch('')
                }}
                className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900"
              >
                {t('Change', 'Cambiar')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Field label={t('Search guests', 'Buscar huéspedes')}>
                <input
                  type="text"
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  placeholder={t('Search by name or email…', 'Buscar por nombre o correo…')}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </Field>
              <div className="border border-stone-200 rounded-sm divide-y divide-stone-100 max-h-64 overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-stone-500 font-light">
                    {t('No matching guests.', 'No hay huéspedes coincidentes.')}{' '}
                    <button
                      type="button"
                      onClick={() => setGuestMode('new')}
                      className="text-stone-800 underline underline-offset-2"
                    >
                      {t('Add a new guest', 'Agregar un huésped nuevo')}
                    </button>
                  </p>
                ) : (
                  filteredGuests.map((g) => (
                    <button
                      key={g.email}
                      type="button"
                      onClick={() => applyGuest(g)}
                      className="w-full text-left px-3 py-2.5 hover:bg-stone-50 transition-colors"
                    >
                      <span className="text-sm text-stone-900">
                        {[g.firstName, g.lastName].filter(Boolean).join(' ') ||
                          g.email}
                      </span>
                      <span className="block text-xs text-stone-500 font-light">
                        {g.email}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        ) : (
          // New guest — free-form entry, with a "did you mean" nudge when
          // the typed email already belongs to an existing guest.
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('First name', 'Nombre')}>
                <Input
                  type="text"
                  value={form.firstName}
                  onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
                />
              </Field>
              <Field label={t('Last name', 'Apellido')}>
                <Input
                  type="text"
                  value={form.lastName}
                  onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
                />
              </Field>
            </div>
            <Field label={t('Email', 'Correo')} required>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                required
                placeholder="guest@email.com"
                className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
            </Field>

            {matchedGuest && (
              <div className="flex items-center justify-between gap-4 p-3 bg-amber-50 border border-amber-200 rounded-sm">
                <div>
                  <p className="text-xs font-medium text-amber-800">
                    {t('Did you mean this guest?', '¿Te refieres a este huésped?')}
                  </p>
                  <p className="text-sm text-stone-900 mt-0.5">
                    {[matchedGuest.firstName, matchedGuest.lastName]
                      .filter(Boolean)
                      .join(' ') || matchedGuest.email}{' '}
                    <span className="text-stone-500 font-light">
                      · {matchedGuest.email}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => applyGuest(matchedGuest)}
                  className="shrink-0 px-3 py-1.5 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
                >
                  {t('Use this guest', 'Usar este huésped')}
                </button>
              </div>
            )}
          </>
        )}

        <Field label={t('Email language', 'Idioma del correo')}>
          <SelectShell>
            <select
              value={form.locale}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  locale: e.target.value as 'en' | 'es',
                }))
              }
              className="w-full appearance-none bg-white rounded-sm border border-stone-300 px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </SelectShell>
        </Field>
      </Section>

      {/* Stay */}
      <Section title={t('Stay', 'Estancia')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('Check-in', 'Entrada')} required>
            <Input
              type="date"
              value={form.checkIn}
              onChange={(v) => setForm((p) => ({ ...p, checkIn: v }))}
              required
            />
          </Field>
          <Field label={t('Check-out', 'Salida')} required>
            <Input
              type="date"
              value={form.checkOut}
              onChange={(v) => setForm((p) => ({ ...p, checkOut: v }))}
              required
            />
          </Field>
        </div>
        <Field label={t('Guest count', 'Número de huéspedes')}>
          <Input
            type="number"
            min={1}
            value={form.guestCount}
            onChange={(v) => setForm((p) => ({ ...p, guestCount: v }))}
          />
        </Field>
      </Section>

      {/* Money — light touch for v1 */}
      <Section title={t('Pricing (optional)', 'Precio (opcional)')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('Total amount (USD)', 'Monto total (USD)')}>
            <Input
              type="number"
              step="0.01"
              value={form.totalAmount}
              onChange={(v) => setForm((p) => ({ ...p, totalAmount: v }))}
            />
          </Field>
          <Field label={t('Balance due (USD)', 'Saldo pendiente (USD)')}>
            <Input
              type="number"
              step="0.01"
              value={form.balanceDue}
              onChange={(v) => setForm((p) => ({ ...p, balanceDue: v }))}
            />
          </Field>
        </div>
      </Section>

      {/* Notes */}
      <Section title={t('Internal notes (optional)', 'Notas internas (opcional)')}>
        <Field label={t('Notes (admin-only)', 'Notas (solo administradores)')}>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
            placeholder={t('Anything we should remember about this booking…', 'Algo que debamos recordar sobre esta reserva…')}
          />
        </Field>
      </Section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-light">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting && pendingMode === 'send'
            ? t('Creating…', 'Creando…')
            : t('Create & send invitation', 'Crear y enviar invitación')}
        </button>
        <button
          type="button"
          onClick={() => submit('invite')}
          disabled={submitting}
          className="px-6 py-3 border border-stone-400 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting && pendingMode === 'invite'
            ? t('Creating…', 'Creando…')
            : t('Create only', 'Solo crear')}
        </button>
        <button
          type="button"
          onClick={() => submit('draft')}
          disabled={submitting}
          className="px-6 py-3 border border-stone-300 text-stone-600 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting && pendingMode === 'draft' ? t('Saving…', 'Guardando…') : t('Save as draft', 'Guardar como borrador')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="px-4 py-3 text-stone-500 text-sm font-light tracking-wide rounded-sm hover:text-stone-900 transition-colors"
        >
          {t('Cancel', 'Cancelar')}
        </button>
      </div>
    </form>
  )
}

// --- Small primitives kept local to this form ---

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white border border-stone-200 rounded-xs p-6 space-y-4">
      <h2 className="text-sm uppercase tracking-[0.2em] text-stone-500 font-light">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
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

function Input({
  type,
  value,
  onChange,
  required,
  min,
  step,
}: {
  type: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  min?: number
  step?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      min={min}
      step={step}
      className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
    />
  )
}

function SelectShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
    </div>
  )
}
