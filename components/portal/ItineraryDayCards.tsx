'use client'

import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { colorFor, isPending, STATUS_LABELS, type ItineraryEvent } from './ItineraryCalendar'
import { ScrollToLink } from './ScrollToLink'

/** "YYYY-MM-DD" of an ISO day (stored at UTC midnight). */
const keyOf = (iso: string) => new Date(iso).toISOString().slice(0, 10)
const msOf = (key: string) => Date.parse(`${key}T00:00:00Z`)
const addDays = (key: string, n: number) => new Date(msOf(key) + n * 86_400_000).toISOString().slice(0, 10)

interface CardItem {
  id: string
  label: string
  time?: string | null
  place?: string | null
  category?: string | null
  status?: string
  /** Check-in / check-out. */
  marker?: boolean
  /** Multi-day service: the day it ends. */
  untilKey?: string | null
  sort: string
}

/**
 * The stay as a row of day cards — date on top, that day's plans below. It
 * also carries "what's on": while the stay is close or underway, today and
 * tomorrow always get a card (labelled, today highlighted and scrolled into
 * view), even with nothing planned. Arrival and departure days always show,
 * with the check-in / check-out time. Other days appear only when something is
 * planned. Multi-day services (a rental car) sit on their first day, and also
 * on today / tomorrow while they're running.
 */
export function ItineraryDayCards({
  events,
  locale,
  todayKey,
  checkInKey,
  checkOutKey,
  checkInTime,
  checkOutTime,
}: {
  events: ItineraryEvent[]
  locale: 'en' | 'es'
  /** Today in the Dominican Republic, "YYYY-MM-DD". */
  todayKey: string
  checkInKey: string
  checkOutKey: string
  checkInTime?: string | null
  checkOutTime?: string | null
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const l = locale === 'es' ? 'es-ES' : 'en-US'
  const scroller = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLElement>(null)

  const tomorrowKey = addDays(todayKey, 1)
  // Same window as the old "What's on": the day before arrival to check-out.
  const live = tomorrowKey >= checkInKey && todayKey <= checkOutKey
  const nowKeys = live ? [todayKey, tomorrowKey].filter((k) => k <= checkOutKey) : []

  const plans = events
    .filter((e) => e.status !== 'CANCELLED' && e.status !== 'DECLINED')
    .map((e) => ({ e, start: keyOf(e.startISO), end: e.endISO ? keyOf(e.endISO) : keyOf(e.startISO) }))

  const days = new Set<string>([checkInKey, checkOutKey, ...nowKeys, ...plans.map((p) => p.start)])
  const cards = [...days].sort().map((key) => {
    const isNow = nowKeys.includes(key)
    const items: CardItem[] = []
    if (key === checkInKey)
      items.push({ id: 'check-in', label: t('Check-in', 'Entrada'), time: checkInTime, marker: true, sort: '' })
    for (const { e, start, end } of plans) {
      if (start === key || (isNow && start < key && key <= end)) {
        items.push({
          id: e.id,
          label: e.label,
          time: e.time,
          place: e.place,
          category: e.category,
          status: e.status,
          untilKey: end > start ? end : null,
          sort: e.sortTime || '99',
        })
      }
    }
    if (key === checkOutKey)
      items.push({ id: 'check-out', label: t('Check-out', 'Salida'), time: checkOutTime, marker: true, sort: '~' })
    items.sort((a, b) => a.sort.localeCompare(b.sort))
    return { key, items }
  })

  // Open on today (or the next day with plans) instead of the first card.
  useEffect(() => {
    const el = scroller.current
    const target = todayRef.current
    // The scroller is position:relative, so offsetLeft is measured from it.
    if (el && target) el.scrollTo({ left: target.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || '0'), behavior: 'auto' })
  }, [todayKey])

  const fmt = (key: string, o: Intl.DateTimeFormatOptions) =>
    new Date(msOf(key)).toLocaleDateString(l, { ...o, timeZone: 'UTC' })
  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * (scroller.current.clientWidth * 0.8), behavior: 'smooth' })
  // The card to scroll to: today, else the first upcoming day.
  const focusKey = cards.find((c) => c.key >= todayKey)?.key

  return (
    <div className="mb-10">
      {cards.length > 1 && (
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
        className="relative flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:thin]"
      >
        {cards.map(({ key, items }) => {
          const isToday = live && key === todayKey
          const isTomorrow = live && key === tomorrowKey
          const past = key < todayKey
          const planCount = items.filter((i) => !i.marker).length
          return (
            <article
              key={key}
              ref={key === focusKey ? todayRef : undefined}
              aria-current={isToday ? 'date' : undefined}
              className={`snap-start shrink-0 w-[78%] sm:w-72 bg-white rounded-sm flex flex-col border ${
                isToday ? 'border-ink' : 'border-line'
              } ${past ? 'opacity-60' : ''}`}
            >
              <header className="px-5 pt-5 pb-4 border-b border-line">
                <p className={`eyebrow ${isToday || isTomorrow ? '!text-ink' : ''}`}>
                  {isToday
                    ? `${t('Today', 'Hoy')} · ${fmt(key, { weekday: 'long' })}`
                    : isTomorrow
                      ? `${t('Tomorrow', 'Mañana')} · ${fmt(key, { weekday: 'long' })}`
                      : fmt(key, { weekday: 'long' })}
                </p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-4xl text-ink leading-none">{fmt(key, { day: 'numeric' })}</span>
                  <span className="text-muted font-light">{fmt(key, { month: 'long' })}</span>
                </p>
                <p className="text-xs text-muted-2 font-light mt-2">
                  {planCount === 0
                    ? t('Nothing planned', 'Nada planeado')
                    : planCount === 1
                      ? t('1 plan', '1 plan')
                      : t(`${planCount} plans`, `${planCount} planes`)}
                </p>
              </header>

              <ul className="divide-y divide-line flex-1">
                {items.map((i) => {
                  const status = i.status ? STATUS_LABELS[i.status] : null
                  return (
                    <li key={i.id} className="px-5 py-3.5 flex gap-3">
                      <span
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${i.marker ? 'bg-brand' : colorFor(i.category).dot}`}
                      />
                      <div className="min-w-0 flex-1">
                        {i.time && <p className="text-xs text-muted tracking-wide">{i.time}</p>}
                        <p className={`text-[15px] font-light leading-snug ${i.marker ? 'text-brand' : 'text-ink'}`}>
                          {i.label}
                        </p>
                        {i.place && <p className="text-xs text-muted-2 font-light mt-0.5">{i.place}</p>}
                        {i.untilKey && (
                          <p className="text-xs text-muted-2 font-light mt-0.5">
                            {t('Until', 'Hasta')} {fmt(i.untilKey, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        )}
                        {i.status && isPending(i.status) && status && (
                          <p className="text-[10px] uppercase tracking-wider text-status-pending mt-1">
                            {t(status.en, status.es)}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
                {planCount === 0 && !past && (
                  <li className="px-5 py-3.5 text-sm font-light text-muted">
                    <ScrollToLink
                      targetId="concierge"
                      className="text-body-strong underline underline-offset-4 hover:text-ink"
                    >
                      {t('Arrange something', 'Organizar algo')}
                    </ScrollToLink>
                  </li>
                )}
              </ul>
            </article>
          )
        })}
      </div>
    </div>
  )
}
