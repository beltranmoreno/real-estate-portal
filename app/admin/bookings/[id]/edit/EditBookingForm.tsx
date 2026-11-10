'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { BookingStatus } from '@prisma/client'
import { tFor } from '@/lib/i18n'
import { DateInput } from '@/components/admin/DateInput'
import { NightlyRatesInput } from '@/components/admin/NightlyRatesInput'
import { rateRowsToPayload, rateRowsTotal, type RateRow } from '@/lib/bookingRates'

interface Props {
  bookingId: string
  locale?: 'en' | 'es'
  /** Pricing and deposit (ADMIN/AGENT). STAFF edit the stay and logistics. */
  showMoney?: boolean
  initial: {
    checkIn: string
    checkOut: string
    guestCount: string
    status: BookingStatus
    rates: RateRow[]
    totalAmount: string
    securityDeposit: string
    depositReturned: boolean
    depositReturnedOn: string
    balanceDue: string
    paidInFull: boolean
    arrivalDetails: string
    keyCode: string
  }
}

const STATUS_OPTIONS: Array<{ value: BookingStatus; en: string; es: string }> = [
  { value: 'PENDING', en: 'Pending — not confirmed yet', es: 'Pendiente — aún sin confirmar' },
  { value: 'CONFIRMED', en: 'Confirmed', es: 'Confirmada' },
  { value: 'ACTIVE', en: 'Active — currently staying', es: 'Activa — hospedándose actualmente' },
  { value: 'COMPLETED', en: 'Completed', es: 'Completada' },
  { value: 'CANCELLED', en: 'Cancelled', es: 'Cancelada' },
]

export function EditBookingForm({ bookingId, locale = 'en', initial, showMoney = true }: Props) {
  const router = useRouter()
  const t = tFor(locale)
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggestion = rateRowsTotal(form.rates, form.checkIn, form.checkOut)

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ratePayload = showMoney
      ? rateRowsToPayload(form.rates, form.checkIn, form.checkOut)
      : { error: null, nightlyRate: undefined, nightlyRates: undefined }
    if (ratePayload.error) {
      setError(ratePayload.error)
      return
    }
    setSubmitting(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rates, totalAmount, securityDeposit, depositReturned, depositReturnedOn, balanceDue, paidInFull, ...stay } = form
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          showMoney
            ? {
                ...stay,
                totalAmount,
                securityDeposit,
                depositReturned,
                balanceDue,
                paidInFull,
                nightlyRate: ratePayload.nightlyRate,
                nightlyRates: ratePayload.nightlyRates,
                // No date while ticked → the server records today.
                depositReturnedOn: depositReturned ? depositReturnedOn || undefined : null,
              }
            : stay
        ),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || t('Could not save', 'No se pudo guardar'))
      }
      router.push(`/admin/bookings/${bookingId}`)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title={t('Stay', 'Estadía')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('Check-in', 'Entrada')}>
            <DateInput value={form.checkIn} onChange={(v) => update('checkIn', v)} required />
          </Field>
          <Field label={t('Check-out', 'Salida')}>
            <DateInput
              value={form.checkOut}
              min={form.checkIn || undefined}
              onChange={(v) => update('checkOut', v)}
              required
            />
          </Field>
        </div>
        <Field label={t('Guest count', 'Número de huéspedes')}>
          <Input
            type="number"
            min={1}
            value={form.guestCount}
            onChange={(v) => update('guestCount', v)}
          />
        </Field>
        <Field label={t('Status', 'Estado')}>
          <SelectShell>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value as BookingStatus)}
              className="w-full appearance-none bg-white rounded-sm border border-stone-300 px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.en, o.es)}
                </option>
              ))}
            </select>
          </SelectShell>
        </Field>
      </Section>

{showMoney && (<>
      <Section title={t('Pricing', 'Precios')}>
        <div className="space-y-1.5">
          <span className="block text-sm font-light text-stone-700">{t('Price per night (USD)', 'Precio por noche (USD)')}</span>
          <NightlyRatesInput
            rows={form.rates}
            onChange={(rows) => update('rates', rows)}
            checkIn={form.checkIn}
            checkOut={form.checkOut}
            locale={locale}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('House total (USD)', 'Total de la casa (USD)')}>
            <Input
              type="number"
              step="0.01"
              value={form.totalAmount}
              onChange={(v) => update('totalAmount', v)}
            />
          </Field>
        </div>
        {suggestion && String(suggestion.total) !== form.totalAmount && (
          <p className="-mt-1 text-xs text-stone-500 font-light">
            {t(`${suggestion.nights} nights at these rates = `, `${suggestion.nights} noches con estas tarifas = `)}
            <button
              type="button"
              onClick={() => update('totalAmount', String(suggestion.total))}
              className="text-stone-800 underline underline-offset-2"
            >
              USD {suggestion.total.toLocaleString('en-US')}
            </button>
          </p>
        )}
        <p className="text-xs text-stone-500 font-light">
          {t(
            'This is the house price. The commission and payments are on the booking page, where the balance due is worked out from extras, services and the payments log.',
            'Este es el precio de la casa. La comisión y los pagos están en la página de la reserva, donde el saldo pendiente se calcula a partir de extras, servicios y el registro de pagos.'
          )}
        </p>
      </Section>

      <Section title={t('Security deposit', 'Depósito de seguridad')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t('Deposit (USD, optional)', 'Depósito (USD, opcional)')}>
            <Input
              type="number"
              step="0.01"
              min={0}
              value={form.securityDeposit}
              onChange={(v) => update('securityDeposit', v)}
            />
          </Field>
          {form.depositReturned && (
            <Field label={t('Returned on (optional)', 'Devuelto el (opcional)')}>
              <DateInput value={form.depositReturnedOn} onChange={(v) => update('depositReturnedOn', v)} />
            </Field>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm font-light text-stone-700 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={form.depositReturned}
            onChange={(e) => update('depositReturned', e.target.checked)}
            className="h-4 w-4 accent-stone-800"
          />
          {t('Deposit returned to the guest', 'Depósito devuelto al huésped')}
        </label>
      </Section>

</>)}

      <Section title={t('Logistics', 'Logística')}>
        <Field
          label={t(
            'Arrival details (visible to guest in their portal)',
            'Detalles de llegada (visibles para el huésped en su portal)'
          )}
        >
          <textarea
            rows={3}
            value={form.arrivalDetails}
            onChange={(e) => update('arrivalDetails', e.target.value)}
            placeholder={t(
              'Flight info, transfer details, anything the guest sent us…',
              'Info de vuelo, detalles de traslado, cualquier cosa que el huésped nos haya enviado…'
            )}
            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
          />
        </Field>
        <Field
          label={t(
            'Key code (released to guest 24h before check-in)',
            'Código de acceso (se envía al huésped 24 h antes de la entrada)'
          )}
        >
          <Input
            type="text"
            value={form.keyCode}
            onChange={(v) => update('keyCode', v)}
            placeholder={t('e.g. 1234', 'ej. 1234')}
          />
        </Field>
        {form.keyCode !== initial.keyCode && initial.keyCode && (
          <p className="text-xs text-amber-700 font-light">
            {t(
              'Changing the key will reset the released-at timestamp so the cron re-sends the new code on the next sweep.',
              'Cambiar el código reiniciará la marca de envío para que el cron reenvíe el nuevo código en la próxima ejecución.'
            )}
          </p>
        )}
      </Section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-light">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? t('Saving…', 'Guardando…') : t('Save changes', 'Guardar cambios')}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/bookings/${bookingId}`)}
          className="px-6 py-3 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
        >
          {t('Cancel', 'Cancelar')}
        </button>
      </div>
    </form>
  )
}

// --- Local primitives ---

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
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-light text-stone-700">{label}</span>
      {children}
    </label>
  )
}

function Input({
  type,
  value,
  onChange,
  min,
  step,
  placeholder,
}: {
  type: string
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
