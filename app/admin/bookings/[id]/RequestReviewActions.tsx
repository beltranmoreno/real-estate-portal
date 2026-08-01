'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'

interface Props {
  requestId: string
  locale?: 'en' | 'es'
}

/**
 * Inline accept/reject controls for requests that are PENDING_REVIEW.
 * Reject reveals a small textarea so admin can give the renter context
 * (the note appears in their portal + in the rejection email).
 */
export function RequestReviewActions({ requestId, locale = 'en' }: Props) {
  const router = useRouter()
  const t = tFor(locale)
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
        throw new Error(err?.error || t('Could not accept', 'No se pudo aceptar'))
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
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
        throw new Error(err?.error || t('Could not reject', 'No se pudo rechazar'))
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
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
          placeholder={t('Reason (will be emailed to the guest)', 'Motivo (se enviará por correo al huésped)')}
          className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting === 'reject'}
            className="px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting === 'reject' ? t('Rejecting…', 'Rechazando…') : t('Confirm reject', 'Confirmar rechazo')}
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
            {t('Cancel', 'Cancelar')}
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
        {submitting === 'accept' ? t('Accepting…', 'Aceptando…') : t('Accept', 'Aceptar')}
      </button>
      <button
        type="button"
        onClick={() => setShowRejectForm(true)}
        className="px-4 py-2 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100"
      >
        {t('Reject', 'Rechazar')}
      </button>
      {error && <p className="text-xs text-red-600 font-light ml-2">{error}</p>}
    </div>
  )
}
