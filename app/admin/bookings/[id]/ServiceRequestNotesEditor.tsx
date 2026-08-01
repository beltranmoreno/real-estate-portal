'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  serviceRequestId: string
  initialValue: string
}

/**
 * Inline internal-notes editor for a single concierge service request.
 * Admin-only working notes (vendor, price, confirmation ref). Persists via
 * PATCH /api/admin/service-requests/[id]. Collapsed to a link until edited.
 */
export function ServiceRequestNotesEditor({ serviceRequestId, initialValue }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const [savedValue, setSavedValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (value === savedValue) {
      setEditing(false)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/service-requests/${serviceRequestId}`, {
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
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="mt-2">
        {savedValue && (
          <p className="text-xs text-amber-700 font-light mt-2 whitespace-pre-wrap leading-relaxed bg-amber-50 border border-amber-200 px-3 py-2 rounded-sm mb-2">
            <span className="uppercase tracking-wider text-[10px] mr-1">Internal:</span>
            {savedValue}
          </p>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[11px] uppercase tracking-[0.15em] text-stone-500 hover:text-stone-900 underline underline-offset-4"
        >
          {savedValue ? 'Edit internal note' : '+ Add internal note'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2 mt-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        autoFocus
        placeholder="Vendor, price, confirmation reference, etc. (staff only)"
        className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-1.5 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
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
        {error && <span className="text-xs text-red-600 font-light">{error}</span>}
      </div>
    </div>
  )
}
