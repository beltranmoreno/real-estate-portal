'use client'

import React, { useEffect, useState } from 'react'
import SearchBar from './SearchBarWrapper'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { HERO_TEXT_DEFAULTS } from '@/sanity/lib/heroDefaults'

export interface HeroBackground {
  type: 'image' | 'video'
  images: string[]
  videoUrl?: string | null
  overlay?: number
}

type Bilingual = { en?: string | null; es?: string | null }

/** Hero copy from Studio (Homepage Media). Missing fields use the defaults. */
export interface HeroText {
  eyebrow?: Bilingual
  title?: Bilingual
  subtitle?: Bilingual
}

interface HeroProps {
  className?: string
  background?: HeroBackground | null
  text?: HeroText | null
}

export default function Hero({ className, background, text }: HeroProps) {
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

  // Studio copy in the visitor's language → English → the shipped default.
  // The subtitle may be cleared on purpose, so only fall back when the
  // field has never been set (undefined), not when it's empty.
  const field = (key: keyof HeroText, allowEmpty = false) => {
    const v = text?.[key]
    const localized = (locale === 'es' ? v?.es : v?.en)?.trim() || v?.en?.trim()
    if (localized) return localized
    if (allowEmpty && v && (v.en === '' || v.es === '')) return ''
    return HERO_TEXT_DEFAULTS[key][locale]
  }
  const content = {
    eyebrow: field('eyebrow'),
    title: field('title'),
    subtitle: field('subtitle', true),
  }

  return (
    <section
      data-hero
      // Full screen: svh so phones don't jump as the address bar shows/hides;
      // a minimum (not fixed) height so the opened mobile search can grow it.
      className={cn("relative flex flex-col min-h-[100svh] overflow-hidden bg-ink", className)}
    >
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
      <div className="relative z-10 flex flex-1 flex-col justify-end pt-24 sm:pt-28">
        <div className="container mx-auto px-4 pb-10 sm:pb-12 sm:mt-8">
          <div
            className={cn(
              'max-w-4xl mb-6 sm:mb-10 transform transition-all duration-1000 ease-out',
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
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl whitespace-pre-line">
              {content.title}
            </h1>
            {content.subtitle && (
              <p
                className={cn(
                  'mt-5 text-base sm:text-lg font-light measure-lede whitespace-pre-line',
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
