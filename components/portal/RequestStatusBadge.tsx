export interface StatusLabel {
  en: string
  es: string
  tone: 'neutral' | 'progress' | 'good' | 'muted'
}

/** Shared status vocabulary for service/menu/plate requests. */
export const REQUEST_STATUS_LABELS: Record<string, StatusLabel> = {
  REQUESTED: { en: 'Requested', es: 'Solicitado', tone: 'neutral' },
  IN_PROGRESS: { en: 'In progress', es: 'En proceso', tone: 'progress' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado', tone: 'good' },
  COMPLETED: { en: 'Completed', es: 'Completado', tone: 'muted' },
  DECLINED: { en: 'Declined', es: 'No disponible', tone: 'muted' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado', tone: 'muted' },
}

function toneClass(tone: StatusLabel['tone']): string {
  switch (tone) {
    case 'good':
      return 'text-status-confirmed bg-status-confirmed-bg border-status-confirmed-border'
    case 'progress':
      return 'text-status-pending bg-status-pending-bg border-status-pending-border'
    case 'muted':
      return 'text-muted-2 bg-sand/50 border-line'
    default:
      return 'text-body-strong bg-surface border-control-border'
  }
}

/**
 * The pill used to show a request's status. Shared by the concierge and
 * dining sections so every request status reads identically.
 */
export function RequestStatusBadge({
  status,
  locale,
}: {
  status: string
  locale: 'en' | 'es'
}) {
  const s = REQUEST_STATUS_LABELS[status]
  return (
    <span
      className={`inline-flex items-center text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border font-light whitespace-nowrap ${toneClass(
        s?.tone ?? 'neutral'
      )}`}
    >
      {s ? (locale === 'es' ? s.es : s.en) : status}
    </span>
  )
}
