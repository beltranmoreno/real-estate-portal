'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Check, X } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import type { PropertyOption } from '@/lib/portal/properties'
import { tFor } from '@/lib/i18n'

interface Props {
  properties: PropertyOption[]
  value: string[]
  onChange: (ids: string[]) => void
  locale?: 'en' | 'es'
}

const titleOf = (p: PropertyOption) => p.title_en || p.title_es || p.propertyCode || p._id

/**
 * Pick several houses for an inquiry: selected houses as removable rows,
 * plus a search box that filters the full list by title or code.
 */
export function PropertyMultiPicker({ properties, value, onChange, locale = 'en' }: Props) {
  const t = tFor(locale)
  const [query, setQuery] = useState('')
  const byId = useMemo(() => new Map(properties.map((p) => [p._id, p])), [properties])
  const selected = value.map((id) => byId.get(id)).filter(Boolean) as PropertyOption[]

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return properties
      .filter((p) => `${titleOf(p)} ${p.propertyCode ?? ''}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [properties, query])

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <ul className="border border-stone-200 divide-y divide-stone-100">
          {selected.map((p) => (
            <li key={p._id} className="flex items-center gap-3 p-1.5 pr-3">
              <Thumb property={p} />
              <span className="flex-1 min-w-0 text-sm font-light text-stone-900 truncate">
                {titleOf(p)}
                <span className="text-xs text-stone-500 ml-2">{p.propertyCode}</span>
              </span>
              <button
                type="button"
                onClick={() => toggle(p._id)}
                aria-label={t('Remove', 'Quitar')}
                className="p-1 text-stone-400 hover:text-stone-900"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('Search houses by name or code…', 'Buscar casas por nombre o código…')}
          className="w-full rounded-sm border border-stone-300 px-3 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-stone-800"
        />
        {matches.length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 z-20 max-h-80 overflow-y-auto bg-white border border-stone-200 rounded-sm shadow-lg">
            {matches.map((p) => {
              const isSelected = value.includes(p._id)
              return (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => {
                      toggle(p._id)
                      setQuery('')
                    }}
                    className={`w-full text-left p-1.5 pr-3 flex items-center gap-3 hover:bg-stone-50 ${isSelected ? 'bg-stone-50' : ''}`}
                  >
                    <Thumb property={p} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-light text-stone-900 truncate">{titleOf(p)}</span>
                      <span className="block text-xs text-stone-500 font-light">
                        {p.propertyCode || '—'}
                        {typeof p.bedrooms === 'number' && p.bedrooms > 0 && ` · ${p.bedrooms} BR`}
                        {p.status && p.status !== 'active' && ` · ${p.status}`}
                      </span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-stone-700" />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function Thumb({ property }: { property: PropertyOption }) {
  const src = property.mainImage ? urlFor(property.mainImage).width(120).height(90).url() : null
  return (
    <div className="relative w-[60px] h-[45px] bg-stone-100 shrink-0">
      {src && <Image src={src} alt="" fill sizes="60px" className="object-cover" />}
    </div>
  )
}
