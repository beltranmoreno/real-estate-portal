'use client'

import { useState } from 'react'
import type { GroceryLineItem } from '@/lib/portal/groceryItems.types'
import { GROCERY_CATEGORY_LABELS } from '@/lib/portal/groceryItems.types'

interface Props {
  items: GroceryLineItem[]
}

/**
 * Admin view of a grocery list. Groups by category and shows the qty +
 * unit + brand + per-line note. Defaults to collapsed since lists can
 * run long; click to expand.
 */
export function GroceryItemsList({ items }: Props) {
  const [expanded, setExpanded] = useState(false)
  if (!items || items.length === 0) return null

  // Group by category for the admin view (mirrors how the renter
  // built the list).
  const byCategory = new Map<string, GroceryLineItem[]>()
  for (const i of items) {
    const key = i.category || 'other'
    const arr = byCategory.get(key) ?? []
    arr.push(i)
    byCategory.set(key, arr)
  }

  return (
    <div className="mt-3 border border-stone-200 rounded-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-stone-50"
      >
        <span className="text-sm font-light text-stone-900">
          Shopping list ({items.length} item{items.length === 1 ? '' : 's'})
        </span>
        <span className="text-xs text-stone-500">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="border-t border-stone-200 divide-y divide-stone-100">
          {Array.from(byCategory.entries()).map(([category, list]) => (
            <div key={category} className="px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mb-2">
                {GROCERY_CATEGORY_LABELS[category]?.en || category}
              </p>
              <ul className="space-y-1">
                {list.map((l, i) => (
                  <li
                    key={`${l.slug}-${i}`}
                    className="text-sm font-light text-stone-800 flex justify-between gap-3"
                  >
                    <span className="min-w-0 truncate">
                      {l.name_en || l.name_es || l.slug}
                      {l.brand && (
                        <span className="text-xs text-stone-500 ml-1.5">
                          · {l.brand}
                        </span>
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
                        <span className="text-xs text-stone-400 ml-1">
                          {l.unit}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
