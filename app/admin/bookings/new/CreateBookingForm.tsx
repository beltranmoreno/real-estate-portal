'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, X } from 'lucide-react'
import type { PropertyOption } from '@/lib/portal/properties'
import { PropertyPicker } from './PropertyPicker'
import { tFor } from '@/lib/i18n'
import { rateRowsToPayload, rateRowsTotal, type RateRow } from '@/lib/bookingRates'
import { NightlyRatesInput } from '@/components/admin/NightlyRatesInput'
import { DateInput } from '@/components/admin/DateInput'
import { AddressFields, EMPTY_ADDRESS, type AddressValues } from '@/components/admin/AddressFields'

interface Guest {
  id: string
  email: string | null
  phone: string | null
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

interface PaymentRow {
  amount: string
  currency: 'USD' | 'DOP'
  receivedOn: string
  received: boolean
  method: string
}

const EMPTY_PAYMENT: PaymentRow = { amount: '', currency: 'USD', receivedOn: '', received: true, method: '' }

const inputClass =
  'w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800'

const guestName = (g: Guest) => [g.firstName, g.lastName].filter(Boolean).join(' ') || g.email || g.phone || '—'
const guestContact = (g: Guest) => [g.email, g.phone].filter(Boolean).join(' · ')
const digits = (s: string) => s.replace(/\D/g, '')

export function CreateBookingForm({ properties, guests, locale = 'en' }: Props) {
  const t = tFor(locale)
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [pendingMode, setPendingMode] = useState<BookingMode | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    propertySanityId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    checkIn: '',
    checkOut: '',
    guestCount: '',
    totalAmount: '',
    commissionAmount: '',
    securityDeposit: '',
    notes: '',
    locale: 'en' as 'en' | 'es',
  })
  const set = (key: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [key]: v }))
  const [address, setAddress] = useState<AddressValues>(EMPTY_ADDRESS)
  const [showAddress, setShowAddress] = useState(false)
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [rates, setRates] = useState<RateRow[]>([{ from: '', to: '', rate: '' }])

  // Primary guest: pick an existing guest, or enter a new one.
  const [guestMode, setGuestMode] = useState<'existing' | 'new'>(guests.length > 0 ? 'existing' : 'new')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [guestSearch, setGuestSearch] = useState('')
  const selected = guests.find((g) => g.id === selectedId) ?? null

  const q = guestSearch.trim().toLowerCase()
  const filteredGuests = (
    q
      ? guests.filter((g) =>
          `${g.firstName ?? ''} ${g.lastName ?? ''} ${g.email ?? ''} ${g.phone ?? ''}`.toLowerCase().includes(q)
        )
      : guests
  ).slice(0, 8)

  // A new guest whose email or phone already belongs to someone on the list.
  const typedEmail = form.email.trim().toLowerCase()
  const typedPhone = digits(form.phone)
  const matchedGuest =
    guestMode === 'new'
      ? (guests.find(
          (g) =>
            (typedEmail && g.email?.toLowerCase() === typedEmail) ||
            (typedPhone.length >= 7 && g.phone && digits(g.phone) === typedPhone)
        ) ?? null)
      : null

  const pickGuest = (g: Guest) => {
    setSelectedId(g.id)
    setForm((p) => ({ ...p, locale: g.locale }))
    setGuestMode('existing')
  }

  // The invitation goes by email, so without one the booking can only be a draft.
  const guestEmail = guestMode === 'existing' ? selected?.email : form.email.trim()
  const canInvite = !!guestEmail

  const suggestion = rateRowsTotal(rates, form.checkIn, form.checkOut)
  const suggestedTotal = suggestion?.total ?? null
  const nights = suggestion?.nights ?? 0

  const submit = async (mode: BookingMode) => {
    const guestMissing = guestMode === 'existing' ? !selected : !form.email.trim() && !form.phone.trim()
    if (!form.propertySanityId || guestMissing || !form.checkIn || !form.checkOut) {
      setError(
        t(
          'Property, guest (email or phone), check-in and check-out are required.',
          'La propiedad, el huésped (correo o teléfono), la entrada y la salida son obligatorios.'
        )
      )
      return
    }
    if (form.checkOut <= form.checkIn) {
      setError(t('Check-out must be after check-in.', 'La salida debe ser después de la entrada.'))
      return
    }
    if (mode !== 'draft' && !canInvite) {
      setError(
        t(
          'This guest has no email, so the booking can only be saved as a draft.',
          'Este huésped no tiene correo, así que la reserva solo se puede guardar como borrador.'
        )
      )
      return
    }
    const ratePayload = rateRowsToPayload(rates, form.checkIn, form.checkOut)
    if (ratePayload.error) {
      setError(ratePayload.error)
      return
    }
    setSubmitting(true)
    setPendingMode(mode)
    setError(null)

    const guest =
      guestMode === 'existing'
        ? { guestUserId: selected!.id }
        : {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            nationality: form.nationality,
            ...(showAddress ? address : {}),
          }
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertySanityId: form.propertySanityId,
          ...guest,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          guestCount: form.guestCount,
          nightlyRate: ratePayload.nightlyRate,
          nightlyRates: ratePayload.nightlyRates,
          totalAmount: form.totalAmount,
          commissionAmount: form.commissionAmount,
          securityDeposit: form.securityDeposit,
          payments: payments.filter((p) => Number(p.amount) > 0),
          notes: form.notes,
          locale: form.locale,
          mode,
        }),
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

  // Enter-to-submit: create & send when possible, otherwise save the draft.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(canInvite ? 'send' : 'draft')
  }

  const setPayment = (i: number, patch: Partial<PaymentRow>) =>
    setPayments((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Property */}
      <Section title={t('Property', 'Propiedad')}>
        <Field label={t('Property', 'Propiedad')} required>
          <PropertyPicker
            properties={properties}
            value={form.propertySanityId}
            onChange={(id) => setForm((p) => ({ ...p, propertySanityId: id }))}
            required
            locale={locale}
          />
        </Field>
      </Section>

      {/* Guest */}
      <Section title={t('Primary guest', 'Huésped principal')}>
        <div className="inline-flex rounded-sm border border-stone-300 p-0.5 text-sm">
          {(['existing', 'new'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setGuestMode(m)
                setSelectedId(null)
              }}
              className={`px-4 py-1.5 rounded-sm transition-colors ${
                guestMode === m ? 'bg-stone-800 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {m === 'existing' ? t('Existing guest', 'Huésped existente') : t('New guest', 'Huésped nuevo')}
            </button>
          ))}
        </div>

        {guestMode === 'existing' ? (
          selected ? (
            <div className="flex items-center justify-between gap-4 p-4 bg-stone-50 border border-stone-200 rounded-sm">
              <div>
                <p className="text-sm font-medium text-stone-900">{guestName(selected)}</p>
                <p className="text-xs text-stone-500 font-light">
                  {guestContact(selected)} · {selected.locale.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null)
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
                  placeholder={t('Search by name, email or phone…', 'Buscar por nombre, correo o teléfono…')}
                  className={inputClass}
                />
              </Field>
              <div className="border border-stone-200 rounded-sm divide-y divide-stone-100 max-h-64 overflow-y-auto">
                {filteredGuests.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-stone-500 font-light">
                    {t('No matching guests.', 'No hay huéspedes coincidentes.')}{' '}
                    <button type="button" onClick={() => setGuestMode('new')} className="text-stone-800 underline underline-offset-2">
                      {t('Add a new guest', 'Agregar un huésped nuevo')}
                    </button>
                  </p>
                ) : (
                  filteredGuests.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => pickGuest(g)}
                      className="w-full text-left px-3 py-2.5 hover:bg-stone-50 transition-colors"
                    >
                      <span className="text-sm text-stone-900">{guestName(g)}</span>
                      <span className="block text-xs text-stone-500 font-light">{guestContact(g)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('First name', 'Nombre')}>
                <Input value={form.firstName} onChange={set('firstName')} />
              </Field>
              <Field label={t('Last name', 'Apellido')}>
                <Input value={form.lastName} onChange={set('lastName')} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('Email', 'Correo')}>
                <Input type="email" value={form.email} onChange={set('email')} placeholder="guest@email.com" />
              </Field>
              <Field label={t('Phone / WhatsApp', 'Teléfono / WhatsApp')}>
                <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 …" />
              </Field>
            </div>
            <p className="-mt-2 text-xs text-stone-500 font-light">
              {t(
                'An email, a phone number or both. Without an email the booking is saved as a draft, since the portal invitation goes by email.',
                'Un correo, un teléfono o ambos. Sin correo la reserva se guarda como borrador, porque la invitación al portal va por correo.'
              )}
            </p>
            <Field label={t('Nationality (optional)', 'Nacionalidad (opcional)')}>
              <Input value={form.nationality} onChange={set('nationality')} />
            </Field>

            {showAddress ? (
              <div className="space-y-3 border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-stone-700">{t('Address', 'Dirección')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddress(false)
                      setAddress(EMPTY_ADDRESS)
                    }}
                    aria-label={t('Remove address', 'Quitar dirección')}
                    className="p-1 text-stone-400 hover:text-stone-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <AddressFields value={address} onChange={setAddress} locale={locale} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddress(true)}
                className="text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 underline underline-offset-4"
              >
                + {t('Add address', 'Agregar dirección')}
              </button>
            )}

            {matchedGuest && (
              <div className="flex items-center justify-between gap-4 p-3 bg-amber-50 border border-amber-200 rounded-sm">
                <div>
                  <p className="text-xs font-medium text-amber-800">{t('Did you mean this guest?', '¿Te refieres a este huésped?')}</p>
                  <p className="text-sm text-stone-900 mt-0.5">
                    {guestName(matchedGuest)} <span className="text-stone-500 font-light">· {guestContact(matchedGuest)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => pickGuest(matchedGuest)}
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
              onChange={(e) => setForm((p) => ({ ...p, locale: e.target.value as 'en' | 'es' }))}
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
            <DateInput value={form.checkIn} onChange={set('checkIn')} required />
          </Field>
          <Field label={t('Check-out', 'Salida')} required>
            <DateInput value={form.checkOut} onChange={set('checkOut')} min={form.checkIn || undefined} required />
          </Field>
        </div>
        <Field label={t('Guest count', 'Número de huéspedes')}>
          <Input type="number" min={1} value={form.guestCount} onChange={set('guestCount')} />
        </Field>
      </Section>

      {/* Pricing */}
      <Section title={t('Pricing (optional)', 'Precio (opcional)')}>
        <div className="space-y-1.5">
          <span className="block text-sm font-light text-stone-700">{t('Price per night (USD)', 'Precio por noche (USD)')}</span>
          <NightlyRatesInput
            rows={rates}
            onChange={setRates}
            checkIn={form.checkIn}
            checkOut={form.checkOut}
            locale={locale}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={t('Total (USD)', 'Total (USD)')}>
            <Input type="number" min={0} step="0.01" value={form.totalAmount} onChange={set('totalAmount')} />
          </Field>
          <Field label={t('Commission (USD)', 'Comisión (USD)')}>
            <Input type="number" min={0} step="0.01" value={form.commissionAmount} onChange={set('commissionAmount')} />
          </Field>
          <Field label={t('Security deposit (USD)', 'Depósito de seguridad (USD)')}>
            <Input type="number" min={0} step="0.01" value={form.securityDeposit} onChange={set('securityDeposit')} />
          </Field>
        </div>
        {suggestedTotal !== null && String(suggestedTotal) !== form.totalAmount && (
          <p className="-mt-1 text-xs text-stone-500 font-light">
            {rates.length > 1
              ? t(`${nights} nights at these rates = `, `${nights} noches con estas tarifas = `)
              : t(`${nights} nights × rate = `, `${nights} noches × tarifa = `)}
            <button
              type="button"
              onClick={() => set('totalAmount')(String(suggestedTotal))}
              className="text-stone-800 underline underline-offset-2"
            >
              USD {suggestedTotal.toLocaleString('en-US')}
            </button>
          </p>
        )}

        <div className="border-t border-stone-100 pt-4 space-y-3">
          <span className="block text-sm font-light text-stone-700">{t('Payments', 'Pagos')}</span>
          {payments.map((p, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_5.5rem_1fr_1fr_auto] gap-2 items-start">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={p.amount}
                onChange={(v) => setPayment(i, { amount: v })}
                placeholder={t('Amount', 'Monto')}
              />
              <SelectShell>
                <select
                  value={p.currency}
                  onChange={(e) => setPayment(i, { currency: e.target.value as PaymentRow['currency'] })}
                  className="w-full appearance-none bg-white rounded-sm border border-stone-300 px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
                >
                  <option value="USD">USD</option>
                  <option value="DOP">DOP</option>
                </select>
              </SelectShell>
              <DateInput value={p.receivedOn} onChange={(v) => setPayment(i, { receivedOn: v })} />
              <Input
                value={p.method}
                onChange={(v) => setPayment(i, { method: v })}
                placeholder={t('Method (transfer, card…)', 'Método (transferencia, tarjeta…)')}
              />
              <div className="col-span-2 sm:col-span-1 flex items-center justify-between gap-3 h-[42px]">
                <label className="flex items-center gap-2 text-sm font-light text-stone-700 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={p.received}
                    onChange={(e) => setPayment(i, { received: e.target.checked })}
                    className="accent-stone-800"
                  />
                  {t('Received', 'Recibido')}
                </label>
                <button
                  type="button"
                  onClick={() => setPayments((rows) => rows.filter((_, j) => j !== i))}
                  aria-label={t('Remove payment', 'Quitar pago')}
                  className="p-1 text-stone-400 hover:text-stone-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPayments((rows) => [...rows, EMPTY_PAYMENT])}
            className="text-xs uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 underline underline-offset-4"
          >
            + {t('Add payment', 'Agregar pago')}
          </button>
          {payments.length > 0 && (
            <p className="text-xs text-stone-500 font-light">
              {t(
                'Untick “Received” for a payment that is due but hasn’t come in yet; it won’t reduce the balance.',
                'Desmarca “Recibido” en un pago pendiente que aún no ha llegado; no reduce el saldo.'
              )}
            </p>
          )}
        </div>
      </Section>

      {/* Notes */}
      <Section title={t('Internal notes (optional)', 'Notas internas (opcional)')}>
        <Field label={t('Notes (admin-only)', 'Notas (solo administradores)')}>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => set('notes')(e.target.value)}
            className={inputClass}
            placeholder={t('Anything we should remember about this booking…', 'Algo que debamos recordar sobre esta reserva…')}
          />
        </Field>
      </Section>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-light">{error}</div>}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => submit('send')}
          disabled={submitting || !canInvite}
          className="px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting && pendingMode === 'send' ? t('Creating…', 'Creando…') : t('Create & send invitation', 'Crear y enviar invitación')}
        </button>
        <button
          type="button"
          onClick={() => submit('invite')}
          disabled={submitting || !canInvite}
          className="px-6 py-3 border border-stone-400 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting && pendingMode === 'invite' ? t('Creating…', 'Creando…') : t('Create only', 'Solo crear')}
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
      {!canInvite && (guestMode === 'new' ? form.phone.trim() : selected) && (
        <p className="-mt-4 text-xs text-stone-500 font-light">
          {t(
            'No email for this guest, so only “Save as draft” is available. Add an email later to invite them to the portal.',
            'Este huésped no tiene correo, así que solo se puede “Guardar como borrador”. Agrega un correo después para invitarlo al portal.'
          )}
        </p>
      )}
    </form>
  )
}

// --- Small primitives kept local to this form ---

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

function Input({
  type = 'text',
  value,
  onChange,
  min,
  step,
  placeholder,
}: {
  type?: string
  value: string
  onChange: (v: string) => void
  min?: number
  step?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      step={step}
      placeholder={placeholder}
      className={inputClass}
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
