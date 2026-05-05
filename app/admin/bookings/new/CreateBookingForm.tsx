'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import type { PropertyOption } from '@/lib/portal/properties'

interface Props {
  properties: PropertyOption[]
}

export function CreateBookingForm({ properties }: Props) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to create booking')
      }
      const { bookingId } = await res.json()
      router.push(`/admin/bookings/${bookingId}`)
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Property */}
      <Section title="Property">
        <Field label="Property" required>
          <SelectShell>
            <select
              value={form.propertySanityId}
              onChange={(e) =>
                setForm((p) => ({ ...p, propertySanityId: e.target.value }))
              }
              required
              className="w-full appearance-none bg-white rounded-sm border border-stone-300 px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
            >
              <option value="">Select a property</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title_en || p.title_es || p.propertyCode || p._id}
                  {p.status && p.status !== 'active' ? ` (${p.status})` : ''}
                </option>
              ))}
            </select>
          </SelectShell>
        </Field>
      </Section>

      {/* Guest */}
      <Section title="Primary guest">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name">
            <Input
              type="text"
              value={form.firstName}
              onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
            />
          </Field>
          <Field label="Last name">
            <Input
              type="text"
              value={form.lastName}
              onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
            />
          </Field>
        </div>
        <Field label="Email" required>
          <Input
            type="email"
            value={form.email}
            onChange={(v) => setForm((p) => ({ ...p, email: v }))}
            required
          />
        </Field>
        <Field label="Email language">
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
      <Section title="Stay">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Check-in" required>
            <Input
              type="date"
              value={form.checkIn}
              onChange={(v) => setForm((p) => ({ ...p, checkIn: v }))}
              required
            />
          </Field>
          <Field label="Check-out" required>
            <Input
              type="date"
              value={form.checkOut}
              onChange={(v) => setForm((p) => ({ ...p, checkOut: v }))}
              required
            />
          </Field>
        </div>
        <Field label="Guest count">
          <Input
            type="number"
            min={1}
            value={form.guestCount}
            onChange={(v) => setForm((p) => ({ ...p, guestCount: v }))}
          />
        </Field>
      </Section>

      {/* Money — light touch for v1 */}
      <Section title="Pricing (optional)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Total amount (USD)">
            <Input
              type="number"
              step="0.01"
              value={form.totalAmount}
              onChange={(v) => setForm((p) => ({ ...p, totalAmount: v }))}
            />
          </Field>
          <Field label="Balance due (USD)">
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
      <Section title="Internal notes (optional)">
        <Field label="Notes (admin-only)">
          <textarea
            rows={4}
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
            placeholder="Anything we should remember about this booking…"
          />
        </Field>
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
          {submitting ? 'Creating…' : 'Create & send invitation'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
        >
          Cancel
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
