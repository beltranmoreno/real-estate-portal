'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'

interface Props {
  bookingId: string
  hasInvitation: boolean
  invitationSent: boolean
  locale?: 'en' | 'es'
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
  locale = 'en',
}: Props) {
  const router = useRouter()
  const t = tFor(locale)
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
        throw new Error(payload?.error || t('Action failed', 'La acción falló'))
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setBusy(null)
    }
  }

  const primaryLabel = invitationSent
    ? t('Resend invitation', 'Reenviar invitación')
    : t('Send invitation', 'Enviar invitación')

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => run('send')}
        disabled={busy !== null}
        className="px-4 py-2 bg-stone-800 text-white text-xs font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 transition-colors"
      >
        {busy === 'send' ? t('Sending…', 'Enviando…') : primaryLabel}
      </button>

      {!hasInvitation && (
        <button
          type="button"
          onClick={() => run('prepare')}
          disabled={busy !== null}
          className="px-4 py-2 border border-stone-300 text-stone-800 text-xs font-light tracking-wide rounded-sm hover:bg-stone-100 disabled:opacity-60 transition-colors"
        >
          {busy === 'prepare'
            ? t('Creating…', 'Creando…')
            : t('Create invitation (don’t send)', 'Crear invitación (no enviar)')}
        </button>
      )}

      {error && <span className="text-xs text-red-600 font-light">{error}</span>}
    </div>
  )
}
