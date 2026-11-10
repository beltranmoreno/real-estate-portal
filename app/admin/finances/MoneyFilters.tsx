'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { MOVEMENT_TYPES, RANGES, type MovementType, type RangeKey } from '@/lib/admin/moneyLedger'
import { movementLabel } from './labels'

type Params = { range: string; from: string; to: string; guest: string; booking: string; type: string }

const RANGE_LABEL: Record<RangeKey, { en: string; es: string }> = {
  '24h': { en: '24h', es: '24 h' },
  '7d': { en: '7 days', es: '7 días' },
  '1m': { en: '1 month', es: '1 mes' },
  '3m': { en: '3 months', es: '3 meses' },
  '6m': { en: '6 months', es: '6 meses' },
  '1y': { en: '1 year', es: '1 año' },
  all: { en: 'All time', es: 'Todo' },
}

/**
 * Filters for /admin/finances. Everything lives in the URL (range or from/to,
 * guest, booking, type), so a view can be bookmarked, shared and survives
 * back/forward.
 */
export function MoneyFilters({
  locale,
  params,
  guests,
  bookings,
  counts,
  total,
  defaultRange,
}: {
  locale: 'en' | 'es'
  params: Params
  guests: { id: string; name: string }[]
  bookings: { id: string; guestId: string; label: string }[]
  counts: Record<MovementType, number>
  total: number
  defaultRange: RangeKey
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [from, setFrom] = useState(params.from)
  const [to, setTo] = useState(params.to)
  useEffect(() => {
    setFrom(params.from)
    setTo(params.to)
  }, [params.from, params.to])

  /** URL for the current filters with some changed ('' removes a key). */
  const href = (patch: Partial<Params>) => {
    const next = { ...params, ...patch }
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(next)) if (v) q.set(k, v)
    // The default range doesn't need to be in the URL.
    if (q.get('range') === defaultRange) q.delete('range')
    const s = q.toString()
    return s ? `${pathname}?${s}` : pathname
  }
  const go = (patch: Partial<Params>) => startTransition(() => router.push(href(patch), { scroll: false }))

  const custom = Boolean(params.from || params.to)
  const activeRange = custom ? null : (params.range || defaultRange)

  const chip = (active: boolean) =>
    `shrink-0 px-3 py-1.5 text-xs rounded-xs border transition-colors ${
      active ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-300 text-stone-700 hover:border-stone-500'
    }`

  return (
    <div className={`space-y-4 transition-opacity ${pending ? 'opacity-60' : ''}`}>
      {/* Quick ranges — scroll sideways on narrow phones */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={href({ range: r, from: '', to: '' })}
              scroll={false}
              aria-current={activeRange === r ? 'true' : undefined}
              className={chip(activeRange === r)}
            >
              {RANGE_LABEL[r][locale]}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Custom dates */}
        <form
          className="lg:col-span-2 grid grid-cols-[1fr_1fr_auto] gap-2 items-end"
          onSubmit={(e) => {
            e.preventDefault()
            if (from || to) go({ from, to, range: '' })
          }}
        >
          <label className="block min-w-0">
            <span className="block text-[11px] uppercase tracking-[0.15em] text-stone-500 mb-1">{t('From', 'Desde')}</span>
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full min-w-0 border border-stone-300 rounded-xs px-2 py-2 text-sm font-light bg-white"
            />
          </label>
          <label className="block min-w-0">
            <span className="block text-[11px] uppercase tracking-[0.15em] text-stone-500 mb-1">{t('To', 'Hasta')}</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              className="w-full min-w-0 border border-stone-300 rounded-xs px-2 py-2 text-sm font-light bg-white"
            />
          </label>
          <button
            type="submit"
            disabled={!from && !to}
            className={`px-3 py-2 text-xs uppercase tracking-[0.12em] rounded-xs border ${
              custom ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-300 text-stone-700'
            } disabled:opacity-40`}
          >
            {t('Apply', 'Aplicar')}
          </button>
        </form>

        <SearchSelect
          label={t('Guest', 'Huésped')}
          placeholder={t('Search guests…', 'Buscar huésped…')}
          allLabel={t('All guests', 'Todos los huéspedes')}
          emptyLabel={t('No guest found', 'Ningún huésped')}
          clearLabel={t('Clear', 'Quitar')}
          options={guests.map((g) => ({ id: g.id, label: g.name }))}
          value={params.guest}
          onChange={(guest) => {
            // Keep the booking only if it belongs to the new guest.
            const keep = guest !== '' && bookings.find((b) => b.id === params.booking)?.guestId === guest
            go({ guest, booking: keep ? params.booking : '' })
          }}
        />

        <SearchSelect
          label={t('Booking', 'Reserva')}
          placeholder={t('Search house, guest or date…', 'Buscar casa, huésped o fecha…')}
          allLabel={t('All bookings', 'Todas las reservas')}
          emptyLabel={t('No booking found', 'Ninguna reserva')}
          clearLabel={t('Clear', 'Quitar')}
          options={bookings.map((b) => ({ id: b.id, label: b.label }))}
          value={params.booking}
          onChange={(booking) => go({ booking })}
        />
      </div>

      {/* Movement type */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap">
          <Link href={href({ type: '' })} scroll={false} className={chip(!params.type)}>
            {t('All movements', 'Todos')} <span className="opacity-60">{total}</span>
          </Link>
          {MOVEMENT_TYPES.filter((k) => counts[k] > 0 || params.type === k).map((k) => (
            <Link key={k} href={href({ type: k })} scroll={false} className={chip(params.type === k)}>
              {movementLabel(k, locale)} <span className="opacity-60">{counts[k]}</span>
            </Link>
          ))}
        </div>
      </div>

      {(custom || params.guest || params.booking || params.type) && (
        <Link href={pathname} className="inline-block text-xs text-stone-500 hover:text-stone-900 underline">
          {t('Clear filters', 'Quitar filtros')}
        </Link>
      )}
    </div>
  )
}

/** Accents and case don't matter when searching ("jose" finds "José"). */
const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/**
 * A search box that lists matching options underneath; picking one sets the
 * filter. Arrow keys + Enter work, Escape closes, the × clears it.
 */
function SearchSelect({
  label,
  placeholder,
  allLabel,
  emptyLabel,
  clearLabel,
  options,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  allLabel: string
  emptyLabel: string
  clearLabel: string
  options: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  const listId = useId()
  const wrap = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const selected = options.find((o) => o.id === value) ?? null
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  // Close when tapping or clicking anywhere else.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const words = fold(query).split(/\s+/).filter(Boolean)
  const matches = options.filter((o) => {
    const l = fold(o.label)
    return words.every((w) => l.includes(w))
  })
  const shown = matches.slice(0, 50)

  const pick = (id: string) => {
    setOpen(false)
    setQuery('')
    input.current?.blur()
    if (id !== value) onChange(id)
  }

  return (
    <div ref={wrap} className="relative min-w-0">
      <span className="block text-[11px] uppercase tracking-[0.15em] text-stone-500 mb-1">{label}</span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
        <input
          ref={input}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          // Showing the picked option until you start typing.
          value={open ? query : selected?.label ?? ''}
          placeholder={selected ? selected.label : placeholder}
          onFocus={() => {
            setOpen(true)
            setQuery('')
            setActive(0)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActive((i) => Math.min(i + 1, shown.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              if (shown[active]) pick(shown[active].id)
            } else if (e.key === 'Escape') {
              setOpen(false)
              input.current?.blur()
            }
          }}
          className={`w-full border border-stone-300 rounded-xs pl-8 ${value ? 'pr-8' : 'pr-2'} py-2 text-sm font-light bg-white truncate focus:outline-none focus:border-stone-500 ${
            selected && !open ? 'text-stone-900' : ''
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => pick('')}
            aria-label={clearLabel}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-stone-200 shadow-lg divide-y divide-stone-100"
        >
          {!query && (
            <li role="option" aria-selected={!value}>
              <button
                type="button"
                onClick={() => pick('')}
                className="w-full text-left px-3 py-2 text-sm text-stone-500 font-light hover:bg-stone-50"
              >
                {allLabel}
              </button>
            </li>
          )}
          {shown.length === 0 ? (
            <li className="px-3 py-2 text-sm text-stone-500 font-light">{emptyLabel}</li>
          ) : (
            shown.map((o, i) => (
              <li key={o.id} role="option" aria-selected={o.id === value}>
                <button
                  type="button"
                  onClick={() => pick(o.id)}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full text-left px-3 py-2 text-sm ${i === active ? 'bg-stone-100' : ''} ${
                    o.id === value ? 'text-stone-900 font-normal' : 'text-stone-700 font-light'
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))
          )}
          {matches.length > shown.length && (
            <li className="px-3 py-2 text-xs text-stone-400 font-light">
              +{matches.length - shown.length}…
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
