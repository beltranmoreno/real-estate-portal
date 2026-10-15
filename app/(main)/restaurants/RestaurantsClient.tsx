'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { CalendarIcon } from 'lucide-react'
import { ScrollToLink } from '@/components/portal/ScrollToLink'

interface RestaurantsClientProps {
  restaurants: any[]
}

export default function RestaurantsClient({ restaurants }: RestaurantsClientProps) {
  const { locale, t } = useLocale()
  // Casa de Campo has a fixed, small set of places, so instead of filters the
  // page is one list grouped by area, with jump links to each section.

  // Group restaurants by area
  const areaGroups = {
    'marina': { name_en: 'Marina', name_es: 'Marina', restaurants: [] as any[] },
    'altos-de-chavon': { name_en: 'Altos de Chavón', name_es: 'Altos de Chavón', restaurants: [] as any[] },
    'hotel': { name_en: 'Hotel', name_es: 'Hotel', restaurants: [] as any[] },
    'beach-club': { name_en: 'Minitas Beach', name_es: 'Playa Minitas', restaurants: [] as any[] },
    'golf-club': { name_en: 'Golf Club', name_es: 'Club de Golf', restaurants: [] as any[] },
    'other': { name_en: 'Other', name_es: 'Otros', restaurants: [] as any[] }
  }

  // Filter restaurants
  // Bars & nightlife get their own section; restaurants and cafés are grouped
  // by area, restaurants first.
  const bars = restaurants.filter((r) => r.venueType === 'bar')
  const eateries = restaurants
    .filter((r) => r.venueType !== 'bar')
    .sort((a, b) => Number(a.venueType === 'cafe') - Number(b.venueType === 'cafe'))

  eateries.forEach((restaurant) => {
    if (areaGroups[restaurant.area as keyof typeof areaGroups]) {
      areaGroups[restaurant.area as keyof typeof areaGroups].restaurants.push(restaurant)
    }
  })

  const areaName = (key: string) => {
    const group = areaGroups[key as keyof typeof areaGroups]
    return group ? (locale === 'en' ? group.name_en : group.name_es) : ''
  }

  const jumpLinks = [
    ...(Object.keys(areaGroups) as (keyof typeof areaGroups)[])
      .filter((key) => areaGroups[key].restaurants.length > 0)
      .map((key) => ({ id: `area-${key}`, label: areaName(key) })),
    ...(bars.length > 0
      ? [{ id: 'bars', label: t({ en: 'Bars & nightlife', es: 'Bares y vida nocturna' }) }]
      : []),
  ]

  const featuredRestaurants = eateries.filter((r: any) => r.featured)

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero — editorial style, matches /about and /services/concierge. */}
      <section className="bg-canvas border-b border-line">
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <p className="eyebrow mb-6">
            {t({ en: 'Restaurants', es: 'Restaurantes' })}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink max-w-4xl">
            {t({ en: 'The tables worth booking.', es: 'Las mesas que vale la pena reservar.' })}
          </h1>
          <p className="text-lg sm:text-xl text-muted leading-relaxed font-light mt-8 max-w-3xl">
            {t({
              en: 'Every restaurant, café and bar inside Casa de Campo — from long lunches on Minitas to late nights in Altos de Chavón — and the ones Leticia books for guests.',
              es: 'Todos los restaurantes, cafés y bares de Casa de Campo — desde largos almuerzos en Minitas hasta noches en Altos de Chavón — y los que Leticia reserva para sus huéspedes.',
            })}
          </p>
        </div>
      </section>

      {/* Jump links — one per area, plus bars */}
      {jumpLinks.length > 1 && (
        <nav
          aria-label={t({ en: 'Jump to area', es: 'Ir a la zona' })}
          className="border-b border-line bg-canvas"
        >
          <div className="container mx-auto px-4">
            <ul className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {jumpLinks.map((link) => (
                <li key={link.id} className="shrink-0">
                  <ScrollToLink
                    targetId={link.id}
                    className="inline-flex px-4 py-2 rounded-[2px] text-xs uppercase tracking-[0.12em] border border-control-border text-body-strong hover:border-ink transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </ScrollToLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      {/* Featured Restaurants */}
      {featuredRestaurants.length > 0 && (
        <section className="py-20 bg-canvas">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="eyebrow !text-brand block mb-4">
                {t({ en: 'Signature Dining', es: 'Gastronomía Selecta' })}
              </span>
              <h2 className="font-display text-4xl md:text-5xl text-ink mb-6">
                {t({
                  en: 'Featured Restaurants',
                  es: 'Restaurantes Destacados'
                })}
              </h2>
              <p className="text-xl text-muted max-w-3xl mx-auto font-light">
                {t({
                  en: 'Discover our most celebrated dining destinations, where culinary excellence meets unparalleled ambiance.',
                  es: 'Descubre nuestros destinos gastronómicos más celebrados, donde la excelencia culinaria se encuentra con un ambiente incomparable.'
                })}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-16">
              {featuredRestaurants.slice(0, 2).map((restaurant, index) => (
                <FeaturedRestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                  locale={locale}
                  reverse={index % 2 === 1}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Restaurants by Area */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        {Object.entries(areaGroups).map(([areaKey, areaGroup]) => {
          if (areaGroup.restaurants.length === 0) return null

          return (
            <div key={areaKey} id={`area-${areaKey}`} className="mb-16 last:mb-0 scroll-mt-24">
              <h2 className="font-title text-2xl sm:text-3xl text-ink mb-2 leading-tight">
                {locale === 'en' ? areaGroup.name_en : areaGroup.name_es}
              </h2>
              <div className="h-px bg-line mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                {areaGroup.restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant._id}
                    restaurant={restaurant}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* Bars & nightlife */}
      {bars.length > 0 && (
        <section id="bars" className="border-t border-line bg-sand/40 scroll-mt-24">
          <div className="container mx-auto px-4 py-16 sm:py-20">
            <span className="eyebrow">{t({ en: 'After dark', es: 'De noche' })}</span>
            <h2 className="mt-2 font-title text-2xl sm:text-3xl text-ink mb-2 leading-tight">
              {t({ en: 'Bars & nightlife', es: 'Bares y vida nocturna' })}
            </h2>
            <div className="h-px bg-line mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {bars.map((bar) => (
                <RestaurantCard
                  key={bar._id}
                  restaurant={bar}
                  locale={locale}
                  eyebrow={areaName(bar.area)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * Featured restaurant — large two-column card. Image on one side, content
 * on the other. Reversed every other one for visual rhythm. Stone palette,
 * no gradients/heavy shadows; the whole card itself is the link.
 */
function FeaturedRestaurantCard({ restaurant, locale, reverse = false }: { restaurant: any; locale: string; reverse?: boolean }) {
  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es
  const highlights = locale === 'en' ? restaurant.highlights_en : restaurant.highlights_es
  const address = locale === 'en' ? restaurant.contact?.address_en : restaurant.contact?.address_es

  const getTodayHours = () => {
    const today = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todaySchedule = restaurant.hours?.schedule?.find((s: any) => s.day_en === dayNames[today])
    // No hours entered for today → say nothing rather than claim it's closed.
    if (!todaySchedule) return null
    if (todaySchedule.closed) {
      return locale === 'en' ? 'Closed today' : 'Cerrado hoy'
    }
    if (!todaySchedule.openTime || !todaySchedule.closeTime) return null
    return `${todaySchedule.openTime} – ${todaySchedule.closeTime}`
  }

  return (
    <article className="group">
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
        <div className={`relative aspect-[5/4] lg:aspect-auto bg-sand overflow-hidden ${reverse ? 'lg:col-start-2' : ''}`}>
          {restaurant.featuredImage && (
            <Image
              src={urlFor(restaurant.featuredImage).width(900).height(720).url()}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </div>

        <div className={`pt-6 lg:pt-0 flex flex-col justify-center ${reverse ? 'lg:pr-12' : 'lg:pl-12'}`}>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-2 mb-3">
            {restaurant.cuisine?.slice(0, 2).join(' · ') ||
              (locale === 'en' ? 'Featured' : 'Destacado')}
          </p>
          <h3 className="font-display text-3xl lg:text-4xl text-ink leading-tight mb-4">
            {name}
          </h3>
          {summary && (
            <p className="text-base text-muted font-light leading-relaxed mb-6">
              {summary}
            </p>
          )}

          {highlights && highlights.length > 0 && (
            <ul className="space-y-2 mb-6 border-t border-line pt-5">
              {highlights.slice(0, 3).map((highlight: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-body-strong font-light leading-relaxed"
                >
                  <span className="mt-2 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1.5 text-sm text-muted font-light mb-8">
            {getTodayHours() && (
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-faint" />
                <span>{getTodayHours()}</span>
              </div>
            )}
            {address && (
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-faint mt-0.5 shrink-0" />
                <span>{address}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/restaurants/${restaurant.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-white text-sm font-light tracking-wide rounded-sm hover:bg-ink transition-colors"
            >
              {locale === 'en' ? 'View restaurant' : 'Ver restaurante'}
            </Link>
            {restaurant.contact?.reservationUrl && (
              <a
                href={restaurant.contact.reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-line text-ink text-sm font-light tracking-wide rounded-sm hover:bg-sand transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                {locale === 'en' ? 'Reserve' : 'Reservar'}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Compact restaurant card for the area grid. Image on top, lean meta below.
 * Whole card is one tap target — wrapped in <Link>.
 */
function RestaurantCard({
  restaurant,
  locale,
  eyebrow,
}: {
  restaurant: any
  locale: string
  /** Overrides the cuisine line, e.g. the area for bars. */
  eyebrow?: string
}) {
  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es

  const getTodayHours = () => {
    const today = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todaySchedule = restaurant.hours?.schedule?.find((s: any) => s.day_en === dayNames[today])
    // No hours entered for today → say nothing rather than claim it's closed.
    if (!todaySchedule) return null
    if (todaySchedule.closed) {
      return locale === 'en' ? 'Closed today' : 'Cerrado hoy'
    }
    if (!todaySchedule.openTime || !todaySchedule.closeTime) return null
    return `${todaySchedule.openTime} – ${todaySchedule.closeTime}`
  }

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/3] bg-sand overflow-hidden">
        {restaurant.featuredImage && (
          <Image
            src={urlFor(restaurant.featuredImage).width(600).height(450).url()}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      {/* Same rhythm as PropertyCard: name, eyebrow line, one quiet detail line. */}
      <div className="mt-4 flex flex-col gap-1">
        <h3 className="font-serif text-[23px] leading-tight text-ink decoration-1 underline-offset-4 group-hover:underline">
          {name}
        </h3>
        {(() => {
          const line =
            eyebrow ||
            restaurant.cuisine?.slice(0, 2).join(' · ') ||
            (restaurant.venueType === 'cafe'
              ? locale === 'en' ? 'Café & quick bites' : 'Café y bocados'
              : '')
          return line ? <span className="eyebrow !tracking-[0.16em]">{line}</span> : null
        })()}
        {summary && (
          <p className="mt-0.5 text-[13px] font-light text-muted leading-relaxed line-clamp-2">{summary}</p>
        )}
        {getTodayHours() && (
          <p className="mt-0.5 text-[13px] font-light text-muted-2">{getTodayHours()}</p>
        )}
      </div>
    </Link>
  )
}