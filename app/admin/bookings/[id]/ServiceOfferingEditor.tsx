'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Plus } from 'lucide-react'
import {
  CATEGORY_LABELS,
  type ConciergeServiceOption,
} from '@/lib/portal/conciergeServices.types'
import { tFor } from '@/lib/i18n'

interface Props {
  bookingId: string
  allServices: ConciergeServiceOption[]
  initialServiceIds: string[]
  initialOfferGroceries: boolean
  locale?: 'en' | 'es'
}

/**
 * Admin allow-list for concierge services. The guest can only request a
 * service that's ticked here — nothing is available by default. Collapses to
 * a summary once something is offered (with an "Offer another service" CTA to
 * reopen); expanded by default when nothing is offered yet.
 */
export function ServiceOfferingEditor({
  bookingId,
  allServices,
  initialServiceIds,
  initialOfferGroceries,
  locale = 'en',
}: Props) {
  const t = tFor(locale)
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [ids, setIds] = useState<Set<string>>(
    new Set(Array.isArray(initialServiceIds) ? initialServiceIds : [])
  )
  const [groceries, setGroceries] = useState(!!initialOfferGroceries)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Collapsed once something's already offered; open to offer the first ones.
  const [open, setOpen] = useState(
    (initialServiceIds?.length ?? 0) === 0 && !initialOfferGroceries
  )

  const label = (s: ConciergeServiceOption) =>
    s.name_en || s.name_es || s.slug || t('Untitled', 'Sin título')

  const offeredNames = useMemo(
    () => allServices.filter((s) => ids.has(s._id)).map(label),
    [allServices, ids]
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? allServices.filter((s) =>
          [s.name_en, s.name_es, s.shortDescription_en, s.shortDescription_es]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(q)
        )
      : allServices
    const groups = new Map<string, ConciergeServiceOption[]>()
    for (const s of filtered) {
      const key = s.category || 'other'
      const arr = groups.get(key) ?? []
      arr.push(s)
      groups.set(key, arr)
    }
    return groups
  }, [allServices, search])

  const toggle = (id: string) =>
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setSaved(false)
      return next
    })

  const setAll = (on: boolean) => {
    setIds(on ? new Set(allServices.map((s) => s._id)) : new Set())
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/bookings/${bookingId}/dining-offering`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offeredServiceSanityIds: Array.from(ids),
            offerGroceries: groceries,
          }),
        }
      )
      if (!res.ok) {
        const p = await res.json().catch(() => ({}))
        throw new Error(p?.error || t('Save failed', 'Error al guardar'))
      }
      setSaved(true)
      router.refresh()
      // Collapse back to the summary so the "offer another" cycle is clear.
      setOpen(false)
    } catch (err: any) {
      setError(err?.message ?? t('Something went wrong', 'Algo salió mal'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3 mb-6 pb-6 border-b border-stone-200">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light">
          {t('Available to the guest', 'Disponible para el huésped')} ({ids.size})
        </p>
        {open && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900"
          >
            {t('Hide', 'Ocultar')}
            <ChevronDown className="w-3.5 h-3.5 rotate-180" />
          </button>
        )}
      </div>

      {/* Collapsed summary + CTA */}
      {!open && (
        <div className="space-y-3">
          {offeredNames.length > 0 || groceries ? (
            <div className="flex flex-wrap gap-1.5">
              {offeredNames.map((n, i) => (
                <span
                  key={i}
                  className="text-xs font-light px-2.5 py-1 rounded-full bg-stone-100 text-stone-800"
                >
                  {n}
                </span>
              ))}
              {groceries && (
                <span className="text-xs font-light px-2.5 py-1 rounded-full bg-lime-100 text-lime-800">
                  {t('Groceries & drinks', 'Comestibles y bebidas')}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-500 font-light">
              {t('No services offered to this guest yet.', 'Aún no se ofrecen servicios a este huésped.')}
            </p>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-light text-stone-800 border border-stone-300 rounded-sm px-3 py-1.5 hover:bg-stone-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {offeredNames.length > 0 || groceries
              ? t('Offer another service', 'Ofrecer otro servicio')
              : t('Offer a service', 'Ofrecer un servicio')}
          </button>
        </div>
      )}

      {/* Expanded editor */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-stone-600 font-light">
                  {t('Turn on the concierge services this guest can request.', 'Activa los servicios de conserjería que este huésped puede solicitar.')}
                </p>
                <div className="flex gap-2 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setAll(true)}
                    className="text-stone-500 hover:text-stone-900 underline underline-offset-2"
                  >
                    {t('All', 'Todos')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAll(false)}
                    className="text-stone-500 hover:text-stone-900 underline underline-offset-2"
                  >
                    {t('None', 'Ninguno')}
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('Search services…', 'Buscar servicios…')}
                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
              />

              {allServices.length === 0 ? (
                <p className="text-sm text-stone-400 font-light">
                  {t('No active concierge services in the catalog.', 'No hay servicios de conserjería activos en el catálogo.')}
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto border border-stone-200 rounded-sm divide-y divide-stone-100">
                  {Array.from(visible.entries()).map(([category, list]) => (
                    <div key={category}>
                      <p className="px-3 py-1.5 bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500 font-light sticky top-0">
                        {CATEGORY_LABELS[category]?.[locale] || category}
                      </p>
                      {list.map((s) => (
                        <label
                          key={s._id}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-light cursor-pointer hover:bg-stone-50"
                        >
                          <input
                            type="checkbox"
                            checked={ids.has(s._id)}
                            onChange={() => toggle(s._id)}
                            className="accent-stone-800"
                          />
                          <span className="min-w-0 flex-1 truncate text-stone-800">
                            {label(s)}
                          </span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-2 text-sm font-light text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groceries}
                  onChange={(e) => {
                    setGroceries(e.target.checked)
                    setSaved(false)
                  }}
                  className="accent-stone-800"
                />
                {t('Offer grocery & drinks ordering', 'Ofrecer pedidos de comestibles y bebidas')}
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="px-5 py-2 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-60"
                >
                  {saving ? t('Saving…', 'Guardando…') : t('Save services', 'Guardar servicios')}
                </button>
                {saved && (
                  <span className="text-xs text-emerald-700 font-light">{t('Saved', 'Guardado')} ✓</span>
                )}
                {error && <span className="text-xs text-red-600 font-light">{error}</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
