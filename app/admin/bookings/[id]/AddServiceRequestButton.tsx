'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import {
  CATEGORY_LABELS,
  type ConciergeServiceOption,
} from '@/lib/portal/conciergeServices.types'

interface Props {
  bookingId: string
  services: ConciergeServiceOption[]
}

/**
 * Admin entry point for logging a concierge service the guest asked for
 * out-of-band. Two paths:
 *   1. Pick from the Sanity catalog (most common) — snapshots the
 *      canonical name/category.
 *   2. Free-form "custom" service — for one-off requests that aren't
 *      worth adding to the catalog.
 *
 * Always sets `addedManually=true`; the audit log + UI badge
 * differentiates these from renter-portal submissions.
 */
export function AddServiceRequestButton({ bookingId, services }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog')
  const [selected, setSelected] = useState<ConciergeServiceOption | null>(null)
  const [customName, setCustomName] = useState('')
  const [search, setSearch] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [partySize, setPartySize] = useState('')
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [status, setStatus] = useState('REQUESTED')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const filtered = services.filter((s) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (s.name_en || '').toLowerCase().includes(q) ||
        (s.name_es || '').toLowerCase().includes(q)
      )
    })
    const map = new Map<string, ConciergeServiceOption[]>()
    for (const s of filtered) {
      const key = s.category || 'other'
      const arr = map.get(key) ?? []
      arr.push(s)
      map.set(key, arr)
    }
    return map
  }, [services, search])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  const reset = () => {
    setMode('catalog')
    setSelected(null)
    setCustomName('')
    setSearch('')
    setPreferredDate('')
    setPreferredTime('')
    setPartySize('')
    setNotes('')
    setInternalNotes('')
    setStatus('REQUESTED')
    setError(null)
  }

  const close = () => {
    reset()
    setOpen(false)
  }

  const submit = async () => {
    if (mode === 'catalog' && !selected) return
    if (mode === 'custom' && !customName.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/bookings/${bookingId}/service-requests`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceSanityId: mode === 'catalog' ? selected!._id : null,
            serviceName:
              mode === 'custom'
                ? customName.trim()
                : undefined,
            preferredDate: preferredDate || null,
            preferredTime: preferredTime || null,
            partySize: partySize || null,
            notes: notes || null,
            internalNotes: internalNotes || null,
            status,
          }),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not create')
      }
      router.refresh()
      close()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 underline underline-offset-4"
      >
        <Plus className="w-3 h-3" />
        Add service
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
          onClick={close}
        >
          <div
            className="bg-white rounded-sm w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h3 className="text-lg font-light text-stone-900 tracking-tight">
                Add a service for this guest
              </h3>
              <button
                type="button"
                onClick={close}
                className="text-stone-500 hover:text-stone-900"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="flex border-b border-stone-200">
              <ModeTab
                active={mode === 'catalog'}
                onClick={() => {
                  setMode('catalog')
                  setSelected(null)
                }}
              >
                From catalog
              </ModeTab>
              <ModeTab
                active={mode === 'custom'}
                onClick={() => {
                  setMode('custom')
                  setSelected(null)
                }}
              >
                Custom request
              </ModeTab>
            </div>

            <div className="overflow-y-auto flex-1">
              {mode === 'catalog' && !selected && (
                <>
                  <div className="px-6 py-3 border-b border-stone-200 sticky top-0 bg-white">
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search services…"
                      className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                    />
                  </div>
                  {grouped.size === 0 ? (
                    <p className="px-6 py-8 text-sm font-light text-stone-500">
                      No services match.
                    </p>
                  ) : (
                    <div className="px-6 py-4 space-y-6">
                      {Array.from(grouped.entries()).map(([category, items]) => (
                        <div key={category}>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-light mb-2">
                            {CATEGORY_LABELS[category]?.en || category}
                          </p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {items.map((s) => (
                              <li key={s._id}>
                                <button
                                  type="button"
                                  onClick={() => setSelected(s)}
                                  className="w-full text-left p-3 border border-stone-200 rounded-sm hover:border-stone-800 hover:bg-stone-50 transition-colors"
                                >
                                  <p className="text-sm font-light text-stone-900">
                                    {s.name_en || s.name_es}
                                  </p>
                                  <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed line-clamp-2">
                                    {s.shortDescription_en || s.shortDescription_es}
                                  </p>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {(mode === 'custom' || (mode === 'catalog' && selected)) && (
                <div className="px-6 py-5 space-y-4">
                  {mode === 'catalog' && selected ? (
                    <div className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-sm flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-light text-stone-900">
                          {selected.name_en || selected.name_es}
                        </p>
                        <p className="text-xs text-stone-500 font-light mt-1">
                          {selected.shortDescription_en ||
                            selected.shortDescription_es}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900 whitespace-nowrap"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <Field label="Service name (free-form)">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="e.g. Personal trainer at the villa"
                        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                      />
                    </Field>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Preferred date">
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                      />
                    </Field>
                    <Field label="Time">
                      <input
                        type="text"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        placeholder="e.g. 7:30pm"
                        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Party size">
                      <input
                        type="number"
                        min={1}
                        value={partySize}
                        onChange={(e) => setPartySize(e.target.value)}
                        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                      />
                    </Field>
                    <Field label="Initial status">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                      >
                        <option value="REQUESTED">Requested</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Notes (visible to guest)">
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What the guest asked for, dietary preferences, etc."
                      className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                    />
                  </Field>
                  <Field label="Internal notes (admin-only)">
                    <textarea
                      rows={3}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Vendor, price, confirmation reference, etc."
                      className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                    />
                  </Field>

                  {error && (
                    <p className="text-xs text-red-600 font-light">{error}</p>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={submit}
                      disabled={
                        submitting ||
                        (mode === 'custom' && !customName.trim()) ||
                        (mode === 'catalog' && !selected)
                      }
                      className="px-6 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving…' : 'Add service'}
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className="px-6 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-3 text-xs uppercase tracking-[0.2em] font-light transition-colors ${
        active
          ? 'text-stone-900 border-b-2 border-stone-900 -mb-px'
          : 'text-stone-500 hover:text-stone-900'
      }`}
    >
      {children}
    </button>
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
      <span className="text-xs uppercase tracking-wider text-stone-500 font-light">
        {label}
      </span>
      {children}
    </label>
  )
}
