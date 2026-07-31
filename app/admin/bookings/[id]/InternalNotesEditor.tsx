'use client'

import { useState } from 'react'

interface Props {
  bookingId: string
  initialValue: string
}

/**
 * Inline editor for booking-level internal notes. Visible to ADMIN/AGENT/STAFF
 * roles, never to renters. Persists to the booking via PATCH /api/admin/bookings/[id].
 *
 * Edit/view toggle keeps the page calm when there's nothing to do.
 */
export function InternalNotesEditor({ bookingId, initialValue }: Props) {
  const [value, setValue] = useState(initialValue)
  const [savedValue, setSavedValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = value !== savedValue

  const save = async () => {
    if (!dirty) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: value || null }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not save notes')
      }
      setSavedValue(value)
      setEditing(false)
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div>
        {savedValue ? (
          <p className="text-sm text-stone-700 font-light whitespace-pre-wrap leading-relaxed mb-3">
            {savedValue}
          </p>
        ) : (
          <p className="text-sm text-stone-400 font-light italic mb-3">
            No internal notes. Visible to staff only — never shown to the renter.
          </p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 underline underline-offset-4"
        >
          {savedValue ? 'Edit notes' : '+ Add notes'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        autoFocus
        placeholder="e.g. Wired deposit on May 1. Family of 6 with infant. Confirmed airport transfer for 14:30."
        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-1.5 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setValue(savedValue)
            setEditing(false)
            setError(null)
          }}
          className="px-4 py-1.5 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-600 font-light">{error}</p>}
    </div>
  )
}
