'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Minus, Search, ShoppingBag, Star } from 'lucide-react'
import {
  GROCERY_CATEGORY_LABELS,
  GROCERY_CATEGORY_ORDER,
  type GroceryItemOption,
} from '@/lib/portal/groceryItems.types'

interface Props {
  bookingId: string
  locale: 'en' | 'es'
  items: GroceryItemOption[]
  onClose: () => void
}

interface CartLine {
  slug: string
  name_en: string | null
  name_es: string | null
  brand: string | null
  category: string | null
  qty: number
  unit: string | null
  note: string | null
}

/**
 * Two-step modal for building a grocery / drinks request.
 *   Step 1 — browse: search + Popular tab + collapsible categories,
 *            with inline qty controls so renters can build a cart
 *            without leaving the page.
 *   Step 2 — review: cart, optional delivery date + general notes,
 *            submit. Server snapshots names/categories from Sanity.
 */
export function GroceryRequestModal({
  bookingId,
  locale,
  items,
  onClose,
}: Props) {
  const router = useRouter()
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const [step, setStep] = useState<'browse' | 'review'>('browse')
  const [search, setSearch] = useState('')
  const [popularTab, setPopularTab] = useState(true)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<Map<string, CartLine>>(new Map())
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lock body scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  const itemBySlug = useMemo(() => {
    const m = new Map<string, GroceryItemOption>()
    for (const i of items) if (i.slug) m.set(i.slug, i)
    return m
  }, [items])

  const popular = useMemo(
    () => items.filter((i) => i.isPopular && i.slug),
    [items]
  )

  // Search filter (cross-category, both languages, brand match too).
  const searched = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return items.filter((i) => {
      if (!i.slug) return false
      return (
        (i.name_en || '').toLowerCase().includes(q) ||
        (i.name_es || '').toLowerCase().includes(q) ||
        (i.brand || '').toLowerCase().includes(q)
      )
    })
  }, [items, search])

  // Group items by category for the browse view.
  const grouped = useMemo(() => {
    const map = new Map<string, GroceryItemOption[]>()
    for (const i of items) {
      if (!i.slug) continue
      const key = i.category || 'other'
      const arr = map.get(key) ?? []
      arr.push(i)
      map.set(key, arr)
    }
    // Sort the keys by GROCERY_CATEGORY_ORDER first, alpha after.
    const sortedKeys = Array.from(map.keys()).sort((a, b) => {
      const ai = GROCERY_CATEGORY_ORDER.indexOf(a)
      const bi = GROCERY_CATEGORY_ORDER.indexOf(b)
      if (ai === -1 && bi === -1) return a.localeCompare(b)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
    return sortedKeys.map((k) => [k, map.get(k)!] as const)
  }, [items])

  const toggleCategory = (key: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const addToCart = (item: GroceryItemOption) => {
    if (!item.slug) return
    setCart((prev) => {
      const next = new Map(prev)
      const existing = next.get(item.slug!)
      next.set(item.slug!, {
        slug: item.slug!,
        name_en: item.name_en,
        name_es: item.name_es,
        brand: item.brand,
        category: item.category,
        qty: existing ? existing.qty + 1 : 1,
        unit: existing?.unit ?? item.defaultUnit ?? null,
        note: existing?.note ?? null,
      })
      return next
    })
  }

  const setQty = (slug: string, qty: number) => {
    setCart((prev) => {
      const next = new Map(prev)
      const existing = next.get(slug)
      if (!existing) return prev
      if (qty <= 0) {
        next.delete(slug)
      } else {
        next.set(slug, { ...existing, qty })
      }
      return next
    })
  }

  const setNote = (slug: string, note: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      const existing = next.get(slug)
      if (!existing) return prev
      next.set(slug, { ...existing, note: note || null })
      return next
    })
  }

  const removeFromCart = (slug: string) => {
    setCart((prev) => {
      const next = new Map(prev)
      next.delete(slug)
      return next
    })
  }

  const cartArr = useMemo(() => Array.from(cart.values()), [cart])
  const totalCount = useMemo(
    () => cartArr.reduce((sum, l) => sum + l.qty, 0),
    [cartArr]
  )

  const submit = async () => {
    if (cartArr.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/portal/bookings/${bookingId}/service-requests`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: 'GROCERY',
            items: cartArr.map((l) => ({
              slug: l.slug,
              qty: l.qty,
              unit: l.unit,
              note: l.note,
            })),
            preferredDate: preferredDate || null,
            preferredTime: preferredTime || null,
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

  const itemName = (it: GroceryItemOption) =>
    locale === 'es'
      ? it.name_es || it.name_en || it.slug || ''
      : it.name_en || it.name_es || it.slug || ''

  const cartName = (l: CartLine) =>
    locale === 'es'
      ? l.name_es || l.name_en || l.slug
      : l.name_en || l.name_es || l.slug

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div className="flex items-center gap-3 min-w-0">
            {step === 'review' && (
              <button
                type="button"
                onClick={() => setStep('browse')}
                className="text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 whitespace-nowrap"
              >
                ← {t('Back', 'Atrás')}
              </button>
            )}
            <h3 className="text-lg font-light text-stone-900 tracking-tight truncate">
              {step === 'browse'
                ? t('Grocery & drinks', 'Compras y bebidas')
                : t('Confirm your list', 'Confirma tu lista')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'browse' && (
          <>
            {/* Search bar */}
            <div className="px-6 py-3 border-b border-stone-200">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t(
                    'Search 130+ items… (mango, Brugal, Presidente)',
                    'Buscar más de 130 artículos… (mango, Brugal, Presidente)'
                  )}
                  className="w-full rounded-sm border border-stone-300 pl-9 pr-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                />
              </div>
            </div>

            {/* Body — search results OR popular/categories */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              {searched ? (
                <ItemList
                  items={searched}
                  cart={cart}
                  onAdd={addToCart}
                  onSet={setQty}
                  itemName={itemName}
                  emptyText={t('No matches.', 'Sin resultados.')}
                />
              ) : (
                <>
                  {popular.length > 0 && (
                    <Section
                      open={popularTab}
                      onToggle={() => setPopularTab((v) => !v)}
                      title={
                        <span className="inline-flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          {t('Popular', 'Populares')}
                        </span>
                      }
                      count={popular.length}
                    >
                      <ItemList
                        items={popular}
                        cart={cart}
                        onAdd={addToCart}
                        onSet={setQty}
                        itemName={itemName}
                      />
                    </Section>
                  )}

                  {grouped.map(([category, list]) => {
                    const label =
                      GROCERY_CATEGORY_LABELS[category]?.[locale] || category
                    const emoji = GROCERY_CATEGORY_LABELS[category]?.emoji
                    const open = openCategories.has(category)
                    const cartHere = list.filter(
                      (i) => i.slug && cart.has(i.slug)
                    ).length
                    return (
                      <Section
                        key={category}
                        open={open}
                        onToggle={() => toggleCategory(category)}
                        title={
                          <span className="inline-flex items-center gap-2">
                            {emoji && <span>{emoji}</span>}
                            {label}
                          </span>
                        }
                        count={list.length}
                        badge={cartHere > 0 ? cartHere : undefined}
                      >
                        <ItemList
                          items={list}
                          cart={cart}
                          onAdd={addToCart}
                          onSet={setQty}
                          itemName={itemName}
                        />
                      </Section>
                    )
                  })}
                </>
              )}
            </div>

            {/* Sticky cart footer */}
            <div className="border-t border-stone-200 px-6 py-3 flex items-center justify-between gap-4">
              <p className="text-sm font-light text-stone-700 inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-stone-500" />
                {totalCount === 0
                  ? t('Your list is empty', 'Tu lista está vacía')
                  : t(
                      `${cartArr.length} item${cartArr.length === 1 ? '' : 's'} · ${totalCount} unit${totalCount === 1 ? '' : 's'}`,
                      `${cartArr.length} artículo${cartArr.length === 1 ? '' : 's'} · ${totalCount} unidad${totalCount === 1 ? '' : 'es'}`
                    )}
              </p>
              <button
                type="button"
                onClick={() => setStep('review')}
                disabled={cartArr.length === 0}
                className="px-6 py-2 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('Review →', 'Revisar →')}
              </button>
            </div>
          </>
        )}

        {step === 'review' && (
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {cartArr.length === 0 ? (
              <p className="text-sm font-light text-stone-500">
                {t(
                  'Your list is empty. Go back and pick some items.',
                  'Tu lista está vacía. Regresa y agrega algunos artículos.'
                )}
              </p>
            ) : (
              <>
                <div className="border border-stone-200 rounded-sm divide-y divide-stone-200">
                  {cartArr.map((l) => (
                    <div key={l.slug} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-light text-stone-900">
                            {cartName(l)}
                            {l.brand && (
                              <span className="text-xs text-stone-500 ml-2">
                                · {l.brand}
                              </span>
                            )}
                          </p>
                          {l.unit && (
                            <p className="text-xs text-stone-500 font-light">
                              {l.unit}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <QtyStepper
                            qty={l.qty}
                            onChange={(q) => setQty(l.slug, q)}
                          />
                          <button
                            type="button"
                            onClick={() => removeFromCart(l.slug)}
                            className="text-xs text-stone-400 hover:text-red-600 underline underline-offset-2"
                          >
                            {t('Remove', 'Eliminar')}
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={l.note || ''}
                        onChange={(e) => setNote(l.slug, e.target.value)}
                        placeholder={t(
                          'Note for this item (optional) — e.g. "ripe", "no garlic"',
                          'Nota para este artículo (opcional) — ej. "maduro", "sin ajo"'
                        )}
                        className="mt-2 w-full rounded-sm border border-stone-200 px-2 py-1 text-xs font-light focus:outline-none focus:ring-1 focus:ring-stone-800"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label={t(
                      'Delivery date (optional)',
                      'Fecha de entrega (opcional)'
                    )}
                  >
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                    />
                  </Field>
                  <Field
                    label={t('Time (optional)', 'Hora (opcional)')}
                  >
                    <input
                      type="text"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      placeholder={t(
                        'e.g. before 6pm',
                        'ej. antes de las 6pm'
                      )}
                      className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
                    />
                  </Field>
                </div>

                <Field label={t('General notes', 'Notas generales')}>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t(
                      'Anything else? Substitutions allowed, allergies, where to leave it…',
                      '¿Algo más? Sustituciones permitidas, alergias, dónde dejarlo…'
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
                      ? t('Sending…', 'Enviando…')
                      : t('Send shopping list', 'Enviar lista de compras')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('browse')}
                    className="px-6 py-2.5 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100"
                  >
                    {t('Add more', 'Agregar más')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Subcomponents ----------

function Section({
  title,
  count,
  badge,
  open,
  onToggle,
  children,
}: {
  title: React.ReactNode
  count: number
  badge?: number
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 border border-stone-200 rounded-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-stone-50"
      >
        <span className="text-sm font-light text-stone-900">
          {title}
          <span className="text-xs text-stone-400 ml-2">{count}</span>
        </span>
        <span className="flex items-center gap-2">
          {badge !== undefined && (
            <span className="text-[10px] uppercase tracking-wider bg-stone-800 text-white px-1.5 py-0.5 rounded-sm font-light">
              {badge} in list
            </span>
          )}
          <span className="text-xs text-stone-500">{open ? '−' : '+'}</span>
        </span>
      </button>
      {open && <div className="border-t border-stone-200">{children}</div>}
    </div>
  )
}

function ItemList({
  items,
  cart,
  onAdd,
  onSet,
  itemName,
  emptyText,
}: {
  items: GroceryItemOption[]
  cart: Map<string, { qty: number }>
  onAdd: (i: GroceryItemOption) => void
  onSet: (slug: string, qty: number) => void
  itemName: (i: GroceryItemOption) => string
  emptyText?: string
}) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-3 text-xs font-light text-stone-500">
        {emptyText ?? '—'}
      </p>
    )
  }
  return (
    <ul className="divide-y divide-stone-100">
      {items.map((i) => {
        if (!i.slug) return null
        const inCart = cart.get(i.slug)
        return (
          <li
            key={i._id}
            className="px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-stone-50"
          >
            <div className="min-w-0">
              <p className="text-sm font-light text-stone-900 truncate">
                {itemName(i)}
                {i.brand && (
                  <span className="text-xs text-stone-500 ml-1.5">
                    · {i.brand}
                  </span>
                )}
              </p>
              {i.defaultUnit && (
                <p className="text-[11px] text-stone-400 font-light">
                  per {i.defaultUnit}
                </p>
              )}
            </div>
            {inCart ? (
              <QtyStepper qty={inCart.qty} onChange={(q) => onSet(i.slug!, q)} />
            ) : (
              <button
                type="button"
                onClick={() => onAdd(i)}
                className="inline-flex items-center gap-1 px-3 py-1 border border-stone-300 text-xs font-light rounded-sm hover:border-stone-800 hover:bg-stone-50"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function QtyStepper({
  qty,
  onChange,
}: {
  qty: number
  onChange: (q: number) => void
}) {
  return (
    <div className="inline-flex items-center border border-stone-300 rounded-sm">
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        className="px-2 py-1 hover:bg-stone-100"
        aria-label="Decrease"
      >
        <Minus className="w-3 h-3" />
      </button>
      <input
        type="number"
        value={qty}
        min={1}
        max={999}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (Number.isFinite(n)) onChange(n)
        }}
        className="w-10 text-center text-sm font-light bg-transparent focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        className="px-2 py-1 hover:bg-stone-100"
        aria-label="Increase"
      >
        <Plus className="w-3 h-3" />
      </button>
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
