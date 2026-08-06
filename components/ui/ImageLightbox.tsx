'use client'

import React, { useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'

interface ImageLightboxProps {
  /** Sanity image objects (must carry an `asset`). */
  images: any[]
  /** Index of the image to show; `null` means closed. */
  index: number | null
  onClose: () => void
  onIndexChange: (index: number) => void
  alt?: string
  locale?: 'en' | 'es'
}

/**
 * Minimal, dependency-light fullscreen image viewer. Keyboard (←/→/Esc),
 * on-screen arrows, a counter, and an optional bilingual caption. Reusable
 * anywhere a set of Sanity images needs a lightbox (courses, attractions…).
 */
export default function ImageLightbox({
  images,
  index,
  onClose,
  onIndexChange,
  alt = '',
  locale = 'en',
}: ImageLightboxProps) {
  const isOpen = index !== null && images.length > 0
  const count = images.length

  const go = useCallback(
    (dir: number) => {
      if (index === null) return
      onIndexChange((index + dir + count) % count)
    },
    [index, count, onIndexChange]
  )

  // Lock body scroll + wire keyboard navigation while open.
  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, go, onClose])

  if (!isOpen || index === null) return null

  const image = images[index]
  const caption =
    (locale === 'es' ? image?.caption_es : image?.caption_en) ||
    image?.caption ||
    image?.alt

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 h-[100dvh]"
      role="dialog"
      aria-modal="true"
    >
      {/* Close + counter */}
      <div className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between p-4 sm:p-6">
        <span className="text-[11px] uppercase tracking-[0.22em] text-white/70 tabular-nums">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-white/80 hover:text-white transition-colors"
          aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image */}
      <div className="relative w-full h-full px-4 py-16 sm:px-16">
        <Image
          key={index}
          src={urlFor(image).width(1800).height(1350).url()}
          alt={caption || `${alt} — ${index + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] max-w-2xl px-6 text-center">
          <p className="text-sm font-light leading-relaxed text-white/85">{caption}</p>
        </div>
      )}

      {/* Prev / next */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-[105] p-2 sm:p-3 text-white/80 hover:text-white transition-colors"
            aria-label={locale === 'es' ? 'Anterior' : 'Previous'}
          >
            <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-[105] p-2 sm:p-3 text-white/80 hover:text-white transition-colors"
            aria-label={locale === 'es' ? 'Siguiente' : 'Next'}
          >
            <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9" />
          </button>
        </>
      )}
    </div>
  )
}
