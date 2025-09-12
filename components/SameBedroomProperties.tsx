'use client'

import React, { useEffect, useState } from 'react'
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
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const t = (text: { en: string; es: string }) => text[locale]

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`/api/search?exactBedrooms=${bedrooms}&listingType=${listingType}&limit=8`)
        const data = await response.json()
        // Filter out current property
        const filtered = data.properties?.filter((p: any) => p._id !== currentPropertyId) || []
        setProperties(filtered)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [bedrooms, currentPropertyId])

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

  if (loading) {
    return (
      <section className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-stone-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-stone-100 rounded-xl"></div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-light text-stone-900">
            {t({
              en: `Other ${bedrooms} Bedroom Properties`,
              es: `Otras Propiedades de ${bedrooms} ${bedrooms === 1 ? 'Habitación' : 'Habitaciones'}`
            })}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {t({
              en: 'Explore similar sized properties',
              es: 'Explora propiedades de tamaño similar'
            })}
          </p>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className={cn(
              "p-2 rounded-lg border transition-all",
              showLeftArrow
                ? "border-stone-300 hover:bg-stone-100 text-stone-700"
                : "border-stone-200 text-stone-300 cursor-not-allowed"
            )}
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={cn(
              "p-2 rounded-lg border transition-all",
              showRightArrow
                ? "border-stone-300 hover:bg-stone-100 text-stone-700"
                : "border-stone-200 text-stone-300 cursor-not-allowed"
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
              <PropertyCard property={property} locale={locale} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}