'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  hasInvitation: boolean
  invitationSent: boolean
}

/**
 * Admin actions for a booking's invitation, shown on the detail page.
 * Adapts to state: create (draft) → prepare/send; prepared → send;
 * already sent → resend.
 */
export function InvitationActions({
  bookingId,
  hasInvitation,
  invitationSent,
}: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<'prepare' | 'send' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (action: 'prepare' | 'send') => {
    setBusy(action)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/invitation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.error || 'Action failed')
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setBusy(null)
    }
  }

  const primaryLabel = invitationSent ? 'Resend invitation' : 'Send invitation'

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => run('send')}
        disabled={busy !== null}
        className="px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 transition-colors"
      >
        {busy === 'send' ? 'Sending…' : primaryLabel}
      </button>

      {!hasInvitation && (
        <button
          type="button"
          onClick={() => run('prepare')}
          disabled={busy !== null}
          className="px-4 py-2 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100 disabled:opacity-60 transition-colors"
        >
          {busy === 'prepare' ? 'Creating…' : 'Create invitation (don’t send)'}
        </button>
      )}

      {error && <span className="text-xs text-red-600 font-light">{error}</span>}
    </div>
  )
}
