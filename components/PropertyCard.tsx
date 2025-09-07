'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bed, 
  Bath, 
  Users, 
  MapPin, 
  Car, 
  Zap,
  Waves,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { urlFor } from '@/sanity/lib/image'

interface PropertyCardProps {
  property: {
    _id: string
    slug: string
    title_es: string
    title_en: string
    shortDescription_es?: string
    shortDescription_en?: string
    mainImage: any
    area?: {
      title_es: string
      title_en: string
      slug: string
    }
    bedrooms: number
    bathrooms: number
    maxGuests: number
    hasGolfCart?: boolean
    hasGenerator?: boolean
    hasPool?: boolean
    hasBeachAccess?: boolean
    nightlyRate?: {
      amount: number
      currency: string
    }
    salePrice?: {
      amount: number
      currency: string
    }
    listingType: 'rental' | 'sale' | 'both'
    isFeatured?: boolean
    themes?: string[]
  }
  locale?: 'es' | 'en'
  className?: string
  onFavorite?: (id: string) => void
  isFavorited?: boolean
}

export default function PropertyCard({
  property,
  locale = 'en',
  className,
  onFavorite,
  isFavorited = false
}: PropertyCardProps) {
  const title = locale === 'es' ? property.title_es : property.title_en
  const areaTitle = property.area 
    ? (locale === 'es' ? property.area.title_es : property.area.title_en)
    : ''

  const formatPrice = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    return formatter.format(amount)
  }

  const getPriceDisplay = () => {
    if (property.listingType === 'sale' && property.salePrice) {
      return formatPrice(property.salePrice.amount, property.salePrice.currency)
    }
    if (property.nightlyRate) {
      const price = formatPrice(property.nightlyRate.amount, property.nightlyRate.currency)
      return (
        <>
          {price} <span className="text-sm font-normal text-slate-500">/ {locale === 'es' ? 'noche' : 'night'}</span>
        </>
      )
    }
    return null
  }

  const amenityIcons = [
    { condition: property.hasGolfCart, icon: Car, label: 'Golf Cart' },
    { condition: property.hasGenerator, icon: Zap, label: 'Generator' },
    { condition: property.hasPool, icon: Waves, label: 'Pool' },
    { condition: property.hasBeachAccess, icon: MapPin, label: 'Beach' },
  ].filter(item => item.condition)

  return (
    <Card className={cn(
      "group overflow-hidden hover:shadow-xl transition-all duration-300 border-0",
      className
    )}>
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Link href={`/property/${property.slug}`}>
          <Image
            src={urlFor(property.mainImage).width(800).height(600).url()}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.isFeatured && (
            <Badge variant="default" className="bg-amber-500 border-amber-500">
              {locale === 'es' ? 'Destacado' : 'Featured'}
            </Badge>
          )}
          {property.listingType === 'sale' && (
            <Badge variant="destructive">
              {locale === 'es' ? 'Venta' : 'For Sale'}
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault()
              onFavorite(property._id)
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
            aria-label="Add to favorites"
          >
            <Heart 
              className={cn(
                "w-5 h-5 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-slate-600"
              )} 
            />
          </button>
        )}

        {/* Quick amenities */}
        {amenityIcons.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {amenityIcons.map((item, index) => (
              <div
                key={index}
                className="p-1.5 rounded-md bg-white/90 backdrop-blur-sm"
                title={item.label}
              >
                <item.icon className="w-4 h-4 text-slate-700" />
              </div>
            ))}
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <Link href={`/property/${property.slug}`} className="space-y-3">
          {/* Location */}
          {areaTitle && (
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="w-4 h-4" />
              <span>{areaTitle}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{property.maxGuests}</span>
            </div>
          </div>

          {/* Price */}
          {getPriceDisplay() && (
            <div className="pt-3 border-t">
              <p className="text-xl font-bold text-slate-900">
                {getPriceDisplay()}
              </p>
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  )
}