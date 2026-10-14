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
    <section className={`bg-ink text-surface ${className}`}>
      <div className="container mx-auto px-4 py-20 sm:py-28 max-w-4xl flex flex-col items-center text-center">
        {/* Eyebrow */}
        <p className="eyebrow !text-white/55 mb-6">
          {t(eyebrow)}
        </p>

        {/* Headline */}
        <h2 className="font-display text-4xl sm:text-5xl text-surface measure-display">
          {t(title)}
        </h2>

        {/* Lead */}
        <p className="mt-6 text-base sm:text-lg text-white/70 font-light leading-relaxed measure-lede">
          {t(description)}
        </p>

        {/* Buttons + tertiary link */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryButton.href}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-surface text-ink text-xs uppercase tracking-[0.16em] rounded-[2px] hover:bg-brand hover:text-surface transition-colors"
          >
            {t(primaryButton.text)}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={secondaryButton.href}
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/30 text-surface text-xs uppercase tracking-[0.16em] rounded-[2px] hover:border-white transition-colors"
          >
            {t(secondaryButton.text)}
          </Link>
          {tertiaryLink && (
            <Link
              href={tertiaryLink.href}
              className="inline-flex items-center gap-1.5 ml-1 text-xs uppercase tracking-[0.2em] text-white/55 hover:text-surface transition-colors"
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
