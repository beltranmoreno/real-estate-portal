'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Property } from '@/lib/types'
import { useLocale } from '@/contexts/LocaleContext'
import { X, Bed, Bath, Users, Car, Zap, MapPin, ArrowRight } from 'lucide-react'

interface PropertyDrawerProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

export default function PropertyDrawer({
  property,
  isOpen,
  onClose,
  className = ""
}: PropertyDrawerProps) {
  const { locale, t } = useLocale()

  if (!property) return null

  const formatPrice = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0
      }).format(amount)
    } catch (error) {
      return `$${amount.toLocaleString()}`
    }
  }

  const getMinPrice = () => {
    if (!property.pricing?.seasons || property.pricing.seasons.length === 0) {
      return null
    }
    
    const prices = property.pricing.seasons.map(season => season.nightly_rate).filter(Boolean)
    return prices.length > 0 ? Math.min(...prices) : null
  }

  const minPrice = getMinPrice()
  const title = locale === 'es' ? property.title_es : property.title_en
  const description = locale === 'es' ? property.description_es : property.description_en

  return (
    <>
      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className={`absolute bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-stone-200/50 rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden transform transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200/50 bg-white/60 backdrop-blur-sm">
            <h3 className="font-light text-lg text-stone-900 tracking-wide">
              {t({ en: 'Property Details', es: 'Detalles de Propiedad' })}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-100/60 border border-stone-200/30 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            <PropertyContent 
              property={property} 
              locale={locale}
              t={t}
              title={title}
              description={description || ''}
              minPrice={minPrice}
              formatPrice={formatPrice}
            />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block absolute top-4 left-4 w-96 bg-white/95 backdrop-blur-xl border border-stone-200/50 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 ${
        isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      } ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200/50 bg-white/60 backdrop-blur-sm">
          <h3 className="font-light text-lg text-stone-900 tracking-wide">
            {t({ en: 'Property Details', es: 'Detalles de Propiedad' })}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-100/60 border border-stone-200/30 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[calc(80vh-80px)] overflow-y-auto">
          <PropertyContent 
            property={property} 
            locale={locale}
            t={t}
            title={title}
            description={description || ''}
            minPrice={minPrice}
            formatPrice={formatPrice}
          />
        </div>
      </div>
    </>
  )
}

function PropertyContent({ 
  property, 
  locale, 
  t, 
  title, 
  description, 
  minPrice, 
  formatPrice 
}: {
  property: Property
  locale: string
  t: any
  title: string
  description: string
  minPrice: number | null
  formatPrice: (amount: number, currency: string) => string
}) {
  return (
    <div className="space-y-4">
      {/* Image */}
      {property.images && property.images.length > 0 && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden">
          <Image
            src={property.images[0].url}
            alt={title || 'Property'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
          />
          {property.themes && property.themes.length > 0 && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/90 text-white border-0 backdrop-blur-sm">
                {locale === 'es' ? property.themes[0].name_es : property.themes[0].name_en}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Title and Price */}
      <div>
        <h4 className="text-xl font-light text-stone-900 mb-2 tracking-wide leading-tight">
          {title}
        </h4>
        {minPrice && (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-light text-stone-900">
              {formatPrice(minPrice, property.pricing?.currency || 'USD')}
            </span>
            <span className="text-sm text-stone-600">
              {t({ en: 'per night', es: 'por noche' })}
            </span>
          </div>
        )}
      </div>

      {/* Key Info */}
      <div className="flex items-center gap-4 py-3 border-y border-stone-200/50">
        {property.amenities?.bedrooms && (
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-stone-600" />
            <span className="text-sm text-stone-700">
              {property.amenities.bedrooms}
            </span>
          </div>
        )}
        {property.amenities?.bathrooms && (
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-stone-600" />
            <span className="text-sm text-stone-700">
              {property.amenities.bathrooms}
            </span>
          </div>
        )}
        {property.amenities?.maxGuests && (
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-stone-600" />
            <span className="text-sm text-stone-700">
              {property.amenities.maxGuests}
            </span>
          </div>
        )}
      </div>

      {/* Amenities Badges */}
      <div className="flex flex-wrap gap-2">
        {property.amenities?.hasGolfCart && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50/80 border border-teal-200/50 text-teal-800">
            <Car className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {t({ en: 'Golf Cart', es: 'Carrito' })}
            </span>
          </span>
        )}
        {property.amenities?.hasGenerator && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50/80 border border-slate-200/50 text-slate-700">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {t({ en: 'Generator', es: 'Generador' })}
            </span>
          </span>
        )}
      </div>

      {/* Location */}
      {property.location?.area && (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-stone-600 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-stone-700">
            {locale === 'es' ? property.location.area.name_es : property.location.area.name_en}
          </span>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-stone-600 leading-relaxed line-clamp-3">
          {description}
        </p>
      )}

      {/* View Details Button */}
      <Link
        href={`/property/${property.slug}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white font-light rounded-lg hover:bg-slate-700 transition-all duration-300 shadow-sm hover:shadow-md w-full justify-center"
      >
        {t({ en: 'View Details', es: 'Ver Detalles' })}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}