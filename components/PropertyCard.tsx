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
      "group overflow-hidden hover:shadow-xl transition-all duration-300 border-0",
      className
    )}>
      <div 
        className="relative aspect-[4/3] overflow-hidden bg-slate-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/property/${property.slug}`}>
          {allImages.length > 0 ? (
            allImages.map((image, index) => (
              <Image
                key={index}
                src={urlFor(image).width(800).height(600).url()}
                alt={`${title} - Image ${index + 1}`}
                fill
                className={cn(
                  "object-cover transition-all duration-500",
                  index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ))
          ) : (
            <div className="absolute inset-0 bg-slate-100" />
          )}
        </Link>
        
        {/* Navigation arrows - only show if multiple images */}
        {allImages.length > 1 && isHovered && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-lg z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-slate-800" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-lg z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-slate-800" />
            </button>
          </>
        )}
        
        {/* Pagination dots - show on hover if multiple images */}
        {allImages.length > 1 && isHovered && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={handleDotClick(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentImageIndex 
                    ? "bg-white w-6" 
                    : "bg-white/60 hover:bg-white/80"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
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