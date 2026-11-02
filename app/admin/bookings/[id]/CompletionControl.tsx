'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tFor } from '@/lib/i18n'
import { CheckCircle2, Mail, MessageSquareText } from 'lucide-react'

interface Props {
  bookingId: string
  /** ISO string of completedAt, or null if not completed. */
  completedAt: string | null
  /** Whether the guest has submitted feedback yet. */
  hasFeedback: boolean
  /** ISO string of when the thank-you email went out, or null. */
  feedbackEmailSentAt: string | null
  /** Whether the guest has an email address to send it to. */
  canEmail: boolean
  locale?: 'en' | 'es'
}

/**
 * Admin control to mark a stay completed (or reopen it). Completing unlocks
 * the guest's private feedback page. Once completed, the thank-you email
 * (with the link to the feedback form) can be sent from here; otherwise the
 * daily cron sends it the day after checkout.
 */
export function CompletionControl({
  bookingId,
  completedAt,
  hasFeedback,
  feedbackEmailSentAt,
  canEmail,
  locale = 'en',
}: Props) {
  const t = tFor(locale)
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const completed = !!completedAt

  const sendThankYou = async () => {
    const again = !!feedbackEmailSentAt
    const question = again
      ? t('The thank-you email was already sent. Send it again?', 'El correo de agradecimiento ya se envió. ¿Enviarlo de nuevo?')
      : t('Send the guest the thank-you email with the link to leave feedback?', '¿Enviar al huésped el correo de agradecimiento con el enlace para dejar comentarios?')
    if (!window.confirm(question)) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/feedback-email`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error)
      router.refresh()
    } catch (err) {
      setError((err as Error).message || t('Could not send the email', 'No se pudo enviar el correo'))
    } finally {
      setSending(false)
    }
  }

  const toggle = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setError(t('Could not update', 'No se pudo actualizar'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border border-stone-200 rounded-sm p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            {t('Booking completed', 'Reserva completada')}
          </p>
          <p className="mt-1 text-sm font-light text-stone-700">
            {completed
              ? t('Feedback page is open to the guest.', 'La página de comentarios está abierta para el huésped.')
              : t('Turn on to open the feedback page (auto on the day after checkout).', 'Actívalo para abrir la página de comentarios (automático el día después del checkout).')}
          </p>
          {completed && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-light text-stone-500">
              <MessageSquareText className="w-3.5 h-3.5" />
              {hasFeedback
                ? t('Guest has left feedback.', 'El huésped dejó comentarios.')
                : t('No feedback yet.', 'Aún sin comentarios.')}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={`shrink-0 inline-flex items-center gap-2 px-4 h-9 rounded-sm text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${
            completed
              ? 'border border-stone-300 text-stone-700 hover:bg-stone-100'
              : 'bg-stone-800 text-white hover:bg-stone-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {completed ? t('Reopen', 'Reabrir') : t('Mark completed', 'Marcar completada')}
        </button>
      </div>
      {completed && (
        <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
              {t('Thank-you email', 'Correo de agradecimiento')}
            </p>
            <p className="mt-1 text-sm font-light text-stone-700">
              {feedbackEmailSentAt
                ? t('Sent on', 'Enviado el') +
                  ' ' +
                  new Date(feedbackEmailSentAt).toLocaleDateString(locale === 'es' ? 'es-DO' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : canEmail
                  ? t('Thanks the guest and links to the feedback form.', 'Agradece al huésped y enlaza al formulario de comentarios.')
                  : t('The guest has no email address.', 'El huésped no tiene correo electrónico.')}
            </p>
          </div>
          <button
            type="button"
            onClick={sendThankYou}
            disabled={sending || !canEmail}
            className="shrink-0 inline-flex items-center gap-2 px-4 h-9 rounded-sm text-xs uppercase tracking-[0.12em] border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            {sending
              ? t('Sending…', 'Enviando…')
              : feedbackEmailSentAt
                ? t('Send again', 'Enviar de nuevo')
                : t('Send', 'Enviar')}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
