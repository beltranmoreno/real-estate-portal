'use client'

import Image from 'next/image'
import { useLocale } from '@/contexts/LocaleContext'
import { Lightbulb, QuoteIcon } from 'lucide-react'

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

export default function LeticiaRecommendation({
  recommendation,
  className = ''
}: LeticiaRecommendationProps) {
  const { locale, t } = useLocale()

  const currentTitle = locale === 'en' ? recommendation.title_en : recommendation.title_es
  const currentRecommendation = locale === 'en' ? recommendation.recommendation_en : recommendation.recommendation_es
  const currentHighlight = recommendation.highlight_en || recommendation.highlight_es
    ? (locale === 'en' ? recommendation.highlight_en : recommendation.highlight_es)
    : null
  const variant = recommendation.variant || 'default'

  if (variant === 'compact') {
    return (
      <div className={`relative bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 border border-stone-200/50 rounded-sm p-6 transition-all duration-300 ${className}`}>
        <div className="relative flex items-start space-x-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-stone-200/50 shadow-md">
            <Image
              src="/images/leticia-avatar.jpg"
              alt="Leticia Coudray"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <QuoteIcon className="w-4 h-4 text-stone-600" />
              <h4 className="font-medium text-stone-800 text-sm tracking-wide">{currentTitle}</h4>
            </div>
            <p className="text-stone-600 leading-relaxed text-sm font-light">{currentRecommendation}</p>
            {currentHighlight && (
              <div className="mt-3 bg-stone-100/60 rounded-lg p-3 border border-stone-200/30 flex items-center">
                <span className="font-medium text-stone-700"><Lightbulb className="w-4 h-4 mr-2" /></span>
                <p className="text-stone-700 font-medium text-xs">{currentHighlight}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={`relative bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100 rounded-sm p-10 overflow-hidden border border-stone-200/50 ${className}`}>
        {/* Elegant geometric accents */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-stone-200/15 to-slate-200/15 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-stone-300/10 to-slate-300/10 rounded-full translate-y-16 -translate-x-16"></div>

        {/* Subtle line accents */}
        <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-stone-400/30 to-transparent"></div>
        <div className="absolute top-10 left-8 w-8 h-px bg-gradient-to-r from-stone-300/40 to-transparent"></div>

        <div className="relative">
          <div className="flex items-start space-x-8">
            <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-white shadow-xl">
              <Image
                src="/images/leticia-avatar.jpg"
                alt="Leticia Coudray"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <QuoteIcon className="w-8 h-8 text-stone-500" />
                <h3 className="text-3xl font-extralight text-stone-800 tracking-tight">{currentTitle}</h3>
              </div>
              <blockquote className="text-xl text-stone-600 leading-relaxed mb-6 font-light italic">
                "{currentRecommendation}"
              </blockquote>
              {currentHighlight && (
                <div className="bg-gradient-to-r from-stone-100/80 to-slate-100/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-stone-200/40 mb-6 flex items-center">
                  <span className="font-medium text-stone-700"><Lightbulb className="w-4 h-4 mr-2" /></span>
                  <p className="text-stone-700 font-medium text-sm">{currentHighlight}</p>
                </div>
              )}
              <div className="text-sm text-stone-500 font-light">
                <span className="font-medium text-stone-700">— Leticia Coudray</span>
                <span className="ml-3 opacity-75">
                  {t({ en: 'Real Estate Expert & Casa de Campo Specialist', es: 'Experta Inmobiliaria y Especialista en Casa de Campo' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant - most elegant
  return (
    <div className={`relative bg-gradient-to-br from-white via-stone-50 to-slate-50 rounded-sm p-8 overflow-hidden border border-stone-200/40 transition-all duration-500 hover:border-stone-300/60 ${className}`}>
      {/* Luxury paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
        }} />

      {/* Subtle geometric accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-stone-200/10 to-slate-200/10 rounded-full -translate-y-16 translate-x-16"></div>

      {/* Elegant line accents */}
      <div className="absolute top-6 left-6 w-12 h-px bg-gradient-to-r from-stone-400/20 to-transparent"></div>
      <div className="absolute top-8 left-6 w-6 h-px bg-gradient-to-r from-stone-300/30 to-transparent"></div>

      <div className="relative flex items-start space-x-6">
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-3 ring-stone-200/40 shadow-lg">
          <Image
            src="/images/leticia-avatar.jpg"
            alt="Leticia Coudray"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <QuoteIcon className="w-6 h-6 text-stone-500" />
            <h4 className="font-light text-stone-800 text-lg tracking-wide">{currentTitle}</h4>
          </div>
          <blockquote className="text-stone-600 leading-relaxed mb-5 font-light text-base italic">
            "{currentRecommendation}"
          </blockquote>
          {currentHighlight && (
            <div className="bg-gradient-to-r from-stone-100/60 to-slate-100/60 backdrop-blur-sm rounded-xl p-4 mb-5 border border-stone-200/30 flex items-center">
              <span className="font-medium text-stone-700"><Lightbulb className="w-4 h-4 mr-2" /></span>
              <p className="text-stone-700 font-medium text-sm">{currentHighlight}</p>
            </div>
          )}
          <div className="text-sm text-stone-500 font-light">
            <span className="font-medium text-stone-700">— Leticia Coudray</span>
            <span className="ml-3 opacity-75 tracking-wide">
              {t({ en: 'Casa de Campo Real Estate Expert', es: 'Experta Inmobiliaria Casa de Campo' })}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-300/30 to-transparent"></div>
    </div>
  )
}