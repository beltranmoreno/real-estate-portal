'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { ESTATE_BAND_DEFAULTS } from '@/sanity/lib/estateBandDefaults'

type Bi = { en?: string | null; es?: string | null }

/** The Studio "The resort band" doc; any empty field uses the shipped copy. */
export interface EstateBandContent {
  eyebrow?: Bi
  title?: Bi
  body?: Bi
  buttonLabel?: Bi
  buttonHref?: string | null
  imageAlt?: string | null
}

interface EstateBandProps {
  /** Optional photograph for the left panel; falls back to a stone field. */
  imageUrl?: string | null
  content?: EstateBandContent | null
}

/**
 * Editorial "the resort" split band — a full-bleed photograph beside a dark
 * copy panel. Sits mid-homepage between the property rails.
 */
export default function EstateBand({ imageUrl, content }: EstateBandProps) {
  const { t } = useLocale()
  const D = ESTATE_BAND_DEFAULTS
  // Studio value first (other language if only one is filled), then the default.
  const pick = (v: Bi | undefined, d: { en: string; es: string }) =>
    t({ en: v?.en?.trim() || v?.es?.trim() || d.en, es: v?.es?.trim() || v?.en?.trim() || d.es })

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 bg-ink text-surface">
      <div className="relative min-h-[360px] md:min-h-[460px] bg-brand-deep overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={content?.imageAlt || ''}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-col justify-center gap-6 px-8 py-16 sm:px-14 lg:px-16">
        <span className="eyebrow !text-white/55">
          {pick(content?.eyebrow, D.eyebrow)}
        </span>
        <h2 className="font-title text-3xl sm:text-4xl text-surface measure-display whitespace-pre-line">
          {pick(content?.title, D.title)}
        </h2>
        <p className="text-base font-light leading-relaxed text-white/70 measure-lede whitespace-pre-line">
          {pick(content?.body, D.body)}
        </p>
        <Link
          href={content?.buttonHref || D.button.href}
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-surface border-b border-white/40 pb-1 w-fit hover:border-white transition-colors"
        >
          {pick(content?.buttonLabel, D.button.label)}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
