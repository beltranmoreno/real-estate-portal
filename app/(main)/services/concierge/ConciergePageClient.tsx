'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import {
  ConciergeBell,
  ArrowRight,
  MessageCircle,
  Mail,
} from 'lucide-react'
import { ICON_MAP } from './iconMap'
import type { ConciergeService } from './page'
import { PageHero } from '@/components/PageHero'
import type { PageHeroDoc } from '@/lib/pageHero'

interface Props {
  services: ConciergeService[]
  hero: PageHeroDoc | null
}

const CATEGORY_LABELS: Record<
  ConciergeService['category'],
  { en: string; es: string }
> = {
  arrival: { en: 'Arrival & Essentials', es: 'Llegada y Esenciales' },
  dining: { en: 'Dining & Celebrations', es: 'Gastronomía y Celebraciones' },
  wellness: { en: 'Wellness & Beauty', es: 'Bienestar y Belleza' },
  family: { en: 'Family Experiences', es: 'Experiencias Familiares' },
  ocean: { en: 'Ocean Experiences', es: 'Experiencias en el Mar' },
  events: { en: 'Events & Entertainment', es: 'Eventos y Entretenimiento' },
  private: { en: 'Private Moments', es: 'Momentos Privados' },
  sports: { en: 'Sports & Outdoor Living', es: 'Deportes y Vida al Aire Libre' },
}

const CATEGORY_ORDER: ConciergeService['category'][] = [
  'arrival',
  'dining',
  'wellness',
  'family',
  'ocean',
  'events',
  'private',
  'sports',
]

export default function ConciergePageClient({ services, hero }: Props) {
  const { locale, t } = useLocale()

  // Group by category, preserving the schema's intended display order.
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: services.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="bg-canvas">
      {/* HERO — editable in Studio (Page Heroes → Concierge) */}
      <PageHero page="concierge" doc={hero}>
        {/* Clarifies the model so visitors don't assume services are
            bundled into the rental price. */}
        <p className="text-xs text-muted-2 font-light mt-4 tracking-wide uppercase">
          {t({
            en: 'Optional add-ons · Get in touch to request · Exclusive to our guests',
            es: 'Servicios opcionales · Escríbenos para solicitar · Exclusivo para nuestros huéspedes',
          })}
        </p>
      </PageHero>

      {/* GRID — grouped by category */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        {grouped.length === 0 ? (
          <EmptyState
            message={t({
              en: 'Service catalog coming soon. In the meantime, message us with what you need.',
              es: 'Catálogo de servicios próximamente. Mientras tanto, escríbenos con lo que necesites.',
            })}
          />
        ) : (
          <div className="space-y-16">
            {grouped.map(({ category, items }) => (
              <div key={category}>
                <h2 className="font-title text-2xl sm:text-3xl text-ink mb-2">
                  {CATEGORY_LABELS[category][locale]}
                </h2>
                <div className="h-px bg-line mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {items.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-ink text-surface">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-4xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl leading-tight mb-6">
            {t({
              en: "Don't see what you need?",
              es: '¿No ves lo que necesitas?',
            })}
          </h2>
          <p className="text-white/70 font-light max-w-xl mx-auto mb-10">
            {t({
              en: 'The list above is just a starting point. If you can think of it, we can probably arrange it. Tell us what you have in mind.',
              es: 'La lista de arriba es solo el punto de partida. Si lo puedes imaginar, probablemente lo podemos organizar. Cuéntanos qué tienes en mente.',
            })}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/18293422566"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface text-ink text-sm font-light tracking-wide rounded-[2px] hover:bg-brand hover:text-surface transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white text-sm font-light tracking-wide rounded-[2px] hover:border-white hover:bg-white/10 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t({ en: 'Send a message', es: 'Enviar un mensaje' })}
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white/85 text-sm font-light tracking-wide rounded-[2px] hover:border-white hover:bg-white/10 transition-colors"
            >
              {t({ en: 'Browse properties', es: 'Ver propiedades' })}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ServiceCard({
  service,
  locale,
}: {
  service: ConciergeService
  locale: 'en' | 'es'
}) {
  const Icon = ICON_MAP[service.icon] ?? ConciergeBell
  const name = locale === 'es' ? service.name_es : service.name_en
  const blurb =
    locale === 'es'
      ? service.shortDescription_es
      : service.shortDescription_en

  const price = service.priceFrom?.amount
    ? formatPrice(service.priceFrom, locale)
    : null

  const hasImage = Boolean(service.image?.asset)
  const imageUrl = hasImage
    ? urlFor(service.image).width(800).height(600).fit('crop').url()
    : null

  // Services don't have their own pages — every card is a plain entry with an
  // anchor (#slug) so other pages can link straight to it.
  const cardClass = `relative bg-white border rounded-none overflow-hidden ${
    service.isFeatured ? 'border-control-border' : 'border-line'
  }`

  const cardBody = (
    <>
      {/* Image header — shown when an image is set in Sanity. The icon
          stays as a small badge overlay so the visual language is
          consistent with image-less cards. */}
      {imageUrl && (
        <div className="relative aspect-[4/3] w-full bg-sand overflow-hidden">
          <Image
            src={imageUrl}
            alt={service.image?.alt || name || ''}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 p-2 rounded-sm bg-white/90 backdrop-blur-sm text-ink shadow-sm">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className={`p-6 ${imageUrl ? '' : 'flex items-start gap-4'}`}>
        {!imageUrl && (
          <div className="p-3 rounded-sm bg-sand text-body-strong shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg text-ink leading-tight">
            {name}
          </h3>
          {blurb && (
            <p className="text-sm text-muted font-light leading-relaxed mt-2">
              {blurb}
            </p>
          )}
          {price && (
            <p className="text-xs text-muted-2 font-light mt-3 tracking-wide">
              {price}
            </p>
          )}
        </div>
      </div>

      {service.isFeatured && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-white/90 font-light">
          ★
        </span>
      )}
    </>
  )

  return (
    <article id={service.slug || undefined} className={`${cardClass} scroll-mt-28`}>
      {cardBody}
    </article>
  )
}

function formatPrice(
  priceFrom: NonNullable<ConciergeService['priceFrom']>,
  locale: 'en' | 'es'
): string {
  const { amount, currency = 'USD', unit = 'request' } = priceFrom
  if (!amount) return ''
  const formatted = new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
  const unitLabels: Record<string, { en: string; es: string }> = {
    request: { en: 'per request', es: 'por solicitud' },
    person: { en: 'per person', es: 'por persona' },
    hour: { en: 'per hour', es: 'por hora' },
    day: { en: 'per day', es: 'por día' },
    trip: { en: 'per trip', es: 'por viaje' },
  }
  const fromLabel = locale === 'es' ? 'desde' : 'from'
  const unitLabel = unitLabels[unit]?.[locale] ?? ''
  return `${fromLabel} ${formatted}${unitLabel ? ` · ${unitLabel}` : ''}`
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white border border-line rounded-xs p-12 text-center">
      <ConciergeBell className="w-10 h-10 text-faint mx-auto mb-4" />
      <p className="text-muted font-light">{message}</p>
    </div>
  )
}
