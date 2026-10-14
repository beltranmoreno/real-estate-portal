'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { urlFor } from '@/sanity/lib/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

import 'swiper/css'

interface ImageItem {
  _id: string
  image: any
  alt?: string
  location?: string
}

interface MediaSwiperProps {
  images: ImageItem[]
  className?: string
  aspectRatio?: 'square' | 'landscape' | 'portrait'
}

const AUTOPLAY_DELAY = 5000

const aspectRatioClasses = {
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
}

/**
 * Edge-to-edge photo carousel with a peek of the next slide. Below it, a
 * controls row: one hairline segment per photo (the active one fills over
 * the autoplay interval), a counter, and prev/next buttons. Autoplay is off
 * for visitors who prefer reduced motion.
 */
export default function MediaSwiper({
  images,
  className,
  aspectRatio = 'landscape',
}: MediaSwiperProps) {
  const { t } = useLocale()
  const swiperRef = useRef<SwiperType | null>(null)
  const progressRef = useRef<HTMLSpanElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  if (!images || images.length === 0) {
    return null
  }

  const total = images.length
  // Swiper's loop needs enough slides to clone around 2 visible slides;
  // with fewer, rewind to the start instead.
  const canLoop = total >= 5
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={className}>
      <Swiper
        key={reducedMotion ? 'static' : 'autoplay'}
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={1.15}
        slidesOffsetBefore={16}
        slidesOffsetAfter={16}
        breakpoints={{
          640: { slidesPerView: 1.5, spaceBetween: 16 },
          1024: { slidesPerView: 2.15, spaceBetween: 16 },
        }}
        autoplay={
          reducedMotion
            ? false
            : { delay: AUTOPLAY_DELAY, disableOnInteraction: false, pauseOnMouseEnter: true }
        }
        loop={canLoop}
        rewind={!canLoop}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onAutoplayTimeLeft={(_, __, progress) => {
          // progress runs 1 → 0 across the delay; write straight to the DOM so
          // the fill animates without re-rendering every frame.
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${1 - progress})`
          }
        }}
      >
        {images.map((item) => (
          <SwiperSlide key={item._id}>
            <figure>
              <div className={cn('relative overflow-hidden bg-sand', aspectRatioClasses[aspectRatio])}>
                <Image
                  src={urlFor(item.image).width(1400).height(1050).quality(85).url()}
                  alt={item.alt || item.location || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 87vw, (max-width: 1024px) 67vw, 47vw"
                />
              </div>
              {item.location && (
                <figcaption className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-2 font-light">
                  {item.location}
                </figcaption>
              )}
            </figure>
          </SwiperSlide>
        ))}
      </Swiper>

      {total > 1 && (
        <div className="px-4 mt-8 flex items-center gap-6">
          {/* Segmented progress — one hairline per photo, each a click target */}
          <div className="flex flex-1 max-w-md items-center gap-1.5">
            {images.map((item, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() =>
                    canLoop
                      ? swiperRef.current?.slideToLoop(index)
                      : swiperRef.current?.slideTo(index)
                  }
                  className="group flex-1 py-3"
                  aria-label={`${t({ en: 'Go to photo', es: 'Ir a la foto' })} ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className="relative block h-px bg-line overflow-hidden group-hover:bg-muted-2 transition-colors">
                    {isActive && (
                      <span
                        ref={progressRef}
                        className="absolute inset-0 origin-left bg-ink"
                        style={{ transform: reducedMotion ? 'scaleX(1)' : 'scaleX(0)' }}
                      />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          <span className="text-xs tracking-[0.14em] text-muted tabular-nums">
            {pad(activeIndex + 1)} <span className="text-muted-2">/ {pad(total)}</span>
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              className="flex h-10 w-10 items-center justify-center rounded-xs border border-line text-ink hover:border-ink transition-colors"
              aria-label={t({ en: 'Previous photo', es: 'Foto anterior' })}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              className="flex h-10 w-10 items-center justify-center rounded-xs border border-line text-ink hover:border-ink transition-colors"
              aria-label={t({ en: 'Next photo', es: 'Foto siguiente' })}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
