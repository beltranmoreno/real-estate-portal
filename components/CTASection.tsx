'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

interface CTAButton {
  text: { en: string; es: string }
  href: string
}

interface CTASectionProps {
  eyebrow?: { en: string; es: string }
  title?: { en: string; es: string }
  description?: { en: string; es: string }
  primaryButton?: CTAButton
  secondaryButton?: CTAButton
  /** Optional small "or…" text link under the primary CTAs. */
  tertiaryLink?: CTAButton
  className?: string
}

/**
 * Closing CTA used at the bottom of the homepage (and reusable
 * elsewhere). Editorial palette — stone-900 background, white type,
 * thin hairline divider before the lead, slim button row, optional
 * tertiary text link.
 *
 * Keeps the same prop API as the previous version so existing usages
 * stay valid; only the visuals changed.
 */
export default function CTASection({
  eyebrow = { en: "What's next", es: 'Qué sigue' },
  title = {
    en: 'Find your place in Casa de Campo.',
    es: 'Encuentra tu lugar en Casa de Campo.',
  },
  description = {
    en: "Tell us when you're coming and what matters most — beachfront, golf course, family-friendly, fully staffed. Leticia handles the rest.",
    es: 'Dinos cuándo vienes y lo que más te importa — frente al mar, en el campo de golf, familiar, con personal. Leticia se encarga del resto.',
  },
  primaryButton = {
    text: { en: 'Browse all properties', es: 'Ver todas las propiedades' },
    href: '/search',
  },
  secondaryButton = {
    text: { en: 'Talk to Leticia', es: 'Habla con Leticia' },
    href: '/contact',
  },
  tertiaryLink = {
    text: { en: 'Browse by area', es: 'Buscar por zona' },
    href: '/search',
  },
  className = '',
}: CTASectionProps) {
  const { t } = useLocale()

  return (
    <section className={`bg-stone-900 text-stone-50 ${className}`}>
      <div className="container mx-auto px-4 py-20 sm:py-28 max-w-4xl">
        {/* Eyebrow */}
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400 mb-5">
          {t(eyebrow)}
        </p>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-light leading-[1.1] tracking-tight max-w-3xl">
          {t(title)}
        </h2>

        {/* Hairline divider — quietly separates the headline from the lead. */}
        <div className="h-px w-12 bg-stone-700 my-7" />

        {/* Lead */}
        <p className="text-base sm:text-lg text-stone-300 font-light max-w-2xl leading-relaxed mb-10">
          {t(description)}
        </p>

        {/* Buttons + tertiary link */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={primaryButton.href}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-50 text-stone-900 text-sm font-light tracking-wide rounded-sm hover:bg-white transition-colors"
          >
            {t(primaryButton.text)}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={secondaryButton.href}
            className="inline-flex items-center gap-2 px-6 py-3 border border-stone-600 text-stone-100 text-sm font-light tracking-wide rounded-sm hover:bg-stone-800 hover:border-stone-500 transition-colors"
          >
            {t(secondaryButton.text)}
          </Link>
          {tertiaryLink && (
            <Link
              href={tertiaryLink.href}
              className="inline-flex items-center gap-1.5 ml-1 text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-stone-100 transition-colors"
            >
              {t(tertiaryLink.text)}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
