'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, MoreHorizontal } from 'lucide-react'
import { DocumentLink } from '@/components/portal/DocumentLink'
import { ReceiptUploadButton } from './ReceiptUploadButton'
import type { RestaurantOption } from '@/lib/portal/restaurants.types'
import type { AttractionOption } from '@/lib/portal/attractions.types'

interface HistoryEntry {
  label: string
  actor: string
  at: string
}
interface DocItem {
  id: string
  filename: string
  label: string | null
  kind: string
  uploadedAtLabel: string
}

export interface ServiceRequestForActions {
  id: string
  serviceName: string
  kind: string
  status: string
  venueName: string | null
  attractionSanityId: string | null
  attractionName: string | null
  preferredDate: string | null // ISO
  endDate: string | null // ISO
  preferredTime: string | null // HH:mm
  partySize: number | null
  notes: string | null
  internalNotes: string | null
  requestedByName: string
  createdAtLabel: string
}

interface Props {
  bookingId: string
  request: ServiceRequestForActions
  restaurants: RestaurantOption[]
  attractions: AttractionOption[]
  statusHistory: HistoryEntry[]
  notifyHistory: { actor: string; at: string }[]
  documents: DocItem[]
}

const isoToDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '')

/**
 * "More actions" — opens the full service request in a modal: its activity
 * (request time, status changes, notifications), editable details, and
 * documents. Keeps the request card itself clean.
 */
export function ServiceRequestActionsButton(props: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-stone-700 hover:text-stone-900 underline underline-offset-4"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
        More actions
      </button>
      {open && <ActionsModal {...props} onClose={() => setOpen(false)} />}
    </>
  )
}

function ActionsModal({
  bookingId,
  request,
  restaurants,
  attractions,
  statusHistory,
  notifyHistory,
  documents,
  onClose,
}: Props & { onClose: () => void }) {
  const router = useRouter()

  const matchingRestaurant = useMemo(
    () =>
      request.venueName
        ? restaurants.find((r) => (r.name_en || r.name_es) === request.venueName)
        : undefined,
    [restaurants, request.venueName]
  )

  const [venueSelect, setVenueSelect] = useState<string>(
    request.venueName
      ? matchingRestaurant
        ? matchingRestaurant.name_en || matchingRestaurant.name_es || ''
        : '__other__'
      : ''
  )
  const [venueText, setVenueText] = useState(
    matchingRestaurant ? '' : request.venueName ?? ''
  )
  const [attractionId, setAttractionId] = useState(request.attractionSanityId ?? '')
  const [preferredDate, setPreferredDate] = useState(isoToDateInput(request.preferredDate))
  const [endDate, setEndDate] = useState(isoToDateInput(request.endDate))
  const [preferredTime, setPreferredTime] = useState(request.preferredTime ?? '')
  const [partySize, setPartySize] = useState(
    request.partySize != null ? String(request.partySize) : ''
  )
  const [notes, setNotes] = useState(request.notes ?? '')
  const [internalNotes, setInternalNotes] = useState(request.internalNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  const venueOther = venueSelect === '__other__'

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const venueName = venueOther ? venueText.trim() || null : venueSelect || null
      const res = await fetch(`/api/admin/service-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueName,
          attractionSanityId: attractionId || null,
          attractionName:
            attractions.find((a) => a.id === attractionId)?.name_en || null,
          preferredDate: preferredDate || null,
          endDate: endDate || null,
          preferredTime: preferredTime || null,
          partySize: partySize || null,
          notes: notes || null,
          internalNotes: internalNotes || null,
        }),
      })
      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p?.error || 'Could not save')
      }
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="min-w-0">
            <h3 className="text-lg font-light text-stone-900 tracking-tight truncate">
              {request.serviceName}
              {request.venueName && (
                <span className="text-stone-500"> · {request.venueName}</span>
              )}
            </h3>
            <p className="text-xs text-stone-500 font-light">
              {request.kind.toLowerCase()} · {request.status.toLowerCase().replace('_', ' ')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* Activity */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-2">
              Activity
            </p>
            <ul className="space-y-1.5">
              <ActivityRow
                label="Requested"
                by={request.requestedByName}
                at={request.createdAtLabel}
              />
              {statusHistory.map((h, i) => (
                <ActivityRow key={i} label={h.label} by={h.actor} at={h.at} />
              ))}
              {notifyHistory.length > 0 ? (
                notifyHistory.map((n, i) => (
                  <ActivityRow key={`n-${i}`} label="Guest notified" by={n.actor} at={n.at} />
                ))
              ) : (
                <li className="text-xs text-stone-400 font-light">Guest not notified yet</li>
              )}
            </ul>
          </div>

          {/* Documents */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light">
                Documents
              </p>
              <ReceiptUploadButton
                bookingId={bookingId}
                serviceRequestId={request.id}
                kind={request.kind === 'GROCERY' ? 'RECEIPT' : 'OTHER'}
                label={request.kind === 'GROCERY' ? 'Upload receipt' : 'Attach document'}
              />
            </div>
            {documents.length === 0 ? (
              <p className="text-xs text-stone-400 font-light">Nothing attached yet.</p>
            ) : (
              <ul className="space-y-1">
                {documents.map((d) => (
                  <li key={d.id} className="text-sm font-light">
                    <DocumentLink documentId={d.id} scope="admin" filename={d.filename}>
                      {d.label || d.filename}
                    </DocumentLink>
                    <span className="text-[11px] text-stone-400 ml-2">
                      {d.kind.toLowerCase()} · {d.uploadedAtLabel}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Editable details */}
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light">
              Details
            </p>

            <Field label="Location / place">
              <select
                value={venueSelect}
                onChange={(e) => setVenueSelect(e.target.value)}
                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
              >
                <option value="">None</option>
                {restaurants.map((r) => {
                  const v = r.name_en || r.name_es || ''
                  return (
                    <option key={r.id} value={v}>
                      {r.name_en || r.name_es}
                    </option>
                  )
                })}
                <option value="__other__">Other…</option>
              </select>
            </Field>
            {venueOther && (
              <Field label="Place / venue name">
                <input
                  type="text"
                  value={venueText}
                  onChange={(e) => setVenueText(e.target.value)}
                  placeholder="e.g. La Casita, private villa terrace"
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </Field>
            )}

            {attractions.length > 0 && (
              <Field label="Point of interest (optional)">
                <select
                  value={attractionId}
                  onChange={(e) => setAttractionId(e.target.value)}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800 bg-white"
                >
                  <option value="">None</option>
                  {attractions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name_en || a.name_es}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date">
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </Field>
              <Field label="End date (multi-day)">
                <input
                  type="date"
                  value={endDate}
                  min={preferredDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Time">
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </Field>
              <Field label="Party size">
                <input
                  type="number"
                  min={1}
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </Field>
            </div>

            <Field label="Notes (visible to guest)">
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
            </Field>
            <Field label="Internal notes (admin-only)">
              <textarea
                rows={3}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
            </Field>

            {error && <p className="text-xs text-red-600 font-light">{error}</p>}
          </div>
        </div>

        <div className="border-t border-stone-200 px-6 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-6 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="text-xs text-emerald-700 font-light">Saved ✓</span>}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-6 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ label, by, at }: { label: string; by: string; at: string }) {
  return (
    <li className="text-xs text-stone-600 font-light flex items-baseline justify-between gap-3">
      <span>
        <span className="text-stone-800">{label}</span> by {by}
      </span>
      <span className="text-stone-400 whitespace-nowrap">{at}</span>
    </li>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-wider text-stone-500 font-light">
        {label}
      </span>
      {children}
    </label>
  )
}
