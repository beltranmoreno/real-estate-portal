'use client'

import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import PropertyCard from './PropertyCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SameBedroomPropertiesProps {
  currentPropertyId: string
  bedrooms: number
  listingType: string
  locale?: 'en' | 'es'
}

export default function SameBedroomProperties({
  currentPropertyId,
  bedrooms,
  listingType = 'rental',
  locale = 'en'
}: SameBedroomPropertiesProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const t = (text: { en: string; es: string }) => text[locale]

  const { data, isLoading } = useSWR<{ properties: any[] }>(
    `/api/search?exactBedrooms=${bedrooms}&listingType=${listingType}&limit=8`
  )
  const properties = (data?.properties ?? []).filter((p: any) => p._id !== currentPropertyId)

  useEffect(() => {
    const checkScroll = () => {
      const container = document.getElementById(`bedroom-scroll-${bedrooms}`)
      if (container) {
        setShowLeftArrow(container.scrollLeft > 0)
        setShowRightArrow(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        )
      }
    }

    const container = document.getElementById(`bedroom-scroll-${bedrooms}`)
    if (container) {
      container.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [properties, bedrooms])

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`bedroom-scroll-${bedrooms}`)
    if (container) {
      const cardWidth = 320
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-sand rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] bg-sand"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (properties.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-8 border-b border-line pb-4">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">
            {t({ en: 'Similar sizes', es: 'Tamaños similares' })}
          </span>
          <h2 className="font-title text-2xl lg:text-3xl text-ink">
            {t({
              en: `Other ${bedrooms} bedroom houses`,
              es: `Otras casas de ${bedrooms} ${bedrooms === 1 ? 'habitación' : 'habitaciones'}`
            })}
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className={cn(
              "p-2 rounded-sm border transition-all",
              showLeftArrow
                ? "border-line hover:bg-sand text-body-strong"
                : "border-line text-faint cursor-not-allowed"
            )}
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={cn(
              "p-2 rounded-sm border transition-all",
              showRightArrow
                ? "border-line hover:bg-sand text-body-strong"
                : "border-line text-faint cursor-not-allowed"
            )}
            disabled={!showRightArrow}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Properties Carousel */}
      <div className="relative">
        <div
          id={`bedroom-scroll-${bedrooms}`}
          className="flex gap-6 overflow-auto scrollbar-hide pb-8 pt-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.map((property) => (
            <div key={property._id} className="flex-none w-[300px] md:w-[320px]">
              <PropertyCard property={property} locale={locale} variant="rail" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}