'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { urlFor } from '@/sanity/lib/image'
import { useFavorites } from '@/contexts/FavoritesContext'

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
    hasPool?: boolean
    isBeachfront?: boolean
    isGolfCourse?: boolean
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
  /** rail = 4:3 (carousels) · grid = 3:2 (search) · compact = horizontal row */
  variant?: 'rail' | 'grid' | 'compact'
  className?: string
  onFavorite?: (id: string) => void
  isFavorited?: boolean
}

export default function PropertyCard({
  property,
  locale = 'en',
  variant = 'grid',
  className,
  onFavorite,
  isFavorited = false
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const isCompact = variant === 'compact'

  // Use internal favorites management if onFavorite prop is not provided
  const handleFavorite = (id: string) => {
    if (onFavorite) {
      onFavorite(id)
    } else {
      if (isFavorite(id)) {
        removeFavorite(id)
      } else {
        addFavorite(property)
      }
    }
  }

  // Determine if favorited: use prop if provided, otherwise check context
  const isPropertyFavorited = onFavorite !== undefined ? isFavorited : isFavorite(property._id)

  const title = locale === 'es' ? property.title_es : property.title_en
  const areaTitle = property.area
    ? (locale === 'es' ? property.area.title_es : property.area.title_en)
    : ''

  // Combine mainImage with gallery images so the card can browse the property
  // (up to 8 total).
  const allImages = React.useMemo(() => {
    const images = []
    if (property.mainImage) {
      images.push(property.mainImage)
    }
    if (property.gallery && property.gallery.length > 0) {
      images.push(...property.gallery.slice(0, 7))
    }
    return images.slice(0, 8)
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

  // True when the price shows as "on request" — either explicitly flagged or
  // because no usable price is set.
  const priceIsOnRequest =
    property.priceOnRequest ||
    !(
      (property.listingType === 'sale' &&
        typeof property.salePrice?.amount === 'number') ||
      typeof property.nightlyRate?.amount === 'number'
    )

  // Only show a price when one actually exists — no "On request" placeholder.
  let priceValue: React.ReactNode = null
  let unit = ''
  if (priceIsOnRequest) {
    priceValue = null
  } else if (property.listingType === 'sale' && typeof property.salePrice?.amount === 'number') {
    priceValue = formatPrice(property.salePrice.amount, property.salePrice.currency)
    unit = locale === 'es' ? 'en venta' : 'for sale'
  } else if (typeof property.nightlyRate?.amount === 'number') {
    priceValue = formatPrice(property.nightlyRate.amount, property.nightlyRate.currency)
    unit = locale === 'es' ? 'por noche' : 'per night'
  }

  // A single tag, at most — sale wins, then featured, then a theme.
  let tag = ''
  if (property.listingType === 'sale') tag = locale === 'es' ? 'En venta' : 'For sale'
  else if (property.isFeatured) tag = locale === 'es' ? 'Destacado' : 'Featured'
  else if (property.isBeachfront) tag = locale === 'es' ? 'Frente al mar' : 'Beachfront'
  else if (property.isGolfCourse) tag = locale === 'es' ? 'En el golf' : 'Golf view'

  const specs =
    locale === 'es'
      ? `${property.bedrooms} habitaciones · ${property.bathrooms} baños · ${property.maxGuests} huéspedes`
      : `${property.bedrooms} bedrooms · ${property.bathrooms} baths · ${property.maxGuests} guests`

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

  // Favourite mark — 44px hit target, 30px visual. Hover on desktop, always on
  // touch. Filled state is ink, never red.
  const favouriteButton = (
    <button
      onClick={(e) => {
        e.preventDefault()
        handleFavorite(property._id)
      }}
      className="absolute top-1 right-1 grid size-10 place-items-center md:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
      aria-label={
        isPropertyFavorited
          ? locale === 'es' ? 'Quitar de favoritos' : 'Remove from favourites'
          : locale === 'es' ? 'Añadir a favoritos' : 'Add to favourites'
      }
      aria-pressed={isPropertyFavorited}
    >
        <Heart
          strokeWidth={1.25}
          className={cn(
            'size-5 transition-transform duration-200 cursor-pointer',
            isPropertyFavorited ? 'fill-ink text-ink' : 'text-white'
          )}
        />
    </button>
  )

  const imageStack = (ratioClass: string) => (
    <div
      className={cn('relative overflow-hidden bg-sand', ratioClass)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {allImages.length > 0 ? (
        allImages.map((image, index) => (
          <Image
            key={index}
            src={urlFor(image).width(800).height(600).url()}
            alt={`${title} — ${index + 1}`}
            fill
            className={cn(
              'object-cover transition-opacity duration-700',
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ))
      ) : (
        <div className="absolute inset-0 bg-sand" />
      )}

      {tag && (
        <Badge variant="tag" className="absolute top-3.5 left-3.5">
          {tag}
        </Badge>
      )}

      {favouriteButton}

      {/* Carousel controls — stacked variants only, on hover */}
      {!isCompact && allImages.length > 1 && isHovered && (
        <>
          <button
            onClick={handlePrevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-surface/90 backdrop-blur-sm hover:bg-surface transition-colors"
            aria-label={locale === 'es' ? 'Imagen anterior' : 'Previous image'}
          >
            <ChevronLeft className="w-4 h-4 text-ink" />
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-surface/90 backdrop-blur-sm hover:bg-surface transition-colors"
            aria-label={locale === 'es' ? 'Imagen siguiente' : 'Next image'}
          >
            <ChevronRight className="w-4 h-4 text-ink" />
          </button>
        </>
      )}
      {/* Dots stay visible so multiple images are discoverable and tappable
          on touch (arrows are a desktop-hover enhancement). */}
      {!isCompact && allImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={handleDotClick(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === currentImageIndex ? 'bg-surface w-6' : 'bg-surface/70 hover:bg-surface/90 w-1.5'
              )}
              aria-label={`${locale === 'es' ? 'Ir a imagen' : 'Go to image'} ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )

  // ── Compact (horizontal) ────────────────────────────────────────────────
  if (isCompact) {
    return (
      <Link
        href={`/property/${property.slug}`}
        className={cn('group flex items-stretch gap-5', className)}
      >
        <div className="relative w-[180px] shrink-0 aspect-square overflow-hidden bg-sand">
          {allImages[0] ? (
            <Image
              src={urlFor(allImages[0]).width(360).height(360).url()}
              alt={title}
              fill
              className="object-cover"
              sizes="180px"
            />
          ) : (
            <div className="absolute inset-0 bg-sand" />
          )}
          {favouriteButton}
        </div>
        <div className="flex flex-col justify-center gap-2 py-2">
          <h3 className="font-serif text-[22px] leading-tight text-ink">
            {title}
          </h3>
          {areaTitle && <span className="eyebrow !tracking-[0.12em]">{areaTitle}</span>}
          <p className="text-[13px] font-light text-muted">{specs}</p>
          {priceValue && (
            <p className="font-serif text-lg text-ink">
              {priceValue}
              {unit && <span className="ml-1.5 font-sans text-xs font-light text-muted-2">{unit}</span>}
            </p>
          )}
        </div>
      </Link>
    )
  }

  // ── Stacked (rail 4:3 / grid 3:2) ───────────────────────────────────────
  const ratioClass = variant === 'rail' ? 'aspect-[4/3]' : 'aspect-[3/2]'
  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn('group block', className)}
    >
      {imageStack(ratioClass)}
      {/* Name · area · specs stay as one tight left column so a wrapping name
          never pushes them apart; the price sits in its own top-aligned
          right column. */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex flex-col gap-1">
          <span className="font-serif text-[23px] leading-tight text-ink">
            {title}
          </span>
          {areaTitle && <span className="eyebrow !tracking-[0.16em]">{areaTitle}</span>}
          <p className="mt-0.5 text-[13px] font-light text-muted">{specs}</p>
        </div>
        {priceValue && (
          <div className="shrink-0 text-right">
            <div className="font-serif text-[19px] text-ink whitespace-nowrap">
              {priceValue}
            </div>
            {unit && (
              <div className="mt-1 text-[11px] uppercase tracking-[0.1em] text-faint whitespace-nowrap">
                {unit}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
