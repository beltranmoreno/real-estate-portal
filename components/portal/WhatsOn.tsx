import { RequestStatusBadge } from '@/components/portal/RequestStatusBadge'
import { ScrollToLink } from '@/components/portal/ScrollToLink'

export interface WhatsOnItem {
  id: string
  label: string
  /** Display time ("7:30 PM"); empty for all-day / untimed items. */
  time?: string
  place?: string | null
  /** Request status; omitted for stay markers like check-in. */
  status?: string
  /** Stay markers (check-in / check-out) get the accent treatment. */
  marker?: boolean
}

export interface WhatsOnDay {
  key: string
  /** "Today" / "Tomorrow" */
  label: string
  /** "Friday, May 21" */
  dateLabel: string
  items: WhatsOnItem[]
}

/**
 * "What's on" — today and tomorrow at a glance, as two simple lists. Timed
 * items are listed in time order after any all-day items; an empty day nudges
 * the guest toward the concierge section.
 */
export function WhatsOn({
  days,
  locale,
}: {
  days: WhatsOnDay[]
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
      {days.map((day) => (
        <div key={day.key}>
          <div className="flex items-baseline justify-between gap-3 border-b border-ink pb-2">
            <h3 className="font-title text-xl text-ink">{day.label}</h3>
            <span className="text-xs uppercase tracking-[0.14em] text-muted-2">{day.dateLabel}</span>
          </div>

          {day.items.length === 0 ? (
            <p className="py-4 text-sm font-light text-muted border-b border-line">
              {t('Nothing planned.', 'Nada planeado.')}{' '}
              <ScrollToLink
                targetId="concierge"
                className="text-body-strong underline underline-offset-4 hover:text-ink"
              >
                {t('Arrange something', 'Organizar algo')}
              </ScrollToLink>
            </p>
          ) : (
            <ul>
              {day.items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 py-3.5 border-b border-line"
                >
                  <span className="text-xs tabular-nums text-muted-2 uppercase tracking-wider">
                    {item.time || t('All day', 'Todo el día')}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-[15px] font-light ${
                        item.marker ? 'text-brand' : 'text-ink'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.place && (
                      <span className="block text-xs text-muted-2 font-light mt-0.5">{item.place}</span>
                    )}
                  </span>
                  {item.status ? (
                    <RequestStatusBadge status={item.status} locale={locale} />
                  ) : (
                    <span />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
