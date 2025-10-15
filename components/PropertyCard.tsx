'use client'

import React, { useState } from 'react'
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
  Heart,
  ChevronLeft,
  ChevronRight
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
    gallery?: any[]
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
    priceOnRequest?: boolean
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const title = locale === 'es' ? property.title_es : property.title_en
  const areaTitle = property.area
    ? (locale === 'es' ? property.area.title_es : property.area.title_en)
    : ''

  // Combine mainImage with gallery images (up to 4 total)
  const allImages = React.useMemo(() => {
    const images = []
    if (property.mainImage) {
      images.push(property.mainImage)
    }
    if (property.gallery && property.gallery.length > 0) {
      // Add up to 3 more gallery images
      images.push(...property.gallery.slice(0, 3))
    }
    return images.slice(0, 4) // Ensure we have max 4 images
  }, [property.mainImage, property.gallery])

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
    // Check if price is on request
    if (property.priceOnRequest) {
      return (
        <div className="flex flex-col items-end text-right">
          <span className="text-xs font-light italic text-stone-700 leading-tight">
            {locale === 'es' ? 'Precio bajo consulta' : 'Price on request'}
          </span>
        </div>
      )
    }

    if (property.listingType === 'sale' && property.salePrice) {
      return formatPrice(property.salePrice.amount, property.salePrice.currency)
    }
    if (property.nightlyRate) {
      const price = formatPrice(property.nightlyRate.amount, property.nightlyRate.currency)
      return (
        <>
          {price} <span className="text-xs font-light text-stone-400">/ {locale === 'es' ? 'noche' : 'night'}</span>
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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex(index)
  }

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-500 hover:border-slate-900 bg-white/60 rounded-xs shadow-none",
      className
    )}>
      <Link href={`/property/${property.slug}`}>
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000000' stroke-width='0.3' opacity='0.05'%3E%3Cpath d='M30 10l8 8-8 8-8-8z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />

        <div
          className="relative aspect-[4/3] overflow-hidden bg-stone-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >

          {allImages.length > 0 ? (
            allImages.map((image, index) => (
              <Image
                key={index}
                src={urlFor(image).width(800).height(600).url()}
                alt={`${title} - Image ${index + 1}`}
                fill
                className={cn(
                  "object-cover transition-all duration-700",
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ))
          ) : (
            <div className="absolute inset-0 bg-stone-100" />
          )}


          {/* Elegant overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />

          {/* Navigation arrows - refined styling */}
          {allImages.length > 1 && isHovered && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-300 shadow-lg shadow-stone-900/10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-stone-700" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-300 shadow-lg shadow-stone-900/10"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-stone-700" />
              </button>
            </>
          )}

          {/* Refined pagination dots */}
          {allImages.length > 1 && isHovered && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={handleDotClick(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentImageIndex
                      ? "bg-white w-6 shadow-sm"
                      : "bg-white/60 hover:bg-white/80 w-1.5"
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Elegant badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {property.isFeatured && (
              <Badge className="bg-slate-800/90 text-white border-0 font-light text-xs px-2 py-1 backdrop-blur-sm">
                {locale === 'es' ? 'Destacado' : 'Featured'}
              </Badge>
            )}
            {property.listingType === 'sale' && (
              <Badge className="bg-slate-800/90 text-white border-0 font-light text-xs px-2 py-1 backdrop-blur-sm">
                {locale === 'es' ? 'Venta' : 'For Sale'}
              </Badge>
            )}
          </div>

          {/* Refined favorite button */}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault()
                onFavorite(property._id)
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all duration-300 shadow-sm"
              aria-label="Add to favorites"
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  isFavorited ? "fill-rose-400 text-rose-400" : "text-stone-600"
                )}
              />
            </button>
          )}

          {/* Subtle amenity indicators */}
          {amenityIcons.length > 0 && (
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {amenityIcons.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="p-1.5 rounded-lg bg-white/90 backdrop-blur-md shadow-sm"
                  title={item.label}
                >
                  <item.icon className="w-3.5 h-3.5 text-stone-600" />
                </div>
              ))}
            </div>
          )}
        </div>

        <CardContent className="p-5 relative flex flex-col gap-4">
          {/* Subtle content gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-stone-50/30 to-transparent opacity-50" />

          {/* Location with refined styling */}
          {areaTitle && (
            <div className="flex items-center gap-1.5 text-sm text-stone-500 font-light">
              <MapPin className="w-3.5 h-3.5" />
              <span>{areaTitle}</span>
            </div>
          )}

          {/* Title with elegant typography */}
          <h3 className="font-light text-lg text-stone-900 line-clamp-2 group-hover:text-stone-700 transition-colors duration-300 leading-tight">
            {title}
          </h3>

          {/* Stats and Price in same row for better hierarchy */}
          <div className="flex items-center justify-between">
            {/* Property stats */}
            <div className="flex items-center gap-4 text-sm text-stone-600">
              <div className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5" />
                <span className="font-light">{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5" />
                <span className="font-light">{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="font-light">{property.maxGuests}</span>
              </div>
            </div>

            {/* Price display */}
            {getPriceDisplay() && (
              <div className="text-right">
                {property.priceOnRequest ? (
                  getPriceDisplay()
                ) : (
                  <p className="text-sm font-medium text-stone-700">
                    {getPriceDisplay()}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}