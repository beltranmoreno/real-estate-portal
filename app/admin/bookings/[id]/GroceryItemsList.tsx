'use client'

import { useEffect, useState } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import type { GroceryLineItem } from '@/lib/portal/groceryItems.types'
import { GROCERY_CATEGORY_LABELS } from '@/lib/portal/groceryItems.types'
import { tFor } from '@/lib/i18n'

interface Props {
  items: GroceryLineItem[]
  locale?: 'en' | 'es'
}

/**
 * Admin view of a grocery list. Opens in a modal dialog — lists can run
 * long, so we keep them out of the request row and show them full-screen
 * with a scroll area when the admin wants to read the whole thing.
 */
export function GroceryItemsList({ items, locale = 'en' }: Props) {
  const t = tFor(locale)
  const [open, setOpen] = useState(false)
  if (!items || items.length === 0) return null

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 border border-stone-300 text-stone-800 text-sm font-light rounded-sm hover:bg-stone-100 transition-colors"
      >
        <ShoppingBag className="w-4 h-4" />
        {t('Shopping list', 'Lista de compras')} ({items.length} {t('item', 'artículo')}{items.length === 1 ? '' : 's'})
      </button>
      {open && <GroceryModal items={items} onClose={() => setOpen(false)} locale={locale} />}
    </div>
  )
}

function GroceryModal({
  items,
  onClose,
  locale = 'en',
}: {
  items: GroceryLineItem[]
  onClose: () => void
  locale?: 'en' | 'es'
}) {
  const t = tFor(locale)
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  // Group by category (mirrors how the renter built the list).
  const byCategory = new Map<string, GroceryLineItem[]>()
  for (const i of items) {
    const key = i.category || 'other'
    const arr = byCategory.get(key) ?? []
    arr.push(i)
    byCategory.set(key, arr)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h3 className="text-base font-light text-stone-900 tracking-tight">
            {t('Shopping list', 'Lista de compras')}
            <span className="text-stone-400 ml-2 text-sm">
              {items.length} {t('item', 'artículo')}{items.length === 1 ? '' : 's'}
            </span>
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

        <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
          {Array.from(byCategory.entries()).map(([category, list]) => (
            <div key={category} className="px-5 py-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-2">
                {GROCERY_CATEGORY_LABELS[category]?.[locale] || category}
              </p>
              <ul className="space-y-1.5">
                {list.map((l, i) => (
                  <li
                    key={`${l.slug}-${i}`}
                    className="text-sm font-light text-stone-800 flex justify-between gap-3"
                  >
                    <span className="min-w-0">
                      {(locale === 'es' ? l.name_es || l.name_en : l.name_en || l.name_es) || l.slug}
                      {l.brand && (
                        <span className="text-xs text-stone-500 ml-1.5">· {l.brand}</span>
                      )}
                      {l.note && (
                        <span className="text-xs text-stone-400 italic ml-1.5">
                          — {l.note}
                        </span>
                      )}
                    </span>
                    <span className="text-stone-600 whitespace-nowrap text-sm">
                      ×{l.qty}
                      {l.unit && (
                        <span className="text-xs text-stone-400 ml-1">{l.unit}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
