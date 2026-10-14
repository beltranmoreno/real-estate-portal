'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ConciergeBell, X, ShoppingBag } from 'lucide-react'
import type { ServiceRequest } from '@prisma/client'
import {
  CATEGORY_LABELS,
  type ConciergeServiceOption,
} from '@/lib/portal/conciergeServices.types'
import type {
  GroceryItemOption,
  GroceryLineItem,
} from '@/lib/portal/groceryItems.types'
import type { RestaurantOption } from '@/lib/portal/restaurants.types'
import { GroceryRequestModal } from './GroceryRequestModal'
import { DocumentLink } from '@/components/portal/DocumentLink'
import { RequestStatusBadge } from '@/components/portal/RequestStatusBadge'
import { formatTime } from '@/lib/formatTime'

interface Props {
  bookingId: string
  locale: 'en' | 'es'
  services: ConciergeServiceOption[]
  groceryItems: GroceryItemOption[]
  initialRequests: SerializedServiceRequest[]
  /** Whether grocery & drinks ordering is turned on for this booking. */
  offerGroceries?: boolean
  /** Restaurants for the reservation venue picker. */
  restaurants?: RestaurantOption[]
}

// `Decimal` and `Date` cannot cross the server/client boundary as-is.
export interface SerializedServiceRequest
  extends Omit<
    ServiceRequest,
    | 'preferredDate'
    | 'endDate'
    | 'confirmedAt'
    | 'completedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'quotedAmount'
  > {
  preferredDate: string | null
  endDate: string | null
  confirmedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  quotedAmount: string | null
  documents: Array<{
    id: string
    filename: string
    label: string | null
    kind: string
    uploadedAt: string
  }>
}

/** Format a @db.Date (midnight UTC) as a short day label in UTC, so the
 *  displayed day matches what the guest picked regardless of their timezone. */
function fmtUtcDay(iso: string, locale: 'en' | 'es'): string {
  return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function ConciergeSection({
  bookingId,
  locale,
  services,
  groceryItems,
  initialRequests,
  offerGroceries = false,
  restaurants = [],
}: Props) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [groceryOpen, setGroceryOpen] = useState(false)

  const active = initialRequests.filter(
    (r) =>
      r.status !== 'COMPLETED' &&
      r.status !== 'CANCELLED' &&
      r.status !== 'DECLINED'
  )
  const archived = initialRequests.filter(
    (r) =>
      r.status === 'COMPLETED' ||
      r.status === 'CANCELLED' ||
      r.status === 'DECLINED'
  )

  // Nothing enabled for this booking and nothing requested yet → hide the
  // whole section (don't promise services the admin hasn't turned on).
  const hasServices = services.length > 0
  if (!hasServices && !offerGroceries && initialRequests.length === 0) {
    return null
  }

  return (
    <section className="mb-12">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-2">
        {t('Concierge', 'Concierge')}
      </p>
      <h2 className="text-2xl font-light text-ink tracking-tight mb-6 leading-tight">
        {t('Services for your stay', 'Servicios para tu estadía')}
      </h2>

      {initialRequests.length === 0 && hasServices && (
        <p className="text-sm text-muted font-light mb-4 leading-relaxed">
          {t(
            'Tee times, airport transfers, a private chef — let us know what you need and we’ll arrange it.',
            'Tee times, traslados al aeropuerto, un chef privado — dinos qué necesitas y nos encargamos.'
          )}
        </p>
      )}

      {active.length > 0 && (
        <ul className="border-t border-line mb-4">
          {active.map((r) => (
            <RequestRow key={r.id} request={r} locale={locale} />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        {services.length > 0 && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white text-sm font-light tracking-wide rounded-sm hover:bg-ink transition-colors"
          >
            <ConciergeBell className="w-4 h-4" />
            {t('Request a service', 'Solicitar un servicio')}
          </button>
        )}
        {offerGroceries && (
          <button
            type="button"
            onClick={() => setGroceryOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-line text-ink text-sm font-light tracking-wide rounded-sm hover:bg-canvas transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('Order groceries & drinks', 'Pedir compras y bebidas')}
          </button>
        )}
      </div>

      {archived.length > 0 && (
        <details className="mt-8">
          <summary className="text-xs uppercase tracking-[0.2em] text-muted-2 cursor-pointer hover:text-ink">
            {t(
              `History (${archived.length})`,
              `Historial (${archived.length})`
            )}
          </summary>
          <ul className="border-t border-line mt-3">
            {archived.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                locale={locale}
                muted
              />
            ))}
          </ul>
        </details>
      )}

      {pickerOpen && (
        <ServicePickerModal
          bookingId={bookingId}
          locale={locale}
          services={services}
          restaurants={restaurants}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {groceryOpen && (
        <GroceryRequestModal
          bookingId={bookingId}
          locale={locale}
          items={groceryItems}
          onClose={() => setGroceryOpen(false)}
        />
      )}
    </section>
  )
}

function RequestRow({
  request,
  locale,
  muted = false,
}: {
  request: SerializedServiceRequest
  locale: 'en' | 'es'
  muted?: boolean
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  return (
    <li
      className={`py-4 border-b border-line ${muted ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-light text-ink">
            {request.serviceName}
            {request.venueName && (
              <span className="text-muted-2"> · {request.venueName}</span>
            )}
            {request.attractionName && (
              <span className="text-muted-2"> · 📍 {request.attractionName}</span>
            )}
          </p>
          {(request.preferredDate || request.preferredTime || request.partySize) && (
            <p className="text-xs text-muted-2 font-light mt-1">
              {[
                request.preferredDate &&
                  (request.endDate
                    ? `${fmtUtcDay(request.preferredDate, locale)} – ${fmtUtcDay(request.endDate, locale)}`
                    : fmtUtcDay(request.preferredDate, locale)),
                formatTime(request.preferredTime),
                request.partySize &&
                  t(`${request.partySize} guests`, `${request.partySize} personas`),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {request.notes && (
            <p className="text-sm text-body-strong font-light mt-2 whitespace-pre-wrap leading-relaxed">
              {request.notes}
            </p>
          )}
          {request.kind === 'GROCERY' && (
            <GroceryBreakdown
              items={
                Array.isArray(request.groceryItems)
                  ? (request.groceryItems as unknown as GroceryLineItem[])
                  : []
              }
              locale={locale}
            />
          )}
          {request.documents.length > 0 && (
            <div className="mt-3 border-t border-line-soft pt-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-2 font-light mb-1">
                {t('Attached', 'Adjuntos')}
              </p>
              <ul className="space-y-1">
                {request.documents.map((d) => (
                  <li key={d.id} className="text-sm font-light">
                    <DocumentLink
                      documentId={d.id}
                      scope="renter"
                      filename={d.filename}
                    >
                      {d.label || d.filename}
                    </DocumentLink>
                    <span className="text-[11px] text-faint ml-2">
                      {format(new Date(d.uploadedAt), 'MMM d')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <RequestStatusBadge status={request.status} locale={locale} />
      </div>
    </li>
  )
}

function GroceryBreakdown({
  items,
  locale,
}: {
  items: GroceryLineItem[]
  locale: 'en' | 'es'
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const [expanded, setExpanded] = useState(false)
  if (items.length === 0) return null
  const visible = expanded ? items : items.slice(0, 4)
  const more = items.length - visible.length
  return (
    <div className="mt-3 border-t border-line-soft pt-3">
      <ul className="space-y-1">
        {visible.map((l, i) => (
          <li
            key={`${l.slug}-${i}`}
            className="text-xs font-light text-body-strong flex justify-between gap-3"
          >
            <span className="truncate">
              {locale === 'es'
                ? l.name_es || l.name_en || l.slug
                : l.name_en || l.name_es || l.slug}
              {l.brand && (
                <span className="text-faint ml-1.5">· {l.brand}</span>
              )}
              {l.note && (
                <span className="text-faint italic ml-1.5">— {l.note}</span>
              )}
            </span>
            <span className="text-muted-2 whitespace-nowrap">
              ×{l.qty}
              {l.unit && (
                <span className="text-faint ml-1">{l.unit}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-muted-2 hover:text-ink mt-2"
        >
          + {t(`${more} more item${more === 1 ? '' : 's'}`, `${more} artículo${more === 1 ? '' : 's'} más`)}
        </button>
      )}
      {expanded && items.length > 4 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-2 hover:text-ink mt-2"
        >
          − {t('Show less', 'Mostrar menos')}
        </button>
      )}
    </div>
  )
}

/**
 * Two-pane modal: pick a service from the catalog, then enter date/notes.
 * Once submitted, server refreshes the page so the new row appears.
 */
function ServicePickerModal({
  bookingId,
  locale,
  services,
  restaurants,
  onClose,
}: {
  bookingId: string
  locale: 'en' | 'es'
  services: ConciergeServiceOption[]
  restaurants: RestaurantOption[]
  onClose: () => void
}) {
  const router = useRouter()
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const [selected, setSelected] = useState<ConciergeServiceOption | null>(null)
  const [search, setSearch] = useState('')
  const [venueName, setVenueName] = useState('')
  const [venueOther, setVenueOther] = useState(false)
  const [preferredDate, setPreferredDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [partySize, setPartySize] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // How this service schedules — drives which date inputs show. Date is
  // always optional; 'none' hides dates entirely.
  const mode = selected?.schedulingMode ?? 'single_day'

  const grouped = useMemo(() => {
    const filtered = services.filter((s) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (s.name_en || '').toLowerCase().includes(q) ||
        (s.name_es || '').toLowerCase().includes(q) ||
        (s.shortDescription_en || '').toLowerCase().includes(q) ||
        (s.shortDescription_es || '').toLowerCase().includes(q)
      )
    })
    const map = new Map<string, ConciergeServiceOption[]>()
    for (const s of filtered) {
      const key = s.category || 'other'
      const arr = map.get(key) ?? []
      arr.push(s)
      map.set(key, arr)
    }
    return map
  }, [services, search])

  // Lock body scroll while the modal is open. Restored on close.
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  const submit = async () => {
    if (!selected) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/portal/bookings/${bookingId}/service-requests`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceSanityId: selected._id,
            venueName: selected.enableVenuePicker ? venueName || null : null,
            preferredDate: preferredDate || null,
            endDate: mode === 'date_range' ? endDate || null : null,
            preferredTime: mode === 'date_time' ? preferredTime || null : null,
            partySize: partySize || null,
            notes: notes || null,
          }),
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Could not submit')
      }
      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="text-lg font-light text-ink tracking-tight">
            {selected
              ? t('Tell us a bit more', 'Cuéntanos un poco más')
              : t('Choose a service', 'Elige un servicio')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-2 hover:text-ink"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selected ? (
          <div className="overflow-y-auto flex-1">
            <div className="px-6 py-3 border-b border-line sticky top-0 bg-white">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Search services…', 'Buscar servicios…')}
                className="w-full rounded-sm border border-line px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {grouped.size === 0 ? (
              <p className="px-6 py-8 text-sm font-light text-muted-2">
                {t('No services match your search.', 'No hay servicios que coincidan.')}
              </p>
            ) : (
              <div className="px-6 py-4 space-y-6">
                {Array.from(grouped.entries()).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-2 font-light mb-2">
                      {CATEGORY_LABELS[category]?.[locale] || category}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((s) => (
                        <li key={s._id}>
                          <button
                            type="button"
                            onClick={() => setSelected(s)}
                            className="w-full text-left p-3 border border-line rounded-sm hover:border-ink hover:bg-canvas transition-colors"
                          >
                            <p className="text-sm font-light text-ink">
                              {locale === 'es'
                                ? s.name_es || s.name_en
                                : s.name_en || s.name_es}
                            </p>
                            <p className="text-xs text-muted-2 font-light mt-1 leading-relaxed line-clamp-2">
                              {locale === 'es'
                                ? s.shortDescription_es || s.shortDescription_en
                                : s.shortDescription_en || s.shortDescription_es}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs uppercase tracking-[0.2em] text-muted-2 hover:text-ink"
            >
              ← {t('Pick a different service', 'Elegir otro servicio')}
            </button>
            <div className="bg-canvas border border-line px-4 py-3 rounded-sm">
              <p className="text-sm font-light text-ink">
                {locale === 'es'
                  ? selected.name_es || selected.name_en
                  : selected.name_en || selected.name_es}
              </p>
              <p className="text-xs text-muted-2 font-light mt-1 leading-relaxed">
                {locale === 'es'
                  ? selected.shortDescription_es || selected.shortDescription_en
                  : selected.shortDescription_en || selected.shortDescription_es}
              </p>
            </div>

            {selected.enableVenuePicker && (
              <>
                <Field label={t('Restaurant', 'Restaurante')}>
                  <select
                    value={venueOther ? '__other__' : venueName}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '__other__') {
                        setVenueOther(true)
                        setVenueName('')
                      } else {
                        setVenueOther(false)
                        setVenueName(v)
                      }
                    }}
                    className="w-full rounded-sm border border-line px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-ring bg-white"
                  >
                    <option value="">
                      {t('Select a restaurant…', 'Elige un restaurante…')}
                    </option>
                    {restaurants.map((r) => {
                      const label =
                        (locale === 'es' ? r.name_es : r.name_en) ||
                        r.name_en ||
                        r.name_es ||
                        ''
                      const value = r.name_en || r.name_es || ''
                      return (
                        <option key={r.id} value={value}>
                          {label}
                        </option>
                      )
                    })}
                    <option value="__other__">{t('Other…', 'Otro…')}</option>
                  </select>
                </Field>
                {venueOther && (
                  <Field label={t('Restaurant name', 'Nombre del restaurante')}>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder={t('Where would you like to go?', '¿A dónde te gustaría ir?')}
                      className="w-full rounded-sm border border-line px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                )}
              </>
            )}

            {mode !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label={
                    mode === 'date_range'
                      ? t('Start date (optional)', 'Fecha de inicio (opcional)')
                      : t('Preferred date (optional)', 'Fecha preferida (opcional)')
                  }
                >
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full rounded-sm border border-line px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </Field>
                {mode === 'date_range' && (
                  <Field label={t('End date (optional)', 'Fecha de fin (opcional)')}>
                    <input
                      type="date"
                      value={endDate}
                      min={preferredDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-sm border border-line px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                )}
                {mode === 'date_time' && (
                  <Field label={t('Time (optional)', 'Hora (opcional)')}>
                    <input
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full rounded-sm border border-line px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </Field>
                )}
              </div>
            )}
            <Field label={t('Party size (optional)', 'Número de personas (opcional)')}>
              <input
                type="number"
                min={1}
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full rounded-sm border border-line px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label={t('Notes', 'Notas')}>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t(
                  'Anything else we should know — dietary restrictions, special occasions, etc.',
                  'Algo más que debamos saber — restricciones alimentarias, ocasiones especiales, etc.'
                )}
                className="w-full rounded-sm border border-line px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>

            {error && (
              <p className="text-xs text-status-attention font-light">{error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="px-6 py-2.5 bg-ink text-white text-sm font-light tracking-wide rounded-sm hover:bg-ink disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? t('Submitting…', 'Enviando…')
                  : t('Send request', 'Enviar solicitud')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-line text-ink text-sm font-light tracking-wide rounded-sm hover:bg-sand"
              >
                {t('Cancel', 'Cancelar')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-wider text-muted-2 font-light">
        {label}
      </span>
      {children}
    </label>
  )
}
