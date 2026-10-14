'use client'

import React, { useEffect, useState } from 'react'
import useSWR from 'swr'
import PropertyCard from './PropertyCard'
import { useFavorites } from '@/contexts/FavoritesContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimilarThemePropertiesProps {
  currentPropertyId: string
  themes?: string[]
  listingType: string
  locale?: 'en' | 'es'
}

const themeLabels: Record<string, { en: string; es: string }> = {
  beachfront: { en: 'Beachfront', es: 'Frente al Mar' },
  golf: { en: 'Golf', es: 'Golf' },
  family: { en: 'Family', es: 'Familiar' },
  luxury: { en: 'Luxury', es: 'Lujo' },
  events: { en: 'Events', es: 'Eventos' },
  'remote-work': { en: 'Remote Work', es: 'Trabajo Remoto' }
}

export default function SimilarThemeProperties({
  currentPropertyId,
  themes = [],
  listingType = 'rental',
  locale = 'en'
}: SimilarThemePropertiesProps) {
  const [activeTheme, setActiveTheme] = useState<string>(themes[0] || '')
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const t = (text: { en: string; es: string }) => text[locale]

  // SWR keyed on the active theme — clicking a theme pill changes the key and
  // SWR refetches (and caches each theme).
  const { data, isLoading } = useSWR<{ properties: any[] }>(
    activeTheme ? `/api/search?themes=${activeTheme}&listingType=${listingType}&limit=8` : null
  )
  const properties = (data?.properties ?? []).filter((p: any) => p._id !== currentPropertyId)

  useEffect(() => {
    const checkScroll = () => {
      const container = document.getElementById('theme-scroll')
      if (container) {
        setShowLeftArrow(container.scrollLeft > 0)
        setShowRightArrow(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        )
      }
    }

    const container = document.getElementById('theme-scroll')
    if (container) {
      container.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [properties])

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('theme-scroll')
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

  if (properties.length === 0 || themes.length === 0) {
    return null
  }

  const themeLabel = themeLabels[activeTheme] || { en: activeTheme, es: activeTheme }

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-8 border-b border-line pb-4">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">
            {t({ en: 'Nearby', es: 'Cercanas' })}
          </span>
          <h2 className="font-title text-2xl lg:text-3xl text-ink">
            {t({ en: 'Others on this stretch of coast', es: 'Otras en esta costa' })}
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className={cn(
              "p-2 rounded-[2px] border transition-all",
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
              "p-2 rounded-[2px] border transition-all",
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

      {/* Theme Pills */}
      {themes.length > 1 && (
        <div className="flex gap-2 mb-4">
          {themes.map((theme) => {
            const label = themeLabels[theme] || { en: theme, es: theme }
            return (
              <button
                key={theme}
                onClick={() => setActiveTheme(theme)}
                className={cn(
                  "px-4 py-2 rounded-[2px] text-xs uppercase tracking-[0.08em] border transition-colors",
                  activeTheme === theme
                    ? "border-ink bg-ink text-white"
                    : "border-control-border text-body-strong hover:border-ink"
                )}
              >
                {t(label)}
              </button>
            )
          })}
        </div>
      )}

      {/* Properties Carousel */}
      <div className="relative">
        <div
          id="theme-scroll"
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