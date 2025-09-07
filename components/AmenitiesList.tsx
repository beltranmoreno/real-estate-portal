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
  Sun
} from 'lucide-react'

interface AmenitiesListProps {
  amenities: {
    bedrooms?: number
    bathrooms?: number
    maxGuests?: number
    squareMeters?: number
    hasGolfCart?: boolean
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
    hasGatedCommunity?: boolean
    hasHousekeeping?: boolean
    hasConcierge?: boolean
    hasWasher?: boolean
    hasDryer?: boolean
    isWheelchairAccessible?: boolean
    hasElevator?: boolean
    hasCrib?: boolean
    hasHighChair?: boolean
    hasChildSafety?: boolean
    hasWorkspace?: boolean
    hasHighSpeedInternet?: boolean
    customAmenities?: Array<{
      name_en: string
      name_es: string
      icon?: string
    }>
  }
  className?: string
}

export default function AmenitiesList({ amenities, className = "" }: AmenitiesListProps) {
  const { locale, t } = useLocale()

  // Key facts (numbers)
  const keyFacts = [
    {
      icon: Bed,
      label: t({ en: 'Bedrooms', es: 'Habitaciones' }),
      value: amenities.bedrooms
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
        { key: 'hasBBQ', icon: Home, label: t({ en: 'BBQ', es: 'Parrilla' }) },
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
        { key: 'hasGatedCommunity', icon: ShieldCheck, label: t({ en: 'Gated Community', es: 'Comunidad Cerrada' }) },
        { key: 'hasHousekeeping', icon: Home, label: t({ en: 'Housekeeping', es: 'Servicio de Limpieza' }) },
        { key: 'hasConcierge', icon: Users, label: t({ en: 'Concierge', es: 'Conserjería' }) },
      ]
    },
    {
      title: t({ en: 'Family', es: 'Familiar' }),
      items: [
        { key: 'hasCrib', icon: Baby, label: t({ en: 'Baby Crib', es: 'Cuna' }) },
        { key: 'hasHighChair', icon: Baby, label: t({ en: 'High Chair', es: 'Silla Alta' }) },
        { key: 'hasChildSafety', icon: ShieldCheck, label: t({ en: 'Child Safety', es: 'Seguridad Infantil' }) },
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
      {/* Key Facts */}
      {keyFacts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {t({ en: 'Key Facts', es: 'Datos Clave' })}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyFacts.map((fact, index) => (
              <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                <fact.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-slate-900">{fact.value}</div>
                <div className="text-sm text-slate-600">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities by Category */}
      <div className="space-y-6">
        {amenityCategories.map((category, categoryIndex) => {
          const availableItems = category.items.filter(item => 
            amenities[item.key as keyof typeof amenities]
          )
          
          if (availableItems.length === 0) return null

          return (
            <div key={categoryIndex}>
              <h4 className="font-semibold text-slate-900 mb-3">{category.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableItems.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3 p-2">
                    <item.icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Custom Amenities */}
        {amenities.customAmenities && amenities.customAmenities.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">
              {t({ en: 'Additional Amenities', es: 'Amenidades Adicionales' })}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {amenities.customAmenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <Home className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">
                    {locale === 'es' ? amenity.name_es : amenity.name_en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}