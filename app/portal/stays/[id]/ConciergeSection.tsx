'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ConciergeBell, X, ShoppingBag } from 'lucide-react'
import type { ServiceRequest, ServiceRequestStatus } from '@prisma/client'
import {
  CATEGORY_LABELS,
  type ConciergeServiceOption,
} from '@/lib/portal/conciergeServices.types'
import type {
  GroceryItemOption,
  GroceryLineItem,
} from '@/lib/portal/groceryItems.types'
import { GroceryRequestModal } from './GroceryRequestModal'
import { DocumentLink } from '@/components/portal/DocumentLink'

interface Props {
  bookingId: string
  locale: 'en' | 'es'
  services: ConciergeServiceOption[]
  groceryItems: GroceryItemOption[]
  initialRequests: SerializedServiceRequest[]
}

// `Decimal` and `Date` cannot cross the server/client boundary as-is.
export interface SerializedServiceRequest
  extends Omit<
    ServiceRequest,
    'preferredDate' | 'confirmedAt' | 'completedAt' | 'createdAt' | 'updatedAt' | 'quotedAmount'
  > {
  preferredDate: string | null
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

const STATUS_LABEL: Record<
  ServiceRequestStatus,
  { en: string; es: string; tone: 'neutral' | 'progress' | 'good' | 'muted' }
> = {
  REQUESTED: { en: 'Requested', es: 'Solicitado', tone: 'neutral' },
  IN_PROGRESS: { en: 'In progress', es: 'En proceso', tone: 'progress' },
  CONFIRMED: { en: 'Confirmed', es: 'Confirmado', tone: 'good' },
  COMPLETED: { en: 'Completed', es: 'Completado', tone: 'muted' },
  DECLINED: { en: 'Declined', es: 'No disponible', tone: 'muted' },
  CANCELLED: { en: 'Cancelled', es: 'Cancelado', tone: 'muted' },
}

export function ConciergeSection({
  bookingId,
  locale,
  services,
  groceryItems,
  initialRequests,
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

  return (
    <section className="mb-12">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-2">
        {t('Concierge', 'Concierge')}
      </p>
      <h2 className="text-2xl font-light text-stone-900 tracking-tight mb-6 leading-tight">
        {t('Services for your stay', 'Servicios para tu estadía')}
      </h2>

      {initialRequests.length === 0 && (
        <p className="text-sm text-stone-600 font-light mb-4 leading-relaxed">
          {t(
            'Tee times, airport transfers, a private chef — let us know what you need and we’ll arrange it.',
            'Tee times, traslados al aeropuerto, un chef privado — dinos qué necesitas y nos encargamos.'
          )}
        </p>
      )}

      {active.length > 0 && (
        <ul className="border-t border-stone-200 mb-4">
          {active.map((r) => (
            <RequestRow key={r.id} request={r} locale={locale} />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
        >
          <ConciergeBell className="w-4 h-4" />
          {t('Request a service', 'Solicitar un servicio')}
        </button>
        <button
          type="button"
          onClick={() => setGroceryOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-50 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          {t('Order groceries & drinks', 'Pedir compras y bebidas')}
        </button>
      </div>

      {archived.length > 0 && (
        <details className="mt-8">
          <summary className="text-xs uppercase tracking-[0.2em] text-stone-500 cursor-pointer hover:text-stone-900">
            {t(
              `History (${archived.length})`,
              `Historial (${archived.length})`
            )}
          </summary>
          <ul className="border-t border-stone-200 mt-3">
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
  const status = STATUS_LABEL[request.status]
  const statusToneClass =
    status.tone === 'good'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : status.tone === 'progress'
        ? 'text-amber-700 bg-amber-50 border-amber-200'
        : status.tone === 'muted'
          ? 'text-stone-500 bg-stone-50 border-stone-200'
          : 'text-stone-700 bg-white border-stone-300'

  return (
    <li
      className={`py-4 border-b border-stone-200 ${muted ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-light text-stone-900">
            {request.serviceName}
          </p>
          {(request.preferredDate || request.preferredTime || request.partySize) && (
            <p className="text-xs text-stone-500 font-light mt-1">
              {[
                request.preferredDate &&
                  format(new Date(request.preferredDate), 'EEE, MMM d'),
                request.preferredTime,
                request.partySize &&
                  t(`${request.partySize} guests`, `${request.partySize} personas`),
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {request.notes && (
            <p className="text-sm text-stone-700 font-light mt-2 whitespace-pre-wrap leading-relaxed">
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
            <div className="mt-3 border-t border-stone-100 pt-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-1">
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
                    <span className="text-[11px] text-stone-400 ml-2">
                      {format(new Date(d.uploadedAt), 'MMM d')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <span
          className={`inline-flex items-center text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border font-light whitespace-nowrap ${statusToneClass}`}
        >
          {locale === 'es' ? status.es : status.en}
        </span>
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
    <div className="mt-3 border-t border-stone-100 pt-3">
      <ul className="space-y-1">
        {visible.map((l, i) => (
          <li
            key={`${l.slug}-${i}`}
            className="text-xs font-light text-stone-700 flex justify-between gap-3"
          >
            <span className="truncate">
              {locale === 'es'
                ? l.name_es || l.name_en || l.slug
                : l.name_en || l.name_es || l.slug}
              {l.brand && (
                <span className="text-stone-400 ml-1.5">· {l.brand}</span>
              )}
              {l.note && (
                <span className="text-stone-400 italic ml-1.5">— {l.note}</span>
              )}
            </span>
            <span className="text-stone-500 whitespace-nowrap">
              ×{l.qty}
              {l.unit && (
                <span className="text-stone-400 ml-1">{l.unit}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-stone-500 hover:text-stone-900 mt-2"
        >
          + {t(`${more} more item${more === 1 ? '' : 's'}`, `${more} artículo${more === 1 ? '' : 's'} más`)}
        </button>
      )}
      {expanded && items.length > 4 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-stone-500 hover:text-stone-900 mt-2"
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
  onClose,
}: {
  bookingId: string
  locale: 'en' | 'es'
  services: ConciergeServiceOption[]
  onClose: () => void
}) {
  const router = useRouter()
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const [selected, setSelected] = useState<ConciergeServiceOption | null>(null)
  const [search, setSearch] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [partySize, setPartySize] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
            preferredDate: preferredDate || null,
            preferredTime: preferredTime || null,
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
      className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-light text-stone-900 tracking-tight">
            {selected
              ? t('Tell us a bit more', 'Cuéntanos un poco más')
              : t('Choose a service', 'Elige un servicio')}
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

        {!selected ? (
          <div className="overflow-y-auto flex-1">
            <div className="px-6 py-3 border-b border-stone-200 sticky top-0 bg-white">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Search services…', 'Buscar servicios…')}
                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
            </div>
            {grouped.size === 0 ? (
              <p className="px-6 py-8 text-sm font-light text-stone-500">
                {t('No services match your search.', 'No hay servicios que coincidan.')}
              </p>
            ) : (
              <div className="px-6 py-4 space-y-6">
                {Array.from(grouped.entries()).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-light mb-2">
                      {CATEGORY_LABELS[category]?.[locale] || category}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((s) => (
                        <li key={s._id}>
                          <button
                            type="button"
                            onClick={() => setSelected(s)}
                            className="w-full text-left p-3 border border-stone-200 rounded-sm hover:border-stone-800 hover:bg-stone-50 transition-colors"
                          >
                            <p className="text-sm font-light text-stone-900">
                              {locale === 'es'
                                ? s.name_es || s.name_en
                                : s.name_en || s.name_es}
                            </p>
                            <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed line-clamp-2">
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
              className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900"
            >
              ← {t('Pick a different service', 'Elegir otro servicio')}
            </button>
            <div className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-sm">
              <p className="text-sm font-light text-stone-900">
                {locale === 'es'
                  ? selected.name_es || selected.name_en
                  : selected.name_en || selected.name_es}
              </p>
              <p className="text-xs text-stone-500 font-light mt-1 leading-relaxed">
                {locale === 'es'
                  ? selected.shortDescription_es || selected.shortDescription_en
                  : selected.shortDescription_en || selected.shortDescription_es}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t('Preferred date (optional)', 'Fecha preferida (opcional)')}>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </Field>
              <Field label={t('Time (optional)', 'Hora (opcional)')}>
                <input
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder={t('e.g. 7:30pm', 'ej. 19:30')}
                  className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </Field>
            </div>
            <Field label={t('Party size (optional)', 'Número de personas (opcional)')}>
              <input
                type="number"
                min={1}
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
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
                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
              />
            </Field>

            {error && (
              <p className="text-xs text-red-600 font-light">{error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="px-6 py-2.5 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? t('Submitting…', 'Enviando…')
                  : t('Send request', 'Enviar solicitud')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
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
      <span className="text-xs uppercase tracking-wider text-stone-500 font-light">
        {label}
      </span>
      {children}
    </label>
  )
}
