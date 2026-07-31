'use client'

import { Star, BadgeCheck } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

interface ReviewItem {
  _id: string
  rating: number
  reviewerName: string
  reviewerLocation?: string
  stayDate?: string
  reviewDate?: string
  title_en?: string
  title_es?: string
  content_en?: string
  content_es?: string
  verified?: boolean
  featured?: boolean
  response?: {
    content_en?: string
    content_es?: string
    responseDate?: string
  }
}

interface Props {
  reviews?: ReviewItem[]
}

/** Five-star row, filled up to `rating`. */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-200 text-stone-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function PropertyReviews({ reviews }: Props) {
  const { locale, t } = useLocale()

  if (!reviews || reviews.length === 0) return null

  const formatStayDate = (value?: string) => {
    if (!value) return null
    // `stayDate` is a date (YYYY-MM-DD); show month + year only.
    const d = new Date(value)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div id="reviews" className="scroll-mt-24">
      <h2 className="text-2xl font-light text-stone-900 mb-6 tracking-wide">
        {t({ en: 'Reviews', es: 'Reseñas' })}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review) => {
          const title = locale === 'es' ? review.title_es : review.title_en
          const content = locale === 'es' ? review.content_es : review.content_en
          const responseContent =
            locale === 'es'
              ? review.response?.content_es
              : review.response?.content_en
          const stay = formatStayDate(review.stayDate)

          return (
            <div
              key={review._id}
              className="p-6 bg-white/40 backdrop-blur-sm border border-stone-200/30 rounded-sm flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-light text-stone-900">
                      {review.reviewerName}
                    </span>
                    {review.verified && (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-teal-700"
                        title={t({ en: 'Verified stay', es: 'Estadía verificada' })}
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {t({ en: 'Verified', es: 'Verificada' })}
                      </span>
                    )}
                  </div>
                  {(review.reviewerLocation || stay) && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      {[review.reviewerLocation, stay].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <Stars rating={review.rating} />
              </div>

              {title && (
                <h3 className="font-light text-stone-900 mb-1">{title}</h3>
              )}
              {content && (
                <p className="text-stone-700 font-light leading-relaxed whitespace-pre-line">
                  {content}
                </p>
              )}

              {responseContent && (
                <div className="mt-4 pl-4 border-l-2 border-stone-200">
                  <p className="text-xs font-medium text-stone-600 mb-1">
                    {t({ en: 'Response from the host', es: 'Respuesta del anfitrión' })}
                  </p>
                  <p className="text-sm text-stone-600 font-light leading-relaxed whitespace-pre-line">
                    {responseContent}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
