'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { colorFor, isPending, STATUS_LABELS, type ItineraryEvent } from './ItineraryCalendar'

const DAY_MS = 86_400_000

function utcDay(iso: string) {
  const d = new Date(iso)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/**
 * The stay as a row of day cards — date on top, that day's services below.
 * Only days with something planned get a card. Multi-day services (a rental
 * car, golf carts) sit on their first day with an "until" line, so a week-long
 * rental doesn't fill a week of cards.
 */
export function ItineraryDayCards({ events, locale }: { events: ItineraryEvent[]; locale: 'en' | 'es' }) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const l = locale === 'es' ? 'es-ES' : 'en-US'
  const scroller = useRef<HTMLDivElement>(null)

  const live = events.filter((e) => e.status !== 'CANCELLED' && e.status !== 'DECLINED')
  const byDay = new Map<number, ItineraryEvent[]>()
  for (const e of live) {
    const k = utcDay(e.startISO)
    byDay.set(k, [...(byDay.get(k) ?? []), e])
  }
  const days = [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([ms, evs]) => ({
      ms,
      evs: evs.sort((a, b) => (a.sortTime || '99').localeCompare(b.sortTime || '99')),
    }))
  if (days.length === 0) return null

  const fmt = (ms: number, o: Intl.DateTimeFormatOptions) =>
    new Date(ms).toLocaleDateString(l, { ...o, timeZone: 'UTC' })
  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * (scroller.current.clientWidth * 0.8), behavior: 'smooth' })

  return (
    <div className="mb-10">
      {days.length > 1 && (
        <div className="hidden sm:flex justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={t('Previous days', 'Días anteriores')}
            className="p-2 border border-line rounded-full text-muted hover:text-ink hover:bg-sand transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={t('Next days', 'Días siguientes')}
            className="p-2 border border-line rounded-full text-muted hover:text-ink hover:bg-sand transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:thin]"
      >
        {days.map(({ ms, evs }) => (
          <article
            key={ms}
            className="snap-start shrink-0 w-[78%] sm:w-72 bg-white border border-line rounded-sm flex flex-col"
          >
            <header className="px-5 pt-5 pb-4 border-b border-line">
              <p className="eyebrow">{fmt(ms, { weekday: 'long' })}</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-4xl text-ink leading-none">{fmt(ms, { day: 'numeric' })}</span>
                <span className="text-muted font-light">{fmt(ms, { month: 'long' })}</span>
              </p>
              <p className="text-xs text-muted-2 font-light mt-2">
                {evs.length === 1 ? t('1 plan', '1 plan') : t(`${evs.length} plans`, `${evs.length} planes`)}
              </p>
            </header>
            <ul className="divide-y divide-line flex-1">
              {evs.map((e) => {
                const until = e.endISO ? utcDay(e.endISO) : null
                const status = STATUS_LABELS[e.status]
                return (
                  <li key={e.id} className="px-5 py-3.5 flex gap-3">
                    <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${colorFor(e.category).dot}`} />
                    <div className="min-w-0 flex-1">
                      {e.time && <p className="text-xs text-muted tracking-wide">{e.time}</p>}
                      <p className="text-[15px] font-light text-ink leading-snug">{e.label}</p>
                      {e.place && <p className="text-xs text-muted-2 font-light mt-0.5">{e.place}</p>}
                      {until && until > ms + DAY_MS / 2 && (
                        <p className="text-xs text-muted-2 font-light mt-0.5">
                          {t('Until', 'Hasta')} {fmt(until, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      )}
                      {isPending(e.status) && status && (
                        <p className="text-[10px] uppercase tracking-wider text-status-pending mt-1">
                          {t(status.en, status.es)}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
