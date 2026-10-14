'use client'

import React from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import {
  Bed,
  Bath,
  Users,
  Car,
  Zap,
  Waves,
  MapPin,
  Wifi,
  Tv,
  Coffee,
  Utensils,
  Wind,
  ShieldCheck,
  Gamepad2,
  Car as CarIcon,
  Baby,
  Briefcase,
  Home,
  Trees,
  Sun,
  ChefHat,
  UserCheck,
  CookingPot,
  ConciergeBell,
  Hamburger,
  Blocks
} from 'lucide-react'
import RoomBreakdownInline from './RoomBreakdownInline'

interface AmenitiesListProps {
  amenities: {
    bedrooms?: number
    bathrooms?: number
    maxGuests?: number
    squareMeters?: number
    roomBreakdown?: Array<{
      roomName_en: string
      roomName_es: string
      floor?: string
      bathrooms?: number
      beds: Array<{
        bedType: 'king' | 'queen' | 'full' | 'twin' | 'bunk' | 'sofa' | 'crib'
        quantity: number
      }>
    }>
    hasGolfCart?: boolean
    hasGolfCartAdditionalCost?: boolean
    /** '4' or '6' (passenger capacity of the included cart). */
    golfCartCapacity?: '4' | '6' | null
    hasGenerator?: boolean
    hasPool?: boolean
    hasBeachAccess?: boolean
    hasGym?: boolean
    hasAirConditioning?: boolean
    hasHeating?: boolean
    hasCeilingFans?: boolean
    hasFullKitchen?: boolean
    hasDishwasher?: boolean
    hasCoffeeMaker?: boolean
    hasWifi?: boolean
    hasCableTV?: boolean
    hasSmartTV?: boolean
    hasGameRoom?: boolean
    hasBBQ?: boolean
    hasGarden?: boolean
    hasTerrace?: boolean
    hasOutdoorShower?: boolean
    hasParking?: boolean
    parkingSpaces?: number
    hasSecuritySystem?: boolean
    hasSecurity?: boolean
    // Staff/service availability: 'included' | 'onRequest' | undefined.
    // The empty string is permitted because Sanity may persist it briefly
    // when a radio option is cleared.
    hasHousekeeping?: 'included' | 'onRequest' | '' | null
    hasChef?: 'included' | 'onRequest' | '' | null
    hasCook?: 'included' | 'onRequest' | '' | null
    hasCookHousekeeper?: 'included' | 'onRequest' | '' | null
    hasButler?: 'included' | 'onRequest' | '' | null
    hasWasher?: boolean
    hasDryer?: boolean
    isWheelchairAccessible?: boolean
    hasElevator?: boolean
    hasCrib?: boolean
    hasHighChair?: boolean
    hasChildSafety?: boolean
    hasPlayground?: boolean
    hasWorkspace?: boolean
    hasHighSpeedInternet?: boolean
    customAmenities?: Array<{
      name_en: string
      name_es: string
      icon?: string
    }>
  }
  className?: string
  /** Optional slot rendered between the Key Facts grid and the Room
   *  Breakdown — used by the property page to drop Leticia's
   *  Recommendation directly under the headline stats. */
  afterKeyFacts?: React.ReactNode
}

export default function AmenitiesList({ amenities, className = "", afterKeyFacts }: AmenitiesListProps) {
  const { locale, t } = useLocale()

  // Check if room breakdown is available (rendered inline below Key Facts)
  const hasRoomBreakdown = amenities.roomBreakdown && amenities.roomBreakdown.length > 0

  // Key facts (numbers)
  const keyFacts = [
    {
      icon: Bed,
      label: t({ en: 'Bedrooms', es: 'Habitaciones' }),
      value: amenities.bedrooms,
    },
    {
      icon: Bath,
      label: t({ en: 'Bathrooms', es: 'Baños' }),
      value: amenities.bathrooms
    },
    {
      icon: Users,
      label: t({ en: 'Max Guests', es: 'Huéspedes Max' }),
      value: amenities.maxGuests
    },
    {
      icon: Home,
      label: t({ en: 'Square Meters', es: 'Metros Cuadrados' }),
      value: amenities.squareMeters
    }
  ].filter(fact => fact.value)

  // Amenity categories
  const amenityCategories = [
    {
      title: t({ en: 'Premium Features', es: 'Características Premium' }),
      items: [
        { key: 'hasGolfCart', icon: Car, label: t({ en: 'Golf Cart', es: 'Carrito de Golf' }) },
        { key: 'hasGolfCartAdditionalCost', icon: Car, label: t({ en: 'Golf Cart', es: 'Carrito de Golf' }) },
        { key: 'hasGenerator', icon: Zap, label: t({ en: 'Generator', es: 'Generador' }) },
        { key: 'hasPool', icon: Waves, label: t({ en: 'Pool', es: 'Piscina' }) },
        { key: 'hasBeachAccess', icon: MapPin, label: t({ en: 'Beach Access', es: 'Acceso a Playa' }) },
        { key: 'hasGym', icon: Users, label: t({ en: 'Gym', es: 'Gimnasio' }) },
      ]
    },
    {
      title: t({ en: 'Climate & Comfort', es: 'Clima y Comodidad' }),
      items: [
        { key: 'hasAirConditioning', icon: Wind, label: t({ en: 'Air Conditioning', es: 'Aire Acondicionado' }) },
        { key: 'hasHeating', icon: Sun, label: t({ en: 'Heating', es: 'Calefacción' }) },
        { key: 'hasCeilingFans', icon: Wind, label: t({ en: 'Ceiling Fans', es: 'Ventiladores de Techo' }) },
      ]
    },
    {
      title: t({ en: 'Kitchen & Dining', es: 'Cocina y Comedor' }),
      items: [
        { key: 'hasFullKitchen', icon: Utensils, label: t({ en: 'Full Kitchen', es: 'Cocina Completa' }) },
        { key: 'hasDishwasher', icon: Utensils, label: t({ en: 'Dishwasher', es: 'Lavavajillas' }) },
        { key: 'hasCoffeeMaker', icon: Coffee, label: t({ en: 'Coffee Maker', es: 'Cafetera' }) },
      ]
    },
    {
      title: t({ en: 'Entertainment', es: 'Entretenimiento' }),
      items: [
        { key: 'hasWifi', icon: Wifi, label: t({ en: 'WiFi', es: 'WiFi' }) },
        { key: 'hasCableTV', icon: Tv, label: t({ en: 'Cable TV', es: 'TV por Cable' }) },
        { key: 'hasSmartTV', icon: Tv, label: t({ en: 'Smart TV', es: 'TV Inteligente' }) },
        { key: 'hasGameRoom', icon: Gamepad2, label: t({ en: 'Game Room', es: 'Sala de Juegos' }) },
      ]
    },
    {
      title: t({ en: 'Outdoor', es: 'Exterior' }),
      items: [
        { key: 'hasBBQ', icon: Hamburger, label: t({ en: 'BBQ', es: 'Parrilla' }) },
        { key: 'hasGarden', icon: Trees, label: t({ en: 'Garden', es: 'Jardín' }) },
        { key: 'hasTerrace', icon: Home, label: t({ en: 'Terrace', es: 'Terraza' }) },
        { key: 'hasOutdoorShower', icon: Bath, label: t({ en: 'Outdoor Shower', es: 'Ducha Exterior' }) },
      ]
    },
    {
      title: t({ en: 'Services & Security', es: 'Servicios y Seguridad' }),
      items: [
        {
          key: 'hasParking',
          icon: CarIcon,
          label: amenities.parkingSpaces
            ? t({ en: `Parking (${amenities.parkingSpaces} spaces)`, es: `Estacionamiento (${amenities.parkingSpaces} espacios)` })
            : t({ en: 'Parking', es: 'Estacionamiento' })
        },
        { key: 'hasSecuritySystem', icon: ShieldCheck, label: t({ en: 'Security System', es: 'Sistema de Seguridad' }) },
        { key: 'hasSecurity', icon: ShieldCheck, label: t({ en: 'Private Security', es: 'Seguridad Privada' }) },
      ]
    },
    {
      title: t({ en: 'Staff & Services', es: 'Personal y Servicios' }),
      items: [
        { key: 'hasHousekeeping', icon: Home, label: t({ en: 'Housekeeping', es: 'Servicio de Limpieza' }) },
        { key: 'hasChef', icon: ChefHat, label: t({ en: 'Private Chef', es: 'Chef Privado' }) },
        { key: 'hasCook', icon: CookingPot, label: t({ en: 'Cook', es: 'Cocinero' }) },
        { key: 'hasCookHousekeeper', icon: UserCheck, label: t({ en: 'Cook / Housekeeper', es: 'Cocinero / Ama de Llaves' }) },
        { key: 'hasButler', icon: ConciergeBell, label: t({ en: 'Butler', es: 'Mayordomo' }) },
      ]
    },
    {
      title: t({ en: 'Family', es: 'Familiar' }),
      items: [
        { key: 'hasCrib', icon: Baby, label: t({ en: 'Baby Crib', es: 'Cuna' }) },
        { key: 'hasHighChair', icon: Baby, label: t({ en: 'High Chair', es: 'Silla Alta' }) },
        { key: 'hasChildSafety', icon: ShieldCheck, label: t({ en: 'Child Safety', es: 'Seguridad Infantil' }) },
        { key: 'hasPlayground', icon: Blocks, label: t({ en: 'Kids Playground', es: 'Parque Infantil' }) },
      ]
    },
    {
      title: t({ en: 'Work', es: 'Trabajo' }),
      items: [
        { key: 'hasWorkspace', icon: Briefcase, label: t({ en: 'Workspace', es: 'Espacio de Trabajo' }) },
        { key: 'hasHighSpeedInternet', icon: Wifi, label: t({ en: 'High-Speed Internet', es: 'Internet de Alta Velocidad' }) },
      ]
    }
  ]

  return (
    <div className={className}>
      {/* Key Facts — clean editorial row: serif value over an eyebrow label,
          separated by hairlines. No boxes, no icons. */}
      {keyFacts.length > 0 && (
        <div className="mb-10 flex flex-wrap border-y border-line divide-x divide-line">
          {keyFacts.map((fact, index) => (
            <div key={index} className="flex flex-col gap-1 px-6 py-5 first:pl-0">
              <span className="font-serif text-2xl text-ink leading-none">{fact.value}</span>
              <span className="eyebrow">{fact.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Optional slot — sits right below Key Facts. The property page
          uses this to drop in Leticia's Recommendation. */}
      {afterKeyFacts && <div className="mb-12">{afterKeyFacts}</div>}

      {/* Room Breakdown — rendered inline directly under Key Facts so
          renters don't have to click to discover sleeping arrangements. */}
      {hasRoomBreakdown && (
        <RoomBreakdownInline rooms={amenities.roomBreakdown!} />
      )}

      {/* Amenities by Category — condensed to a 3-column dot grid so the
          section stays compact. */}
      <div className="space-y-6">
        {amenityCategories.map((category, categoryIndex) => {
          const availableItems = category.items.filter(item =>
            amenities[item.key as keyof typeof amenities]
          )

          if (availableItems.length === 0) return null

          return (
            <div key={categoryIndex} className="relative">
              <h4 className="eyebrow mb-3">{category.title}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1">
                {availableItems.map((item, itemIndex) => {
                  // Staff fields hold a string ('included' | 'onRequest')
                  // instead of a boolean. 'onRequest' means it can be
                  // arranged for an additional cost — tag the row so it's
                  // clear it isn't bundled with the rental.
                  const value = amenities[item.key as keyof typeof amenities]
                  const availabilityTag =
                    value === 'onRequest'
                      ? t({ en: 'On request · additional cost', es: 'Bajo petición · costo adicional' })
                      : item.key === 'hasGolfCartAdditionalCost'
                        ? t({ en: 'Additional cost', es: 'Costo adicional' })
                        : null
                  // Show the cart's seating capacity inline on either Golf
                  // Cart row when set — "4-seater" / "6-seater".
                  const isGolfCart =
                    item.key === 'hasGolfCart' || item.key === 'hasGolfCartAdditionalCost'
                  const cartCapacity = isGolfCart ? amenities.golfCartCapacity : null
                  return (
                    <div key={itemIndex} className="flex items-center gap-3 py-2 text-[15px] font-light text-body-strong">
                      <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full bg-brand" />
                      <span>
                        {item.label}
                        {cartCapacity && (
                          <span className="text-muted-2 ml-1.5">
                            · {t({
                              en: `${cartCapacity}-seater`,
                              es: `${cartCapacity} plazas`,
                            })}
                          </span>
                        )}
                      </span>
                      {availabilityTag && (
                        <span className="ml-auto text-xs text-muted-2 italic">
                          {availabilityTag}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Custom Amenities */}
        {amenities.customAmenities && amenities.customAmenities.length > 0 && (
          <div className="relative">
            <h4 className="eyebrow mb-3">
              {t({ en: 'Additional Amenities', es: 'Amenidades Adicionales' })}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1">
              {amenities.customAmenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3 py-2 text-[15px] font-light text-body-strong">
                  <span aria-hidden="true" className="size-[5px] shrink-0 rounded-full bg-brand" />
                  <span>{locale === 'es' ? amenity.name_es : amenity.name_en}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}