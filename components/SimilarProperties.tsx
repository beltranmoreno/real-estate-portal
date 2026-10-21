'use client'

import React, { useEffect, useRef, useState } from 'react'
import PropertyCard from './PropertyCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimilarPropertiesProps {
  /** Already ranked and de-duplicated on the server (see getSimilarProperties). */
  properties: any[]
  /** Lead "both" listings with their sale side when the current house is for sale. */
  mode?: 'rental' | 'sale'
  locale?: 'en' | 'es'
}

/** The single "Similar houses" rail at the bottom of a property page. */
export default function SimilarProperties({ properties, mode = 'rental', locale = 'en' }: SimilarPropertiesProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const t = (text: { en: string; es: string }) => text[locale]

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const checkScroll = () => {
      setShowLeftArrow(container.scrollLeft > 0)
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10)
    }
    checkScroll()
    container.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [properties])

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  if (properties.length === 0) return null

  return (
    <section className="py-8">
      <div className="flex items-end justify-between mb-8 border-b border-line pb-4">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">{t({ en: 'You might also like', es: 'También te puede gustar' })}</span>
          <h2 className="font-title text-2xl lg:text-3xl text-ink">
            {t({ en: 'Similar houses', es: 'Casas similares' })}
          </h2>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label={t({ en: 'Previous', es: 'Anterior' })}
            className={cn(
              'p-2 rounded-sm border transition-all',
              showLeftArrow
                ? 'border-line hover:bg-sand text-body-strong'
                : 'border-line text-faint cursor-not-allowed'
            )}
            disabled={!showLeftArrow}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label={t({ en: 'Next', es: 'Siguiente' })}
            className={cn(
              'p-2 rounded-sm border transition-all',
              showRightArrow
                ? 'border-line hover:bg-sand text-body-strong'
                : 'border-line text-faint cursor-not-allowed'
            )}
            disabled={!showRightArrow}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-auto scrollbar-hide pb-8 pt-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {properties.map((property) => (
          <div key={property._id} className="flex-none w-[300px] md:w-[320px]">
            <PropertyCard property={property} locale={locale} variant="rail" mode={mode} />
          </div>
        ))}
      </div>
    </section>
  )
}
