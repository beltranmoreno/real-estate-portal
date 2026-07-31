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
      return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'progress':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'muted':
      return 'text-stone-500 bg-stone-50 border-stone-200'
    default:
      return 'text-stone-700 bg-white border-stone-300'
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
