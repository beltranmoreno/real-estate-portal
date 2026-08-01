'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface DiningCalendarEvent {
  id: string
  label: string
  /** ISO string; the day is read in UTC (dates are stored at midnight UTC). */
  dateISO: string
  /** ServiceRequest status — shown as a chip in the day detail. */
  status?: string
  partySize?: number | null
  /** For à-la-carte plate requests: the individual dish names. */
  items?: string[]
}

const DAY_STATUS_LABELS: Record<string, { en: string; es: string }> = {
  REQUESTED: { en: 'Requested', es: 'Solicitado' },
  IN_PROGRESS: { en: 'In progress', es: 'En proceso' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado' },
  COMPLETED: { en: 'Completed', es: 'Completado' },
  DECLINED: { en: 'Declined', es: 'Rechazado' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado' },
}

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

/** UTC y-m-d key — preferredDate & stay dates are stored at midnight UTC,
 *  so compare in UTC to avoid a timezone day-shift. */
export function utcKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
}

/**
 * Month calendar that plots dining events on their day and marks the stay's
 * check-in / check-out. Shared by the guest portal and the admin booking
 * page. Defaults to the check-in month (falls back to the earliest event,
 * then today).
 */
export function DiningCalendar({
  events,
  locale,
  checkIn,
  checkOut,
  undatedCount = 0,
}: {
  events: DiningCalendarEvent[]
  locale: 'en' | 'es'
  checkIn?: string
  checkOut?: string
  undatedCount?: number
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const byDay = useMemo(() => {
    const map = new Map<string, DiningCalendarEvent[]>()
    for (const e of events) {
      const key = utcKey(e.dateISO)
      const arr = map.get(key) ?? []
      arr.push(e)
      map.set(key, arr)
    }
    return map
  }, [events])

  const checkInKey = checkIn ? utcKey(checkIn) : null
  const checkOutKey = checkOut ? utcKey(checkOut) : null

  const initialMonth = useMemo(() => {
    const anchor =
      checkIn ||
      events.map((e) => e.dateISO).sort()[0] ||
      new Date().toISOString()
    const d = new Date(anchor)
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn])

  const [view, setView] = useState(initialMonth)
  const [dayModal, setDayModal] = useState<number | null>(null)

  const itemsForMs = (ms: number) => {
    const d = new Date(ms)
    return byDay.get(`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`) ?? []
  }

  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate()
  const startWeekday = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay()

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const goPrev = () =>
    setView((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }
    )
  const goNext = () =>
    setView((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }
    )

  return (
    <div className="border border-stone-200 rounded-sm p-4">
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

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_NAMES[locale].map((w, i) => (
          <div
            key={i}
            className="text-center text-[10px] uppercase tracking-wider text-stone-400 font-light py-1"
          >
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`b-${i}`} />
          const key = `${view.year}-${view.month}-${day}`
          const dayMs = Date.UTC(view.year, view.month, day)
          const items = byDay.get(key) ?? []
          const isCheckIn = key === checkInKey
          const isCheckOut = key === checkOutKey
          const clickable = items.length > 0
          const cellClass = `min-h-[64px] rounded-sm border p-1 text-left w-full ${
            isCheckIn || isCheckOut ? 'border-stone-800 bg-stone-50' : 'border-stone-100'
          } ${clickable ? 'hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors cursor-pointer' : ''}`

          const inner = (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-light text-stone-700">{day}</span>
                {(isCheckIn || isCheckOut) && (
                  <span className="text-[8px] uppercase tracking-wider text-stone-800 font-medium">
                    {isCheckIn ? t('In', 'Entra') : t('Out', 'Sale')}
                  </span>
                )}
              </div>
              <div className="mt-0.5 space-y-0.5">
                {items.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    title={e.label}
                    className="text-[9px] leading-tight px-1 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 truncate"
                  >
                    {e.label}
                  </div>
                ))}
                {items.length > 2 && (
                  <div className="text-[9px] text-stone-500 px-1">+{items.length - 2}</div>
                )}
              </div>
            </>
          )

          return clickable ? (
            <button
              key={key}
              type="button"
              onClick={() => setDayModal(dayMs)}
              className={cellClass}
            >
              {inner}
            </button>
          ) : (
            <div key={key} className={cellClass}>
              {inner}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10px] text-stone-500 font-light">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-200 inline-block" />
          {t('Dining request', 'Solicitud de comida')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-stone-800 bg-stone-50 inline-block" />
          {t('Check-in / out', 'Entrada / salida')}
        </span>
      </div>

      {undatedCount > 0 && (
        <p className="text-[11px] text-stone-400 font-light mt-2">
          {t(
            `${undatedCount} request${undatedCount === 1 ? '' : 's'} without a chosen day`,
            `${undatedCount} solicitud${undatedCount === 1 ? '' : 'es'} sin día elegido`
          )}
        </p>
      )}

      {dayModal !== null && (
        <DiningDayModal
          dayMs={dayModal}
          items={itemsForMs(dayModal)}
          locale={locale}
          onClose={() => setDayModal(null)}
        />
      )}
    </div>
  )
}

function DiningDayModal({
  dayMs,
  items,
  locale,
  onClose,
}: {
  dayMs: number
  items: DiningCalendarEvent[]
  locale: 'en' | 'es'
  onClose: () => void
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const title = new Date(dayMs).toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-US',
    { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }
  )

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-sm min-h-[240px] max-h-[80vh] overflow-hidden flex flex-col"
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
            aria-label={t('Close', 'Cerrar')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {items.length === 0 ? (
            <p className="text-sm text-stone-500 font-light">
              {t('No dining requests for this day.', 'No hay solicitudes de comida para este día.')}
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((e) => {
                const status = e.status ? DAY_STATUS_LABELS[e.status] : null
                const meta = [
                  e.partySize
                    ? t(`${e.partySize} guests`, `${e.partySize} personas`)
                    : null,
                  status ? t(status.en, status.es) : e.status,
                ]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <li key={e.id} className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-light text-stone-900">{e.label}</p>
                      {meta && (
                        <p className="text-xs text-stone-500 font-light mt-0.5">{meta}</p>
                      )}
                      {e.items && e.items.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {e.items.map((it, i) => (
                            <li
                              key={i}
                              className="text-xs text-stone-600 font-light flex items-center gap-1.5"
                            >
                              <span className="text-stone-300">·</span>
                              {it}
                            </li>
                          ))}
                        </ul>
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
