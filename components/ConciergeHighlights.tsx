'use client'

import Link from 'next/link'
import { ArrowRight, ConciergeBell } from 'lucide-react'
import { ICON_MAP } from '@/app/(main)/services/concierge/iconMap'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

export interface ConciergeHighlight {
  _id: string
  slug: string
  name_en?: string
  name_es?: string
  shortDescription_en?: string
  shortDescription_es?: string
  icon?: string
}

interface ConciergeHighlightsProps {
  services: ConciergeHighlight[]
  className?: string
}

/**
 * Homepage "what you get by booking through Leticia" section: the concierge
 * services marked Featured in Studio, as a hairline-ruled list beside an
 * intro. Renders nothing when no services are featured.
 */
export default function ConciergeHighlights({ services, className }: ConciergeHighlightsProps) {
  const { locale, t } = useLocale()

  if (!services || services.length === 0) return null

  return (
    <section className={cn('py-16 lg:py-24', className)}>
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4">
          <div>
            <span className="eyebrow">{t({ en: 'Concierge', es: 'Conserjería' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t({ en: 'Arrive to a house that’s ready.', es: 'Llega a una casa lista.' })}
            </h2>
            <p className="mt-5 text-body-strong font-light leading-relaxed">
              {t({
                en: 'The car at the airport, the cart charged, a table booked for the first night. Booking through Leticia means one person arranges all of it, before you land and while you stay.',
                es: 'El auto en el aeropuerto, el carrito cargado, una mesa reservada para la primera noche. Reservar con Leticia significa que una sola persona lo organiza todo, antes de que aterrices y durante tu estancia.',
              })}
            </p>
            <Link
              href="/services/concierge"
              className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink border-b border-line pb-1 hover:border-ink transition-colors"
            >
              {t({ en: 'All concierge services', es: 'Todos los servicios' })}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <ul className="lg:col-span-8 border-t border-line">
          {services.map((service) => {
            const Icon = (service.icon && ICON_MAP[service.icon]) || ConciergeBell
            const name = (locale === 'es' ? service.name_es : service.name_en) || service.name_en
            const description =
              (locale === 'es' ? service.shortDescription_es : service.shortDescription_en) ||
              service.shortDescription_en

            return (
              <li key={service._id} className="border-b border-line">
                <Link
                  href={`/services/concierge/${service.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 py-6 sm:py-7"
                >
                  <span className="mt-0.5 flex h-10 w-10 items-center justify-center border border-line text-brand">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block font-title text-xl text-ink decoration-1 underline-offset-4 group-hover:underline">
                      {name}
                    </span>
                    {description && (
                      <span className="mt-1.5 text-sm text-muted font-light leading-relaxed line-clamp-2 max-w-2xl">
                        {description}
                      </span>
                    )}
                  </span>
                  <ArrowRight
                    className="mt-2 h-4 w-4 text-muted-2 group-hover:text-ink transition-colors"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
