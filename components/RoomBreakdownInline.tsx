'use client'

import React, { useState } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { Bed, BedDouble, BedSingle, Baby, Home, ChevronDown } from 'lucide-react'

interface Room {
  roomName_en: string
  roomName_es: string
  bathrooms?: number
  beds: Array<{
    bedType: 'king' | 'queen' | 'full' | 'twin' | 'bunk' | 'sofa' | 'crib'
    quantity: number
  }>
}

interface Props {
  rooms: Room[]
  /** How many rooms to show before the "Show all" toggle kicks in. */
  initialVisible?: number
  className?: string
}

/**
 * Inline room-by-room breakdown rendered directly on the property page.
 * Replaces the modal dialog so the info is visible without a click.
 *
 * Reuses the original dialog's card visual (rounded panels, per-bed icon
 * tiles with quantity badges) so it feels like the same component, just
 * surfaced. Collapsed past `initialVisible` rooms; "Show all" reveals the
 * rest in place.
 */
export default function RoomBreakdownInline({
  rooms,
  initialVisible = 2,
  className = '',
}: Props) {
  const { locale, t } = useLocale()
  const [expanded, setExpanded] = useState(false)

  if (!rooms || rooms.length === 0) return null

  const overflow = Math.max(0, rooms.length - initialVisible)
  const visibleRooms = expanded ? rooms : rooms.slice(0, initialVisible)
  const hasMore = overflow > 0

  return (
    <section className={`mb-12 ${className}`}>
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="text-xl font-light text-stone-900 tracking-wide">
          {t({
            en: 'Room & Bed Breakdown',
            es: 'Distribución de Habitaciones y Camas',
          })}
        </h3>
        <span className="text-sm font-light text-stone-500">
          {rooms.length}{' '}
          {t({
            en: rooms.length === 1 ? 'room' : 'rooms',
            es: rooms.length === 1 ? 'habitación' : 'habitaciones',
          })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleRooms.map((room, roomIndex) => (
          <RoomCard
            key={roomIndex}
            room={room}
            locale={locale}
            t={t}
          />
        ))}
      </div>

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-light text-stone-700 hover:text-stone-900 underline underline-offset-4"
        >
          {t({
            en: `Show all ${rooms.length} rooms`,
            es: `Ver las ${rooms.length} habitaciones`,
          })}
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
      {expanded && rooms.length > initialVisible && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-light text-stone-700 hover:text-stone-900 underline underline-offset-4"
        >
          {t({ en: 'Show less', es: 'Mostrar menos' })}
          <ChevronDown className="w-4 h-4 rotate-180" />
        </button>
      )}
    </section>
  )
}

// ---------- Single room card (same visual as the old dialog) ----------

function RoomCard({
  room,
  locale,
  t,
}: {
  room: Room
  locale: 'en' | 'es'
  t: (o: { en: string; es: string }) => string
}) {
  return (
    <div className="p-5 bg-stone-50/50 border border-stone-200/50 rounded-xl">
      <h4 className="text-base font-medium text-stone-900 mb-4 pb-3 border-b border-stone-200/50">
        {locale === 'es' ? room.roomName_es : room.roomName_en}
      </h4>

      <div className="space-y-4">
        <div className="space-y-3">
          {room.beds.map((bed, bedIndex) => {
            const { Icon, color, bgColor } = getBedIcon(bed.bedType)
            return (
              <div key={bedIndex} className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-xl ${bgColor} border border-stone-200/50`}
                >
                  <Icon className={`w-8 h-8 ${color}`} />
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-stone-900">
                    {getBedLabel(bed.bedType, bed.quantity, t)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {room.bathrooms !== undefined && room.bathrooms > 0 && (
          <div className="pt-3 border-t border-stone-200/30">
            <div className="text-sm text-stone-600 font-light">
              {room.bathrooms}{' '}
              {t({
                en: room.bathrooms === 1 ? 'bathroom' : 'bathrooms',
                es: room.bathrooms === 1 ? 'baño' : 'baños',
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Helpers (same mapping as the dialog) ----------

function getBedLabel(
  bedType: string,
  quantity: number,
  t: (o: { en: string; es: string }) => string
) {
  // Full noun phrase per bed type, with singular/plural variants so the
  // label reads naturally (e.g. "1 King Bed" / "2 King Beds").
  const phrases: Record<
    string,
    { one: { en: string; es: string }; many: { en: string; es: string } }
  > = {
    king: {
      one: { en: 'King Bed', es: 'Cama King' },
      many: { en: 'King Beds', es: 'Camas King' },
    },
    queen: {
      one: { en: 'Queen Bed', es: 'Cama Queen' },
      many: { en: 'Queen Beds', es: 'Camas Queen' },
    },
    full: {
      one: { en: 'Full/Double Bed', es: 'Cama Matrimonial' },
      many: { en: 'Full/Double Beds', es: 'Camas Matrimoniales' },
    },
    twin: {
      one: { en: 'Twin/Single Bed', es: 'Cama Individual' },
      many: { en: 'Twin/Single Beds', es: 'Camas Individuales' },
    },
    bunk: {
      one: { en: 'Bunk Bed', es: 'Litera' },
      many: { en: 'Bunk Beds', es: 'Literas' },
    },
    sofa: {
      one: { en: 'Sofa Bed', es: 'Sofá Cama' },
      many: { en: 'Sofa Beds', es: 'Sofás Cama' },
    },
    crib: {
      one: { en: 'Crib', es: 'Cuna' },
      many: { en: 'Cribs', es: 'Cunas' },
    },
  }
  const qty = quantity && quantity > 0 ? quantity : 1
  const entry = phrases[bedType]
  const phrase = entry
    ? qty === 1
      ? entry.one
      : entry.many
    : { en: bedType, es: bedType }
  return `${qty} ${t(phrase)}`
}

function getBedIcon(bedType: string) {
  // Unified tile background — only the icon and its tint differentiate
  // bed types so the row reads as a clean visual grid rather than a
  // mosaic of colors.
  const BG = 'bg-stone-100'
  const iconConfig: Record<
    string,
    { Icon: typeof Bed; color: string; bgColor: string }
  > = {
    king: { Icon: BedDouble, color: 'text-slate-800', bgColor: BG },
    queen: { Icon: BedDouble, color: 'text-slate-700', bgColor: BG },
    full: { Icon: BedDouble, color: 'text-slate-600', bgColor: BG },
    twin: { Icon: BedSingle, color: 'text-slate-700', bgColor: BG },
    bunk: { Icon: BedSingle, color: 'text-slate-600', bgColor: BG },
    sofa: { Icon: Home, color: 'text-slate-600', bgColor: BG },
    crib: { Icon: Baby, color: 'text-slate-500', bgColor: BG },
  }
  return (
    iconConfig[bedType] || {
      Icon: Bed,
      color: 'text-slate-700',
      bgColor: BG,
    }
  )
}
