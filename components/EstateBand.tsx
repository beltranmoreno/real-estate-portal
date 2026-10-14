'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

interface EstateBandProps {
  /** Optional photograph for the left panel; falls back to a stone field. */
  imageUrl?: string | null
}

/**
 * Editorial "the resort" split band — a full-bleed photograph beside a dark
 * copy panel. Sits mid-homepage between the property rails.
 */
export default function EstateBand({ imageUrl }: EstateBandProps) {
  const { t } = useLocale()

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 bg-ink text-surface">
      <div className="relative min-h-[360px] md:min-h-[460px] bg-brand-deep overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-col justify-center gap-6 px-8 py-16 sm:px-14 lg:px-16">
        <span className="eyebrow !text-white/55">
          {t({ en: 'The resort', es: 'El resort' })}
        </span>
        <h2 className="font-title text-3xl sm:text-4xl text-surface measure-display">
          {t({
            en: 'Seven thousand acres, three Pete Dye courses, one gate',
            es: 'Siete mil acres, tres campos de Pete Dye, una sola entrada',
          })}
        </h2>
        <p className="text-base font-light leading-relaxed text-white/70 measure-lede">
          {t({
            en: 'Casa de Campo has been a working estate since 1974 — a marina, a polo field, a village rebuilt in stone above the Chavón river, and a beach that belongs only to residents and their guests.',
            es: 'Casa de Campo es una hacienda en funcionamiento desde 1974 — una marina, un campo de polo, un pueblo reconstruido en piedra sobre el río Chavón y una playa que pertenece solo a los residentes y sus invitados.',
          })}
        </p>
        <Link
          href="/about"
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-surface border-b border-white/40 pb-1 w-fit hover:border-white transition-colors"
        >
          {t({ en: 'Discover the estate', es: 'Descubre la hacienda' })}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
