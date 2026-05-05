'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  requestId: string
}

/**
 * Inline accept/reject controls for requests that are PENDING_REVIEW.
 * Reject reveals a small textarea so admin can give the renter context
 * (the note appears in their portal + in the rejection email).
 */
export function RequestReviewActions({ requestId }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState<'accept' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [note, setNote] = useState('')

  const handleAccept = async () => {
    setSubmitting('accept')
    setError(null)
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not accept')
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(null)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting('reject')
    setError(null)
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          note: note.trim() || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not reject')
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(null)
    }
  }

  if (showRejectForm) {
    return (
      <form onSubmit={handleReject} className="space-y-2 mt-3 max-w-md">
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason (will be emailed to the guest)"
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting === 'reject'}
            className="px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting === 'reject' ? 'Rejecting…' : 'Confirm reject'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowRejectForm(false)
              setNote('')
              setError(null)
            }}
            className="px-4 py-2 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-600 font-light">{error}</p>}
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <button
        type="button"
        onClick={handleAccept}
        disabled={submitting === 'accept'}
        className="px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting === 'accept' ? 'Accepting…' : 'Accept'}
      </button>
      <button
        type="button"
        onClick={() => setShowRejectForm(true)}
        className="px-4 py-2 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100"
      >
        Reject
      </button>
      {error && <p className="text-xs text-red-600 font-light ml-2">{error}</p>}
    </div>
  )
}
