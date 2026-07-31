'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { ChevronLeft, CheckCircle2, Mail, MessageCircle } from 'lucide-react'
import { ICON_MAP } from '../iconMap'
import type { ConciergeServiceDetail } from './page'

interface Props {
  service: ConciergeServiceDetail
}

const CATEGORY_LABELS: Record<
  ConciergeServiceDetail['category'],
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

export default function ConciergeDetailClient({ service }: Props) {
  const { locale, t } = useLocale()
  const Icon = ICON_MAP[service.icon] ?? null

  const name = locale === 'es' ? service.name_es : service.name_en
  const blurb =
    locale === 'es'
      ? service.shortDescription_es
      : service.shortDescription_en
  const longDescription =
    locale === 'es'
      ? service.longDescription_es || service.longDescription_en
      : service.longDescription_en || service.longDescription_es

  const heroImage =
    service.heroImage?.asset || service.image?.asset
      ? service.heroImage?.asset
        ? service.heroImage
        : service.image
      : null

  const ctaLabel =
    (locale === 'es'
      ? service.contactCtaLabel_es
      : service.contactCtaLabel_en) ||
    t({ en: 'Get in touch', es: 'Contáctanos' })

  // Pre-fill the contact form's subject when possible — the contact page
  // can read `?service=<slug>` and inject the name.
  const contactHref = `/contact?service=${encodeURIComponent(service.slug)}`

  return (
    <div className="bg-stone-50">
      {/* HERO */}
      <section className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
          {/* Breadcrumb */}
          <Link
            href="/services/concierge"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 mb-6"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            {t({ en: 'Concierge', es: 'Conserjería' })}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                {Icon && (
                  <div className="p-2 rounded-sm bg-stone-100 text-stone-700">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                  {CATEGORY_LABELS[service.category]?.[locale] ?? service.category}
                </p>
              </div>

              <h1 className="text-4xl sm:text-5xl font-light text-stone-900 leading-[1.1] tracking-tight mb-6">
                {name}
              </h1>

              {blurb && (
                <p className="text-lg sm:text-xl text-stone-600 font-light leading-relaxed">
                  {blurb}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href={contactHref}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-800 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {ctaLabel}
                </Link>
                <a
                  href="https://wa.me/18293422566"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>

            {heroImage && (
              <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden rounded-sm">
                <Image
                  src={urlFor(heroImage).width(1200).height(900).fit('crop').url()}
                  alt={heroImage?.alt || name || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LONG DESCRIPTION */}
      {longDescription && (
        <section className="container mx-auto px-4 py-14 sm:py-20 max-w-3xl">
          <div className="space-y-4">
            {longDescription
              .split(/\n\s*\n/)
              .map((para: string, i: number) => (
                <p
                  key={i}
                  className="text-stone-700 font-light text-base sm:text-lg leading-relaxed"
                >
                  {para.trim()}
                </p>
              ))}
          </div>
        </section>
      )}

      {/* TIERS / OPTIONS */}
      {service.tiers && service.tiers.length > 0 && (
        <section className="container mx-auto px-4 pb-16 sm:pb-20 max-w-6xl">
          <h2 className="text-2xl sm:text-3xl font-light text-stone-900 mb-2">
            {t({ en: 'Options', es: 'Opciones' })}
          </h2>
          <div className="h-px bg-stone-200 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {service.tiers.map((tier, idx) => (
              <TierCard
                key={tier._key ?? idx}
                tier={tier}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        </section>
      )}

      {/* GALLERY */}
      {service.gallery && service.gallery.length > 0 && (
        <section className="container mx-auto px-4 pb-16 sm:pb-20 max-w-6xl">
          <h2 className="text-2xl sm:text-3xl font-light text-stone-900 mb-2">
            {t({ en: 'Gallery', es: 'Galería' })}
          </h2>
          <div className="h-px bg-stone-200 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {service.gallery.map((img, idx) => {
              if (!img.asset) return null
              const caption = locale === 'es' ? img.caption_es : img.caption_en
              return (
                <figure
                  key={idx}
                  className="relative aspect-[4/3] bg-stone-100 overflow-hidden rounded-sm"
                >
                  <Image
                    src={urlFor(img).width(900).height(675).fit('crop').url()}
                    alt={img.alt || caption || name || ''}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {caption && (
                    <figcaption className="absolute bottom-2 left-2 right-2 text-xs text-white font-light bg-stone-900/50 px-2 py-1 rounded-sm">
                      {caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-stone-900 text-stone-50">
        <div className="container mx-auto px-4 py-16 sm:py-20 max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-light leading-tight mb-4">
            {t({
              en: 'Ready to arrange this?',
              es: '¿Listo para coordinarlo?',
            })}
          </h2>
          <p className="text-stone-300 font-light max-w-xl mx-auto mb-8">
            {t({
              en: 'Send us a message and we will get back to you with availability and pricing.',
              es: 'Escríbenos y te responderemos con disponibilidad y precios.',
            })}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={contactHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {ctaLabel}
            </Link>
            <a
              href="https://wa.me/18293422566"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-light tracking-wide rounded-sm hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function TierCard({
  tier,
  locale,
  t,
}: {
  tier: NonNullable<ConciergeServiceDetail['tiers']>[number]
  locale: 'en' | 'es'
  t: (o: { en: string; es: string }) => string
}) {
  const name = locale === 'es' ? tier.name_es : tier.name_en
  const description =
    locale === 'es' ? tier.description_es : tier.description_en
  const features = locale === 'es' ? tier.features_es : tier.features_en
  const hasImage = Boolean(tier.image?.asset)

  return (
    <article className="bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 hover:shadow-sm transition-all">
      {hasImage && (
        <div className="relative aspect-[5/4] w-full bg-stone-100 overflow-hidden">
          <Image
            src={urlFor(tier.image).width(800).height(640).fit('crop').url()}
            alt={tier.image?.alt || name || ''}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-xl font-light text-stone-900">{name}</h3>
          {tier.priceLabel && (
            <span className="text-xs uppercase tracking-wider text-stone-700 bg-stone-100 px-2 py-1 rounded-sm whitespace-nowrap">
              {tier.priceLabel}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-stone-600 font-light leading-relaxed mb-4">
            {description}
          </p>
        )}
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-stone-700 font-light"
              >
                <CheckCircle2 className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
