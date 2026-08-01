'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react'

export interface ItineraryEvent {
  id: string
  label: string
  /** ISO of the start day (read in UTC — @db.Date is stored at midnight UTC). */
  startISO: string
  /** ISO of the inclusive end day for ranges; omit/null for single-day. */
  endISO?: string | null
  /** Villa-local time string (Dominican time), e.g. "7:30pm". Display only. */
  time?: string | null
  /** conciergeService category — drives the colour. */
  category?: string | null
  /** ServiceRequest status — REQUESTED/IN_PROGRESS render as "pending". */
  status: string
  /** Guest/admin notes on the request — shown in the day detail + list. */
  notes?: string | null
  /** Optional attached point of interest name — shown in the detail + list. */
  place?: string | null
}

const DAY_MS = 86_400_000
const MAX_LANES = 3
const HEADER_H = 22
const LANE_H = 20

const MONTH_NAMES: Record<'en' | 'es', string[]> = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  es: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
}
const WEEKDAY_NAMES: Record<'en' | 'es', string[]> = {
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  es: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
}

const CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  dining: { en: 'In-villa dining', es: 'Cocina en la villa' },
  transport: { en: 'Transport', es: 'Transporte' },
  food: { en: 'Restaurants & dining out', es: 'Restaurantes' },
  experiences: { en: 'Experiences', es: 'Experiencias' },
  home: { en: 'Home', es: 'Hogar' },
  wellness: { en: 'Wellness', es: 'Bienestar' },
  grocery: { en: 'Groceries', es: 'Compras' },
}

// Static Tailwind classes (no interpolation, so they survive purging).
const CATEGORY_COLORS: Record<string, { bar: string; dot: string }> = {
  // In-villa dining (chef menus / plates) vs eating out (restaurant
  // reservations) get distinct colours so they don't read as the same thing.
  dining: { bar: 'bg-amber-100 text-amber-900', dot: 'bg-amber-500' },
  food: { bar: 'bg-orange-100 text-orange-900', dot: 'bg-orange-500' },
  transport: { bar: 'bg-sky-100 text-sky-900', dot: 'bg-sky-500' },
  experiences: { bar: 'bg-violet-100 text-violet-900', dot: 'bg-violet-500' },
  home: { bar: 'bg-teal-100 text-teal-900', dot: 'bg-teal-500' },
  wellness: { bar: 'bg-rose-100 text-rose-900', dot: 'bg-rose-500' },
  grocery: { bar: 'bg-lime-100 text-lime-900', dot: 'bg-lime-500' },
  default: { bar: 'bg-stone-100 text-stone-800', dot: 'bg-stone-400' },
}

function colorFor(category?: string | null) {
  return CATEGORY_COLORS[category ?? 'default'] ?? CATEGORY_COLORS.default
}

function isPending(status: string) {
  return status === 'REQUESTED' || status === 'IN_PROGRESS'
}

function toUtcMidnight(iso: string): number {
  const d = new Date(iso)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function fmtDay(ms: number, locale: 'en' | 'es'): string {
  return new Date(ms).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

interface NormEvent extends ItineraryEvent {
  startMs: number
  endMs: number
}

interface PlacedEvent {
  ev: NormEvent
  colStart: number
  colEnd: number
  lane: number
  startsHere: boolean
  endsHere: boolean
}

function packWeek(weekStartMs: number, events: NormEvent[]): PlacedEvent[] {
  const weekEndMs = weekStartMs + 6 * DAY_MS
  const inWeek = events
    .filter((e) => e.endMs >= weekStartMs && e.startMs <= weekEndMs)
    .sort((a, b) =>
      a.startMs !== b.startMs
        ? a.startMs - b.startMs
        : b.endMs - b.startMs - (a.endMs - a.startMs)
    )

  const laneEnds: number[] = [] // last occupied column per lane
  const placed: PlacedEvent[] = []
  for (const ev of inWeek) {
    const colStart = Math.max(0, Math.round((ev.startMs - weekStartMs) / DAY_MS))
    const colEnd = Math.min(6, Math.round((ev.endMs - weekStartMs) / DAY_MS))
    let lane = laneEnds.findIndex((end) => end < colStart)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(colEnd)
    } else {
      laneEnds[lane] = colEnd
    }
    placed.push({
      ev,
      colStart,
      colEnd,
      lane,
      startsHere: ev.startMs >= weekStartMs,
      endsHere: ev.endMs <= weekEndMs,
    })
  }
  return placed
}

export function ItineraryCalendar({
  events,
  locale,
  checkIn,
  checkOut,
}: {
  events: ItineraryEvent[]
  locale: 'en' | 'es'
  checkIn?: string
  checkOut?: string
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  // Drop cancelled/declined — they're not happening, so they'd only clutter.
  const norm: NormEvent[] = useMemo(
    () =>
      events
        .filter((e) => e.status !== 'CANCELLED' && e.status !== 'DECLINED')
        .map((e) => {
          const startMs = toUtcMidnight(e.startISO)
          const endMs = e.endISO ? Math.max(startMs, toUtcMidnight(e.endISO)) : startMs
          return { ...e, startMs, endMs }
        }),
    [events]
  )

  const checkInMs = checkIn ? toUtcMidnight(checkIn) : null
  const checkOutMs = checkOut ? toUtcMidnight(checkOut) : null

  const initial = useMemo(() => {
    const anchor = checkIn || [...norm].sort((a, b) => a.startMs - b.startMs)[0]?.startISO
    const d = anchor ? new Date(anchor) : new Date()
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn])

  const [view, setView] = useState(initial)
  const [dayModal, setDayModal] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  const weeks = useMemo(() => {
    const firstMs = Date.UTC(view.year, view.month, 1)
    const gridStart = firstMs - new Date(firstMs).getUTCDay() * DAY_MS
    const lastMs = Date.UTC(view.year, view.month + 1, 0)
    const gridEnd = lastMs + (6 - new Date(lastMs).getUTCDay()) * DAY_MS
    const out: number[][] = []
    for (let ws = gridStart; ws <= gridEnd; ws += 7 * DAY_MS) {
      out.push(Array.from({ length: 7 }, (_, i) => ws + i * DAY_MS))
    }
    return out
  }, [view])

  const goPrev = () =>
    setView((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }
    )
  const goNext = () =>
    setView((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }
    )

  const eventsOnDay = (dayMs: number) =>
    norm
      .filter((e) => e.startMs <= dayMs && e.endMs >= dayMs)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  const categoriesPresent = Array.from(
    new Set(norm.map((e) => e.category ?? 'default'))
  )

  return (
    <div className="border border-stone-200 rounded-sm p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-sm"
          aria-label={t('Previous month', 'Mes anterior')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-light text-stone-900 tracking-wide">
          {MONTH_NAMES[locale][view.month]} {view.year}
        </p>
        <button
          type="button"
          onClick={goNext}
          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-sm"
          aria-label={t('Next month', 'Mes siguiente')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_NAMES[locale].map((w, i) => (
          <div
            key={i}
            className="text-center text-[10px] uppercase tracking-wider text-stone-400 font-light py-1"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="space-y-0">
        {weeks.map((week, wi) => {
          const placed = packWeek(week[0], norm)
          const visible = placed.filter((p) => p.lane < MAX_LANES)
          const hidden = placed.filter((p) => p.lane >= MAX_LANES)
          const cellMin = HEADER_H + (MAX_LANES + 1) * LANE_H + 4

          return (
            <div key={wi} className="relative" style={{ minHeight: cellMin }}>
              {/* Background day cells (click target) */}
              <div className="grid grid-cols-7 absolute inset-0">
                {week.map((dayMs) => {
                  const d = new Date(dayMs)
                  const inMonth = d.getUTCMonth() === view.month
                  const isCheckIn = dayMs === checkInMs
                  const isCheckOut = dayMs === checkOutMs
                  const marked = isCheckIn || isCheckOut
                  return (
                    <button
                      key={dayMs}
                      type="button"
                      onClick={() => setDayModal(dayMs)}
                      className={`flex flex-col items-stretch text-left border-t border-l border-stone-100 last:border-r [&:nth-child(7n)]:border-r px-1 pt-0.5 transition-colors ${
                        isCheckIn
                          ? 'bg-emerald-50 ring-1 ring-inset ring-emerald-400 hover:bg-emerald-100/70'
                          : isCheckOut
                            ? 'bg-stone-100 ring-1 ring-inset ring-stone-400 hover:bg-stone-200/70'
                            : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs ${
                            inMonth ? 'text-stone-700' : 'text-stone-300'
                          } ${marked ? 'text-stone-900 font-semibold' : 'font-light'}`}
                        >
                          {d.getUTCDate()}
                        </span>
                        {isCheckIn && (
                          <span className="px-1 py-px rounded-sm bg-emerald-600 text-white text-[8px] uppercase tracking-wider font-medium leading-none">
                            {t('In', 'Entra')}
                          </span>
                        )}
                        {isCheckOut && (
                          <span className="px-1 py-px rounded-sm bg-stone-500 text-white text-[8px] uppercase tracking-wider font-medium leading-none">
                            {t('Out', 'Sale')}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Event bars overlay (clicks fall through to the day cells) */}
              <div
                className="absolute left-0 right-0 grid grid-cols-7 gap-x-1 px-1 pointer-events-none"
                style={{ top: HEADER_H, gridAutoRows: `${LANE_H}px` }}
              >
                {visible.map((p) => {
                  const c = colorFor(p.ev.category)
                  const pending = isPending(p.ev.status)
                  return (
                    <div
                      key={p.ev.id}
                      title={p.ev.label}
                      style={{
                        gridColumn: `${p.colStart + 1} / ${p.colEnd + 2}`,
                        gridRow: p.lane + 1,
                      }}
                      className={`h-[16px] leading-[15px] px-1.5 text-[10px] truncate ${
                        p.startsHere ? 'rounded-l-sm' : ''
                      } ${p.endsHere ? 'rounded-r-sm' : ''} ${c.bar} ${
                        pending ? 'border border-dashed border-stone-400/70 opacity-80' : ''
                      }`}
                    >
                      {p.ev.time ? `${p.ev.time} · ` : ''}
                      {p.ev.label}
                    </div>
                  )
                })}

                {/* +N more per overflowed day */}
                {week.map((dayMs, di) => {
                  const count = hidden.filter(
                    (p) => week[p.colStart] <= dayMs && week[p.colEnd] >= dayMs
                  ).length
                  if (count === 0) return null
                  return (
                    <div
                      key={`more-${dayMs}`}
                      style={{ gridColumn: `${di + 1} / ${di + 2}`, gridRow: MAX_LANES + 1 }}
                      className="text-[9px] text-stone-500 px-1"
                    >
                      +{count}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      {(categoriesPresent.length > 0 || checkInMs) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10px] text-stone-500 font-light">
          {categoriesPresent.map((cat) => {
            const label = CATEGORY_LABELS[cat]
            return (
              <span key={cat} className="inline-flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${colorFor(cat).dot}`} />
                {label ? t(label.en, label.es) : cat}
              </span>
            )
          })}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border border-dashed border-stone-400 inline-block" />
            {t('Pending', 'Pendiente')}
          </span>
          {checkInMs && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              {t('Check-in', 'Entrada')}
            </span>
          )}
          {checkOutMs && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-stone-400 inline-block" />
              {t('Check-out', 'Salida')}
            </span>
          )}
        </div>
      )}

      {/* Full list of events below the calendar — collapsed by default */}
      {norm.length > 0 && (
        <div className="mt-5 pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={() => setShowAll((o) => !o)}
            aria-expanded={showAll}
            className="w-full flex items-center justify-between gap-2 group"
          >
            <span className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light group-hover:text-stone-800 transition-colors">
              {t('All events', 'Todos los eventos')} ({norm.length})
            </span>
            <ChevronDown
              className={`w-4 h-4 text-stone-400 transition-transform ${showAll ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {showAll && (
              <motion.div
                key="all-events"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <ul className="divide-y divide-stone-100 mt-2">
            {[...norm]
              .sort((a, b) =>
                a.startMs !== b.startMs
                  ? a.startMs - b.startMs
                  : (a.time || '').localeCompare(b.time || '')
              )
              .map((e) => {
                const status = STATUS_LABELS[e.status]
                const isRange = e.endMs > e.startMs
                const dateStr = isRange
                  ? `${fmtDay(e.startMs, locale)} – ${fmtDay(e.endMs, locale)}`
                  : fmtDay(e.startMs, locale)
                return (
                  <li key={e.id} className="py-2.5 flex items-start gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${colorFor(e.category).dot}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-light text-stone-900">{e.label}</p>
                      <p className="text-xs text-stone-500 font-light mt-0.5">
                        {[dateStr, e.time].filter(Boolean).join(' · ')}
                      </p>
                      {e.place && (
                        <p className="text-xs text-stone-500 font-light mt-0.5">
                          📍 {e.place}
                        </p>
                      )}
                      {e.notes && (
                        <p className="text-xs text-stone-500 font-light mt-1 whitespace-pre-wrap leading-relaxed">
                          {e.notes}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider whitespace-nowrap mt-0.5 ${
                        isPending(e.status) ? 'text-amber-600' : 'text-stone-500'
                      }`}
                    >
                      {status ? t(status.en, status.es) : e.status}
                    </span>
                  </li>
                )
              })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {dayModal !== null && (
        <DayModal
          dayMs={dayModal}
          events={eventsOnDay(dayModal)}
          locale={locale}
          onClose={() => setDayModal(null)}
        />
      )}
    </div>
  )
}

const STATUS_LABELS: Record<string, { en: string; es: string }> = {
  REQUESTED: { en: 'Pending', es: 'Pendiente' },
  IN_PROGRESS: { en: 'In progress', es: 'En curso' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  COMPLETED: { en: 'Completed', es: 'Completado' },
}

function DayModal({
  dayMs,
  events,
  locale,
  onClose,
}: {
  dayMs: number
  events: NormEvent[]
  locale: 'en' | 'es'
  onClose: () => void
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const title = new Date(dayMs).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-md min-h-[320px] max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h3 className="text-base font-light text-stone-900 tracking-tight capitalize">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {events.length === 0 ? (
            <p className="text-sm text-stone-500 font-light">
              {t('Nothing scheduled for this day.', 'Nada programado para este día.')}
            </p>
          ) : (
            <ul className="space-y-3">
              {events.map((e) => {
                const status = STATUS_LABELS[e.status]
                const isRange = e.endMs > e.startMs
                return (
                  <li key={e.id} className="flex items-start gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${colorFor(e.category).dot}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-light text-stone-900">{e.label}</p>
                      <p className="text-xs text-stone-500 font-light mt-0.5">
                        {[
                          e.time,
                          isRange ? t('multi-day', 'varios días') : null,
                          status ? t(status.en, status.es) : e.status,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {e.place && (
                        <p className="text-xs text-stone-500 font-light mt-0.5">
                          📍 {e.place}
                        </p>
                      )}
                      {e.notes && (
                        <p className="text-xs text-stone-600 font-light mt-1 whitespace-pre-wrap leading-relaxed">
                          {e.notes}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
