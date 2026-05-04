'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  StarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RestaurantsClientProps {
  restaurants: any[]
}

export default function RestaurantsClient({ restaurants }: RestaurantsClientProps) {
  const { locale, t } = useLocale()
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string>('all')
  const [isFiltersVisible, setIsFiltersVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Control filters bar visibility on scroll
  useEffect(() => {
    const controlFiltersBar = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        // Scrolling down and past threshold - hide filters
        setIsFiltersVisible(false)
      } else if (currentScrollY < lastScrollY || currentScrollY <= 150) {
        // Scrolling up or near top - show filters
        setIsFiltersVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlFiltersBar)

    return () => {
      window.removeEventListener('scroll', controlFiltersBar)
    }
  }, [lastScrollY])
  
  // Group restaurants by area
  const areaGroups = {
    'marina': { name_en: 'Marina', name_es: 'Marina', restaurants: [] as any[] },
    'altos-de-chavon': { name_en: 'Altos de Chavón', name_es: 'Altos de Chavón', restaurants: [] as any[] },
    'hotel': { name_en: 'Hotel', name_es: 'Hotel', restaurants: [] as any[] },
    'beach-club': { name_en: 'Beach Club', name_es: 'Club de Playa', restaurants: [] as any[] },
    'golf-club': { name_en: 'Golf Club', name_es: 'Club de Golf', restaurants: [] as any[] },
    'other': { name_en: 'Other', name_es: 'Otros', restaurants: [] as any[] }
  }

  // Filter restaurants
  let filteredRestaurants = restaurants.filter(restaurant => {
    if (selectedArea !== 'all' && restaurant.area !== selectedArea) return false
    if (priceRange !== 'all' && restaurant.pricing?.priceRange !== priceRange) return false
    if (selectedVibes.length > 0 && !selectedVibes.some(v => restaurant.vibes?.includes(v))) return false
    if (selectedCuisine.length > 0 && !selectedCuisine.some(c => restaurant.cuisine?.includes(c))) return false
    return true
  })

  // Group filtered restaurants by area
  filteredRestaurants.forEach(restaurant => {
    if (areaGroups[restaurant.area as keyof typeof areaGroups]) {
      areaGroups[restaurant.area as keyof typeof areaGroups].restaurants.push(restaurant)
    }
  })

  const featuredRestaurants = filteredRestaurants.filter((r: any) => r.featured)

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero — editorial style, matches /about and /services/concierge. */}
      <section className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-6">
            {t({ en: 'Restaurants', es: 'Restaurantes' })}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-stone-900 leading-[1.1] tracking-tight max-w-4xl">
            {t({ en: 'Where to ', es: 'Dónde ' })}
            <span className="italic text-stone-700">
              {t({ en: 'eat well.', es: 'comer bien.' })}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 leading-relaxed font-light mt-8 max-w-3xl">
            {t({
              en: 'Beachfront tables, Altos de Chavón cliffside dinners, and the marina spots locals actually go to — curated by the people who eat at them.',
              es: 'Mesas frente al mar, cenas en los acantilados de Altos de Chavón y los lugares de la Marina a los que realmente van los locales — curados por quienes comen ahí.',
            })}
          </p>
        </div>
      </section>

      {/* Refined Filters Section */}
      <section className={cn(
        "sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-transform duration-300",
        isFiltersVisible ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-4">
                {/* Elegant Area Filter */}
                <div className="relative">
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="appearance-none bg-white border border-slate-300 rounded-xs px-6 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm min-w-[160px]"
                  >
                    <option value="all">{t({ en: 'All Areas', es: 'Todas las Áreas' })}</option>
                    {Object.entries(areaGroups).map(([key, group]) => (
                      <option key={key} value={key}>
                        {locale === 'en' ? group.name_en : group.name_es}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Elegant Price Filter */}
                <div className="relative">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="appearance-none bg-white border border-slate-300 rounded-xs px-6 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm min-w-[160px]"
                  >
                    <option value="all">{t({ en: 'All Price Ranges', es: 'Todos los Precios' })}</option>
                    <option value="$">$ • {t({ en: 'Casual Dining', es: 'Comida Casual' })}</option>
                    <option value="$$">$$ • {t({ en: 'Mid-Range', es: 'Precio Medio' })}</option>
                    <option value="$$$">$$$ • {t({ en: 'Fine Dining', es: 'Alta Cocina' })}</option>
                    <option value="$$$$">$$$$ • {t({ en: 'Luxury', es: 'Lujo' })}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Luxury Vibe Tags */}
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { key: 'romantic', label: { en: 'Romantic', es: 'Romántico' } },
                  { key: 'family', label: { en: 'Family', es: 'Familiar' } },
                  { key: 'beachfront', label: { en: 'Beachfront', es: 'Frente al Mar' } },
                  { key: 'fine-dining', label: { en: 'Fine Dining', es: 'Alta Cocina' } },
                  { key: 'scenic', label: { en: 'Scenic Views', es: 'Vistas Panorámicas' } }
                ].map(vibe => (
                  <button
                    key={vibe.key}
                    onClick={() => {
                      setSelectedVibes(prev => 
                        prev.includes(vibe.key) 
                          ? prev.filter(v => v !== vibe.key)
                          : [...prev, vibe.key]
                      )
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedVibes.includes(vibe.key)
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-md'
                    }`}
                  >
                    {locale === 'en' ? vibe.label.en : vibe.label.es}
                  </button>
                ))}
                
                {/* Clear Filters */}
                {(selectedArea !== 'all' || priceRange !== 'all' || selectedVibes.length > 0 || selectedCuisine.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedArea('all')
                      setPriceRange('all')
                      setSelectedVibes([])
                      setSelectedCuisine([])
                    }}
                    className="ml-4 px-4 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    {t({ en: 'Clear All', es: 'Limpiar Todo' })}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      {featuredRestaurants.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium tracking-wide uppercase mb-6">
                {t({ en: 'Signature Dining', es: 'Gastronomía Selecta' })}
              </span>
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                {t({
                  en: 'Featured Restaurants',
                  es: 'Restaurantes Destacados'
                })}
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
                {t({
                  en: 'Discover our most celebrated dining destinations, where culinary excellence meets unparalleled ambiance.',
                  es: 'Descubre nuestros destinos gastronómicos más celebrados, donde la excelencia culinaria se encuentra con un ambiente incomparable.'
                })}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-12 max-w-7xl mx-auto">
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
      <section className="container mx-auto px-4 py-16 sm:py-20 max-w-7xl">
        {Object.entries(areaGroups).map(([areaKey, areaGroup]) => {
          if (areaGroup.restaurants.length === 0) return null

          return (
            <div key={areaKey} className="mb-16 last:mb-0">
              <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-2 leading-tight">
                {locale === 'en' ? areaGroup.name_en : areaGroup.name_es}
              </h2>
              <div className="h-px bg-stone-200 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    if (!todaySchedule || todaySchedule.closed) {
      return locale === 'en' ? 'Closed today' : 'Cerrado hoy'
    }
    return `${todaySchedule.openTime} – ${todaySchedule.closeTime}`
  }

  return (
    <article className="group bg-white border border-stone-200 rounded-xs overflow-hidden transition-all hover:border-stone-400">
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
        <div className={`relative aspect-[5/4] lg:aspect-auto bg-stone-100 overflow-hidden ${reverse ? 'lg:col-start-2' : ''}`}>
          {restaurant.featuredImage && (
            <Image
              src={urlFor(restaurant.featuredImage).width(900).height(720).url()}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
          {restaurant.pricing?.priceRange && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-stone-700 text-sm font-light tracking-wide">
              {restaurant.pricing.priceRange}
            </span>
          )}
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
            {restaurant.cuisine?.slice(0, 2).join(' · ') ||
              (locale === 'en' ? 'Featured' : 'Destacado')}
          </p>
          <h3 className="text-3xl lg:text-4xl font-light text-stone-900 leading-tight tracking-tight mb-4">
            {name}
          </h3>
          {summary && (
            <p className="text-base text-stone-600 font-light leading-relaxed mb-6">
              {summary}
            </p>
          )}

          {highlights && highlights.length > 0 && (
            <ul className="space-y-2 mb-6 border-t border-stone-200 pt-5">
              {highlights.slice(0, 3).map((highlight: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-stone-700 font-light leading-relaxed"
                >
                  <span className="mt-2 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1.5 text-sm text-stone-600 font-light mb-8">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-stone-400" />
              <span>{getTodayHours()}</span>
            </div>
            {address && (
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                <span>{address}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/restaurants/${restaurant.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
            >
              {locale === 'en' ? 'View restaurant' : 'Ver restaurante'}
            </Link>
            {restaurant.contact?.reservationUrl && (
              <a
                href={restaurant.contact.reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
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
function RestaurantCard({ restaurant, locale }: { restaurant: any; locale: string }) {
  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es

  const getTodayHours = () => {
    const today = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todaySchedule = restaurant.hours?.schedule?.find((s: any) => s.day_en === dayNames[today])
    if (!todaySchedule || todaySchedule.closed) {
      return locale === 'en' ? 'Closed today' : 'Cerrado hoy'
    }
    return `${todaySchedule.openTime} – ${todaySchedule.closeTime}`
  }

  return (
    <Link
      href={`/restaurants/${restaurant.slug}`}
      className="group block bg-white border border-stone-200 rounded-xs overflow-hidden transition-all hover:border-stone-400"
    >
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {restaurant.featuredImage && (
          <Image
            src={urlFor(restaurant.featuredImage).width(600).height(450).url()}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        {restaurant.pricing?.priceRange && (
          <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-stone-700 text-xs font-light tracking-wide">
            {restaurant.pricing.priceRange}
          </span>
        )}
      </div>

      <div className="p-5">
        {restaurant.cuisine && (
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
            {restaurant.cuisine.slice(0, 2).join(' · ')}
          </p>
        )}
        <h3 className="text-xl font-light text-stone-900 leading-tight tracking-tight mb-2">
          {name}
        </h3>
        {summary && (
          <p className="text-sm text-stone-600 font-light leading-relaxed line-clamp-2 mb-4">
            {summary}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-stone-500 font-light">
          <ClockIcon className="w-3.5 h-3.5 text-stone-400" />
          <span>{getTodayHours()}</span>
        </div>
      </div>
    </Link>
  )
}