'use client'

import Image from 'next/image'
import { useLocale } from '@/contexts/LocaleContext'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeticiaRecommendationProps {
  recommendation: {
    _id?: string
    title_en: string
    title_es: string
    type: 'restaurant' | 'golf' | 'property' | 'location' | 'activity' | 'general'
    recommendation_en: string
    recommendation_es: string
    highlight_en?: string
    highlight_es?: string
    variant: 'default' | 'compact' | 'banner'
  }
  className?: string
}

/**
 * A personal note from Leticia, styled as a bylined editorial insert:
 * a portrait + name column beside the note, framed with a hairline and a
 * brand signature accent down the left edge.
 */
export default function LeticiaRecommendation({
  recommendation,
  className = ''
}: LeticiaRecommendationProps) {
  const { locale, t } = useLocale()

  const currentTitle = locale === 'en' ? recommendation.title_en : recommendation.title_es
  const currentRecommendation = locale === 'en' ? recommendation.recommendation_en : recommendation.recommendation_es
  const currentHighlight =
    recommendation.highlight_en || recommendation.highlight_es
      ? locale === 'en' ? recommendation.highlight_en : recommendation.highlight_es
      : null
  const variant = recommendation.variant || 'default'

  const quoteSize = {
    compact: 'text-lg',
    default: 'text-xl sm:text-2xl',
    banner: 'text-2xl sm:text-3xl',
  }[variant]

  const role = t({
    en: 'Casa de Campo Real Estate Expert',
    es: 'Experta Inmobiliaria Casa de Campo',
  })

  return (
    <figure
      className={cn(
        'grid overflow-hidden border border-line border-l-2 border-l-brand bg-surface sm:grid-cols-[13rem_1fr]',
        className
      )}
    >
      {/* Byline column — portrait, name, role. */}
      <div className="flex items-center gap-4 border-b border-line bg-brand-wash/50 p-6 sm:flex-col sm:items-start sm:border-b-0 sm:border-r">
        <span className="relative w-16 h-16 shrink-0 overflow-hidden rounded-full ring-1 ring-brand-border">
          <Image src="/images/leticia-avatar.jpg" alt="Leticia Coudray" fill className="object-cover" />
        </span>
        <div>
          <div className="font-serif text-lg leading-tight text-ink">Leticia Coudray</div>
          <div className="eyebrow mt-1.5">{role}</div>
        </div>
      </div>

      {/* Note column. */}
      <div className="p-6 sm:p-8">
        <span className="eyebrow !text-brand">
          {currentTitle || t({ en: 'Leticia recommends', es: 'Leticia recomienda' })}
        </span>

        <blockquote className={cn('mt-3 font-serif leading-[1.35] text-ink measure-lede', quoteSize)}>
          {currentRecommendation}
        </blockquote>

        {currentHighlight && (
          <p className="mt-5 inline-flex items-start gap-2 bg-brand-wash px-3.5 py-2 text-sm font-light text-brand-deep">
            <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{currentHighlight}</span>
          </p>
        )}
      </div>
    </figure>
  )
}
