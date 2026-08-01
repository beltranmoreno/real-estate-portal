'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Mail, Check } from 'lucide-react'
import type { ServiceRequestStatus } from '@prisma/client'
import { tFor } from '@/lib/i18n'

interface Props {
  serviceRequestId: string
  initialStatus: ServiceRequestStatus
  locale?: 'en' | 'es'
}

const OPTIONS: Array<{ value: ServiceRequestStatus; en: string; es: string }> = [
  { value: 'REQUESTED', en: 'Requested', es: 'Solicitado' },
  { value: 'IN_PROGRESS', en: 'In progress', es: 'En proceso' },
  { value: 'CONFIRMED', en: 'Confirmed', es: 'Confirmado' },
  { value: 'COMPLETED', en: 'Completed', es: 'Completado' },
  { value: 'DECLINED', en: 'Declined', es: 'Rechazado' },
  { value: 'CANCELLED', en: 'Cancelled', es: 'Cancelado' },
]

export function ServiceRequestStatusControl({
  serviceRequestId,
  initialStatus,
  locale = 'en',
}: Props) {
  const router = useRouter()
  const t = tFor(locale)
  const [status, setStatus] = useState<ServiceRequestStatus>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notifying, setNotifying] = useState(false)
  const [notified, setNotified] = useState(false)
  const [notifyError, setNotifyError] = useState<string | null>(null)

  const notifyGuest = async () => {
    setNotifying(true)
    setNotifyError(null)
    try {
      const res = await fetch(
        `/api/admin/service-requests/${serviceRequestId}/notify`,
        { method: 'POST' }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not send', 'No se pudo enviar'))
      }
      setNotified(true)
      router.refresh()
    } catch (err: any) {
      setNotifyError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setNotifying(false)
    }
  }

  const onChange = async (next: ServiceRequestStatus) => {
    if (next === status) return
    const prev = status
    setStatus(next)
    setNotified(false)
    setNotifyError(null)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/service-requests/${serviceRequestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || t('Could not update', 'No se pudo actualizar'))
      }
      router.refresh()
    } catch (err: any) {
      setStatus(prev)
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <div className="relative inline-block">
          <select
            value={status}
            onChange={(e) => onChange(e.target.value as ServiceRequestStatus)}
            disabled={saving}
            className="appearance-none bg-white rounded-sm border border-stone-300 pl-3 pr-7 py-1 text-xs font-light tracking-wide focus:outline-none focus:ring-2 focus:ring-stone-800 disabled:opacity-60"
          >
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.en, o.es)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-500" />
        </div>
        {saving && (
          <span className="text-xs text-stone-400 font-light">{t('saving…', 'guardando…')}</span>
        )}
        {error && <span className="text-xs text-red-600 font-light">{error}</span>}
      </div>

      {/* Notify the guest once the request is confirmed. */}
      {status === 'CONFIRMED' && !saving && (
        <div className="flex items-center gap-2">
          {notified ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-light">
              <Check className="w-3 h-3" /> {t('Guest notified', 'Huésped notificado')}
            </span>
          ) : (
            <button
              type="button"
              onClick={notifyGuest}
              disabled={notifying}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-stone-700 hover:text-stone-900 underline underline-offset-4 disabled:opacity-60"
            >
              <Mail className="w-3 h-3" />
              {notifying ? t('Sending…', 'Enviando…') : t('Notify guest', 'Notificar al huésped')}
            </button>
          )}
          {notifyError && (
            <span className="text-[11px] text-red-600 font-light">{notifyError}</span>
          )}
        </div>
      )}
    </div>
  )
}
