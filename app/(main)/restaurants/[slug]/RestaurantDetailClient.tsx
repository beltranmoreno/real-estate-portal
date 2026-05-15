'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'
import { PortableText } from '@portabletext/react'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CalendarIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

interface RestaurantDetailClientProps {
  restaurant: any
  relatedRestaurants: any[]
}

const AREA_LABELS: Record<string, { en: string; es: string }> = {
  marina: { en: 'Marina', es: 'Marina' },
  'altos-de-chavon': { en: 'Altos de Chavón', es: 'Altos de Chavón' },
  hotel: { en: 'Hotel', es: 'Hotel' },
  'beach-club': { en: 'Beach Club', es: 'Club de Playa' },
  'golf-club': { en: 'Golf Club', es: 'Club de Golf' },
  other: { en: 'Other', es: 'Otros' },
}

const DAY_NAMES_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export default function RestaurantDetailClient({
  restaurant,
  relatedRestaurants,
}: RestaurantDetailClientProps) {
  const { locale, t } = useLocale()

  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es
  const highlights = locale === 'en' ? restaurant.highlights_en : restaurant.highlights_es
  const description = locale === 'en' ? restaurant.description_en : restaurant.description_es
  const address = locale === 'en' ? restaurant.contact?.address_en : restaurant.contact?.address_es

  const areaEntry = restaurant.area ? AREA_LABELS[restaurant.area] : null
  const areaName = areaEntry
    ? locale === 'es'
      ? areaEntry.es
      : areaEntry.en
    : null

  // Today's hours — used for the small "open now" indicator under the
  // hero badges. `null` when no schedule is configured.
  const todayHours = getTodayHours(restaurant, locale)

  return (
    <div className="min-h-screen bg-white">
      {/* ───────────────────── Hero ───────────────────── */}
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden bg-stone-900">
        {restaurant.media?.featuredImage && (
          <>
            <Image
              src={urlFor(restaurant.media.featuredImage).width(1920).height(1080).url()}
              alt={name}
              fill
              className="object-cover"
              priority
            />
            {/* Single bottom-weighted gradient. Cleaner than the
                multi-gradient stack we had before. */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
          </>
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 sm:pb-16">
            <div className="max-w-4xl text-white">
              {/* Back link */}
              <Link
                href="/restaurants"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white mb-6"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                {t({ en: 'Restaurants', es: 'Restaurantes' })}
              </Link>

              {/* Eyebrow row — area + price + today's hours, no chips */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.2em] text-white/80 mb-5">
                {areaName && <span>{areaName}</span>}
                {restaurant.pricing?.priceRange && (
                  <>
                    <span className="text-white/40">·</span>
                    <span>{restaurant.pricing.priceRange}</span>
                  </>
                )}
                {todayHours && (
                  <>
                    <span className="text-white/40">·</span>
                    <span
                      className={
                        todayHours.isOpen
                          ? 'text-emerald-200'
                          : 'text-stone-300'
                      }
                    >
                      {todayHours.text}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-[1.05] mb-5">
                {name}
              </h1>

              {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                <p className="text-base sm:text-lg text-white/80 font-light tracking-wide mb-6">
                  {restaurant.cuisine
                    .map((c: string) => titleCase(c))
                    .join(' · ')}
                </p>
              )}

              {summary && (
                <p className="text-base sm:text-lg text-white/90 max-w-3xl font-light leading-relaxed mb-8">
                  {summary}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {restaurant.contact?.reservationUrl && (
                  <a
                    href={restaurant.contact.reservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {t({ en: 'Reserve Your Table', es: 'Reservar Mesa' })}
                  </a>
                )}

                {restaurant.contact?.menuUrl && (
                  <a
                    href={restaurant.contact.menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 text-white text-sm font-light tracking-wide rounded-sm hover:bg-white/10 transition-colors"
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    {t({ en: 'Menu', es: 'Menú' })}
                  </a>
                )}

                {restaurant.contact?.phone && (
                  <a
                    href={`tel:${restaurant.contact.phone}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-white/40 text-white text-sm font-light tracking-wide rounded-sm hover:bg-white/10 transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    {t({ en: 'Call', es: 'Llamar' })}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── Body ───────────────────── */}
      <section className="py-16 sm:py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-16">
              {/* Highlights */}
              {highlights && highlights.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
                    {t({ en: 'Highlights', es: 'Destacados' })}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-light text-stone-900 mb-8 tracking-tight leading-tight">
                    {t({ en: 'What makes it special', es: 'Lo que la hace especial' })}
                  </h2>
                  <ul className="space-y-3 border-t border-stone-200">
                    {highlights.map((highlight: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-4 py-4 border-b border-stone-200"
                      >
                        <span className="mt-2 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                        <span className="text-stone-700 leading-relaxed font-light">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description — editorial prose */}
              {description && (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
                    {t({ en: 'The story', es: 'La historia' })}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
                    {t({ en: 'About this restaurant', es: 'Sobre este restaurante' })}
                  </h2>
                  <div className="prose prose-stone prose-lg max-w-none font-light leading-relaxed prose-headings:font-light prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-900 prose-a:underline prose-a:underline-offset-4 prose-strong:font-medium prose-strong:text-stone-900">
                    <PortableText value={description} />
                  </div>
                </div>
              )}

              {/* Leticia's Recommendation */}
              {restaurant.leticiaRecommendation &&
                restaurant.leticiaRecommendation.isActive && (
                  <LeticiaRecommendation
                    recommendation={restaurant.leticiaRecommendation}
                  />
                )}

              {/* Hours */}
              {restaurant.hours?.schedule && restaurant.hours.schedule.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
                    {t({ en: 'Hours', es: 'Horarios' })}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
                    {t({ en: 'When to visit', es: 'Cuándo visitar' })}
                  </h2>
                  <ul className="border-t border-stone-200">
                    {restaurant.hours.schedule.map((day: any, index: number) => {
                      const dayName = locale === 'en' ? day.day_en : day.day_es
                      const todayIndex = new Date().getDay()
                      const isToday = day.day_en === DAY_NAMES_EN[todayIndex]

                      return (
                        <li
                          key={index}
                          className="flex justify-between items-center py-4 border-b border-stone-200"
                        >
                          <span
                            className={`font-light ${
                              isToday ? 'text-stone-900' : 'text-stone-600'
                            }`}
                          >
                            {dayName}
                            {isToday && (
                              <span className="ml-3 text-[10px] uppercase tracking-wider text-stone-500">
                                {t({ en: 'Today', es: 'Hoy' })}
                              </span>
                            )}
                          </span>
                          <span
                            className={`font-light text-sm ${
                              day.closed
                                ? 'text-stone-400 italic'
                                : isToday
                                ? 'text-stone-900'
                                : 'text-stone-600'
                            }`}
                          >
                            {day.closed
                              ? t({ en: 'Closed', es: 'Cerrado' })
                              : `${day.openTime} – ${day.closeTime}`}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {restaurant.hours.specialHours_en && (
                    <p className="mt-5 text-sm text-stone-600 font-light leading-relaxed border-l-2 border-stone-300 pl-4">
                      {locale === 'en'
                        ? restaurant.hours.specialHours_en
                        : restaurant.hours.specialHours_es}
                    </p>
                  )}
                </div>
              )}

              {/* Gallery */}
              {restaurant.media?.gallery && restaurant.media.gallery.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
                    {t({ en: 'Gallery', es: 'Galería' })}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
                    {t({ en: 'A look inside', es: 'Una mirada interior' })}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {restaurant.media.gallery.slice(0, 6).map(
                      (image: any, index: number) => {
                        const caption =
                          locale === 'en' ? image.caption_en : image.caption_es
                        return (
                          <figure
                            key={index}
                            className="relative aspect-[4/3] bg-stone-100 overflow-hidden rounded-sm group"
                          >
                            <Image
                              src={urlFor(image).width(900).height(675).url()}
                              alt={caption || `${name} photo ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            {caption && (
                              <figcaption className="absolute bottom-2 left-2 right-2 text-xs text-white font-light bg-stone-900/60 px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                {caption}
                              </figcaption>
                            )}
                          </figure>
                        )
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white border border-stone-200 rounded-sm p-7 sticky top-24 space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-1">
                    {t({ en: 'Visit', es: 'Visitar' })}
                  </p>
                  <h3 className="text-xl font-light text-stone-900 tracking-tight">
                    {t({ en: 'Get in touch', es: 'Contacto' })}
                  </h3>
                </div>

                {/* Contact rows */}
                <div className="space-y-4">
                  {address && (
                    <ContactRow icon={MapPinIcon}>
                      <span className="text-stone-700 font-light leading-relaxed">
                        {address}
                      </span>
                    </ContactRow>
                  )}
                  {restaurant.contact?.phone && (
                    <ContactRow icon={PhoneIcon}>
                      <a
                        href={`tel:${restaurant.contact.phone}`}
                        className="text-stone-700 font-light hover:text-stone-900 transition-colors"
                      >
                        {restaurant.contact.phone}
                      </a>
                    </ContactRow>
                  )}
                  {restaurant.contact?.email && (
                    <ContactRow icon={EnvelopeIcon}>
                      <a
                        href={`mailto:${restaurant.contact.email}`}
                        className="text-stone-700 font-light hover:text-stone-900 transition-colors break-all"
                      >
                        {restaurant.contact.email}
                      </a>
                    </ContactRow>
                  )}
                  {restaurant.contact?.website && (
                    <ContactRow icon={GlobeAltIcon}>
                      <a
                        href={restaurant.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-700 font-light hover:text-stone-900 transition-colors"
                      >
                        {t({ en: 'Visit website', es: 'Visitar sitio web' })}
                      </a>
                    </ContactRow>
                  )}
                  {restaurant.contact?.menuUrl && (
                    <ContactRow icon={BookOpenIcon}>
                      <a
                        href={restaurant.contact.menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-700 font-light hover:text-stone-900 transition-colors"
                      >
                        {t({ en: 'View menu', es: 'Ver menú' })}
                      </a>
                    </ContactRow>
                  )}
                </div>

                {restaurant.contact?.reservationUrl && (
                  <a
                    href={restaurant.contact.reservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 rounded-sm font-light text-sm tracking-wide transition-colors"
                  >
                    {t({ en: 'Reserve a table', es: 'Reservar mesa' })}
                  </a>
                )}

                {/* Meta blocks */}
                <div className="space-y-6 pt-2 border-t border-stone-200">
                  {restaurant.pricing?.priceRange && (
                    <MetaBlock
                      label={t({ en: 'Price range', es: 'Rango de precios' })}
                    >
                      <p className="text-2xl font-light text-stone-900">
                        {restaurant.pricing.priceRange}
                      </p>
                      {restaurant.pricing.averagePrice && (
                        <p className="text-xs text-stone-500 font-light mt-1">
                          ~${restaurant.pricing.averagePrice}{' '}
                          {t({ en: 'per person', es: 'por persona' })}
                        </p>
                      )}
                    </MetaBlock>
                  )}

                  {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                    <MetaBlock label={t({ en: 'Cuisine', es: 'Cocina' })}>
                      <Tags items={restaurant.cuisine} />
                    </MetaBlock>
                  )}

                  {restaurant.vibes && restaurant.vibes.length > 0 && (
                    <MetaBlock label={t({ en: 'Atmosphere', es: 'Ambiente' })}>
                      <Tags items={restaurant.vibes} />
                    </MetaBlock>
                  )}

                  {restaurant.features && restaurant.features.length > 0 && (
                    <MetaBlock label={t({ en: 'Features', es: 'Características' })}>
                      <ul className="space-y-2">
                        {restaurant.features.map((feature: any, index: number) => {
                          const featureName =
                            locale === 'en' ? feature.feature_en : feature.feature_es
                          return (
                            <li
                              key={index}
                              className="text-sm text-stone-700 font-light"
                            >
                              {featureName}
                            </li>
                          )
                        })}
                      </ul>
                    </MetaBlock>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ───────────────────── Related ───────────────────── */}
      {relatedRestaurants.length > 0 && (
        <section className="py-16 sm:py-20 bg-white border-t border-stone-200">
          <div className="container mx-auto px-4 max-w-7xl">
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
              {t({ en: 'More dining', es: 'Más opciones' })}
            </p>
            <h2 className="text-2xl sm:text-3xl font-light text-stone-900 mb-8 tracking-tight">
              {t({ en: 'You might also like', es: 'También te puede gustar' })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedRestaurants.map((relatedRestaurant) => (
                <RelatedRestaurantCard
                  key={relatedRestaurant._id}
                  restaurant={relatedRestaurant}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// ─────────────────── Helpers ───────────────────

function getTodayHours(restaurant: any, locale: string) {
  const schedule = restaurant.hours?.schedule
  if (!Array.isArray(schedule) || schedule.length === 0) return null
  const today = new Date().getDay()
  const todaySchedule = schedule.find(
    (s: any) => s.day_en === DAY_NAMES_EN[today]
  )
  if (!todaySchedule || todaySchedule.closed) {
    return { text: locale === 'en' ? 'Closed today' : 'Cerrado hoy', isOpen: false }
  }
  return {
    text: `${todaySchedule.openTime} – ${todaySchedule.closeTime}`,
    isOpen: true,
  }
}

function titleCase(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─────────────────── Sub-components ───────────────────

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="p-2 rounded-sm bg-stone-100 text-stone-700 shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 pt-1.5">{children}</div>
    </div>
  )
}

function MetaBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-light mb-2.5">
        {label}
      </p>
      {children}
    </div>
  )
}

function Tags({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-700 rounded-full text-xs font-light"
        >
          {titleCase(item)}
        </span>
      ))}
    </div>
  )
}

function RelatedRestaurantCard({
  restaurant,
  locale,
  t,
}: {
  restaurant: any
  locale: string
  t: (o: { en: string; es: string }) => string
}) {
  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es
  const areaEntry = restaurant.area ? AREA_LABELS[restaurant.area] : null
  const areaName = areaEntry
    ? locale === 'es'
      ? areaEntry.es
      : areaEntry.en
    : null

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="group block bg-white border border-stone-200 rounded-sm overflow-hidden hover:border-stone-400 transition-colors"
    >
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {restaurant.featuredImage && (
          <Image
            src={urlFor(restaurant.featuredImage).width(600).height(450).url()}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-x-3 text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
          {areaName && <span>{areaName}</span>}
          {areaName && restaurant.pricing?.priceRange && (
            <span className="text-stone-300">·</span>
          )}
          {restaurant.pricing?.priceRange && (
            <span>{restaurant.pricing.priceRange}</span>
          )}
        </div>
        <h3 className="text-lg font-light text-stone-900 leading-tight mb-2">
          {name}
        </h3>
        {restaurant.cuisine && restaurant.cuisine.length > 0 && (
          <p className="text-xs text-stone-500 font-light mb-3">
            {restaurant.cuisine
              .slice(0, 2)
              .map((c: string) => titleCase(c))
              .join(' · ')}
          </p>
        )}
        {summary && (
          <p className="text-sm text-stone-600 font-light line-clamp-2 leading-relaxed mb-4">
            {summary}
          </p>
        )}
        <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] text-stone-500 group-hover:text-stone-900 transition-colors">
          {t({ en: 'Learn more', es: 'Ver más' })}
          <ArrowRightIcon className="w-3 h-3" />
        </p>
      </div>
    </Link>
  )
}
