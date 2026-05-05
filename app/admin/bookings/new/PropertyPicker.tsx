'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Check } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import type { PropertyOption } from '@/lib/portal/properties'

interface Props {
  properties: PropertyOption[]
  value: string
  onChange: (id: string) => void
  required?: boolean
}

/**
 * Custom property picker for the new-booking form. Native <select>
 * can't render images in options, so this is a button that opens a
 * scrollable card list. Each card shows the main image alongside the
 * title, code, and status — making it easy to spot the right home
 * even when titles are similar.
 */
export function PropertyPicker({ properties, value, onChange, required }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = properties.find((p) => p._id === value) ?? null

  // Close on click-outside / Esc.
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input keeps the form's `required` semantics working */}
      <input
        type="hidden"
        name="propertySanityId"
        value={value}
        required={required}
      />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-sm border border-stone-300 bg-white pl-1.5 pr-3 py-1.5 text-left focus:outline-none focus:ring-2 focus:ring-stone-800 hover:bg-stone-50 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <PropertyRow property={selected} compact />
        ) : (
          <span className="text-sm font-light text-stone-500 px-1.5 py-1">
            Select a property
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-stone-500 transition-transform shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 mt-1 z-20 max-h-96 overflow-y-auto bg-white border border-stone-200 rounded-sm shadow-lg"
          role="listbox"
        >
          {properties.length === 0 ? (
            <p className="p-4 text-sm font-light text-stone-500">
              No properties found.
            </p>
          ) : (
            <ul>
              {properties.map((p) => {
                const isSelected = p._id === value
                return (
                  <li key={p._id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(p._id)
                        setOpen(false)
                      }}
                      className={`w-full text-left px-1.5 py-1.5 hover:bg-stone-50 transition-colors flex items-center gap-3 ${
                        isSelected ? 'bg-stone-50' : ''
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <PropertyRow property={p} />
                      {isSelected && (
                        <Check className="w-4 h-4 text-stone-700 shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Visual row used for both the trigger (selected state) and the dropdown
 * options. `compact` is a hair smaller — fits the trigger's height.
 */
function PropertyRow({
  property,
  compact = false,
}: {
  property: PropertyOption
  compact?: boolean
}) {
  const title =
    property.title_en ||
    property.title_es ||
    property.propertyCode ||
    property._id
  const isPending = property.status && property.status !== 'active'
  const imgSize = compact ? { w: 60, h: 45 } : { w: 80, h: 60 }
  const imageUrl = property.mainImage
    ? urlFor(property.mainImage).width(imgSize.w * 2).height(imgSize.h * 2).url()
    : null

  return (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div
        className="relative bg-stone-100 shrink-0"
        style={{ width: imgSize.w, height: imgSize.h }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-stone-900 font-light truncate ${
            compact ? 'text-sm' : 'text-sm'
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-stone-500 font-light truncate">
          {property.propertyCode || '—'}
          {typeof property.bedrooms === 'number' && property.bedrooms > 0 && (
            <span className="ml-1.5">· {property.bedrooms} BR</span>
          )}
          {isPending && (
            <span className="ml-1.5 uppercase tracking-wider text-amber-700">
              · {property.status}
            </span>
          )}
        </p>
      </div>
    </div>
  )
}
