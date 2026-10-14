'use client'

import React, { useEffect, useState } from 'react'
import SearchBar from './SearchBarWrapper'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'

export interface HeroBackground {
  type: 'image' | 'video'
  images: string[]
  videoUrl?: string | null
  overlay?: number
}

interface HeroProps {
  className?: string
  background?: HeroBackground | null
}

export default function Hero({ className, background }: HeroProps) {
  const { locale } = useLocale()
  const [mounted, setMounted] = useState(false)

  const images = background?.images ?? []
  const isVideo = background?.type === 'video' && !!background?.videoUrl
  const hasMedia = isVideo || images.length > 0
  const overlay = Math.min(70, Math.max(0, background?.overlay ?? 20)) / 100

  // Cross-fade slideshow when more than one image is configured.
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    if (images.length < 2) return
    const id = setInterval(
      () => setSlide((s) => (s + 1) % images.length),
      6000
    )
    return () => clearInterval(id)
  }, [images.length])

  useEffect(() => {
    setMounted(true)
  }, [])

  const content = {
    es: {
      eyebrow: 'Casa de Campo · La Romana',
      title: 'Una colección privada de casas en la costa más resguardada del Caribe',
      subtitle: 'Residencias conocidas personalmente, gestionadas por un equipo local.',
    },
    en: {
      eyebrow: 'Casa de Campo · La Romana',
      title: "A private collection of houses on the Caribbean's most guarded coast",
      subtitle: 'Residences known personally, arranged with a resident team.',
    },
  }[locale]

  return (
    <section data-hero className={cn("relative min-h-[90svh] sm:h-dvh sm:max-h-[760px] overflow-hidden bg-ink", className)}>
      {/* Background — CMS photo / slideshow / video, with a readability wash.
          Falls back to a warm stone field when no media is configured. */}
      <div className="absolute inset-0">
        {!hasMedia && (
          <div className="absolute inset-0 bg-gradient-to-br from-sand via-canvas to-line" />
        )}
        {isVideo ? (
          <video
            src={background!.videoUrl!}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms]',
                i === slide ? 'opacity-100' : 'opacity-0'
              )}
            />
          ))
        )}
        {hasMedia && overlay > 0 && (
          <div className="absolute inset-0 bg-ink" style={{ opacity: overlay }} />
        )}
        {/* Bottom-weighted gradient keeps the headline + search legible. */}
        {hasMedia && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
        )}
      </div>

      {/* Content — headline block above the bottom-pinned search. Top padding
          reserves the fixed navbar's height (h-20) so content never slides
          behind it when the hero grows (e.g. the search opens on mobile). */}
      <div className="relative z-10 flex h-full flex-col justify-end pt-24 sm:pt-28">
        <div className="container mx-auto px-4 pb-10 sm:pb-12 sm:mt-8">
          <div
            className={cn(
              'max-w-3xl mb-6 sm:mb-10 transform transition-all duration-1000 ease-out',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
              hasMedia ? 'text-white' : 'text-ink'
            )}
          >
            <p
              className={cn(
                'eyebrow mb-5',
                hasMedia && '!text-white/70'
              )}
            >
              {content.eyebrow}
            </p>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl">
              {content.title}
            </h1>
            {content.subtitle && (
              <p
                className={cn(
                  'mt-5 text-base sm:text-lg font-light measure-lede',
                  hasMedia ? 'text-white/85' : 'text-muted'
                )}
              >
                {content.subtitle}
              </p>
            )}
          </div>

          <div
            className={cn(
              'transform transition-all duration-1000 ease-out delay-200',
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            )}
          >
            <SearchBar variant="hero" locale={locale} allowCompact collapseOnMobile />
          </div>
        </div>
      </div>
    </section>
  )
}
