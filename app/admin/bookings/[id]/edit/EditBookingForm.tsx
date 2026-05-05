'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { BookingStatus } from '@prisma/client'

interface Props {
  bookingId: string
  initial: {
    checkIn: string
    checkOut: string
    guestCount: string
    status: BookingStatus
    totalAmount: string
    balanceDue: string
    paidInFull: boolean
    arrivalDetails: string
    keyCode: string
  }
}

const STATUS_OPTIONS: Array<{ value: BookingStatus; label: string }> = [
  { value: 'PENDING', label: 'Pending — awaiting guest acceptance' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'ACTIVE', label: 'Active — currently staying' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export function EditBookingForm({ bookingId, initial }: Props) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || 'Could not save')
      }
      router.push(`/admin/bookings/${bookingId}`)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Stay">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Check-in">
            <Input
              type="date"
              value={form.checkIn}
              onChange={(v) => update('checkIn', v)}
            />
          </Field>
          <Field label="Check-out">
            <Input
              type="date"
              value={form.checkOut}
              onChange={(v) => update('checkOut', v)}
            />
          </Field>
        </div>
        <Field label="Guest count">
          <Input
            type="number"
            min={1}
            value={form.guestCount}
            onChange={(v) => update('guestCount', v)}
          />
        </Field>
        <Field label="Status">
          <SelectShell>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value as BookingStatus)}
              className="w-full appearance-none bg-white rounded-sm border border-stone-300 px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </SelectShell>
        </Field>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Total amount (USD)">
            <Input
              type="number"
              step="0.01"
              value={form.totalAmount}
              onChange={(v) => update('totalAmount', v)}
            />
          </Field>
          <Field label="Balance due (USD)">
            <Input
              type="number"
              step="0.01"
              value={form.balanceDue}
              onChange={(v) => update('balanceDue', v)}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-light text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.paidInFull}
            onChange={(e) => update('paidInFull', e.target.checked)}
            className="h-4 w-4 rounded border-stone-300 accent-stone-800"
          />
          <span>Paid in full</span>
        </label>
      </Section>

      <Section title="Logistics">
        <Field label="Arrival details (visible to guest in their portal)">
          <textarea
            rows={3}
            value={form.arrivalDetails}
            onChange={(e) => update('arrivalDetails', e.target.value)}
            placeholder="Flight info, transfer details, anything the guest sent us…"
            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
          />
        </Field>
        <Field label="Key code (released to guest 24h before check-in)">
          <Input
            type="text"
            value={form.keyCode}
            onChange={(v) => update('keyCode', v)}
            placeholder="e.g. 1234"
          />
        </Field>
        {form.keyCode !== initial.keyCode && initial.keyCode && (
          <p className="text-xs text-amber-700 font-light">
            Changing the key will reset the released-at timestamp so the cron
            re-sends the new code on the next sweep.
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
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/bookings/${bookingId}`)}
          className="px-6 py-3 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
        >
          Cancel
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
