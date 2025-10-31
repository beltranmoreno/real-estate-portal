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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-amber-50 via-white to-orange-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/luxury-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium tracking-wide uppercase">
                {t({ en: 'Culinary Excellence', es: 'Excelencia Culinaria' })}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-light text-slate-900 mb-8 tracking-tight">
              {t({
                en: 'Exceptional Dining',
                es: 'Gastronomía Excepcional'
              })}
              <span className="block font-extralight text-4xl md:text-6xl text-amber-700 mt-2">
                {t({
                  en: 'Experiences',
                  es: 'Experiencias'
                })}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto font-light">
              {t({
                en: 'From intimate beachfront dining to world-class fine cuisine, discover culinary artistry that defines luxury hospitality at Casa de Campo.',
                es: 'Desde cenas íntimas frente al mar hasta cocina fina de clase mundial, descubre el arte culinario que define la hospitalidad de lujo en Casa de Campo.'
              })}
            </p>
            <div className="mt-12 flex items-center justify-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
              <div className="mx-4 w-2 h-2 bg-amber-400 rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            </div>
          </div>
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
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          {Object.entries(areaGroups).map(([areaKey, areaGroup]) => {
            if (areaGroup.restaurants.length === 0) return null
            
            return (
              <div key={areaKey} className="mb-20 last:mb-0">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center mb-6">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                    <div className="mx-4 w-2 h-2 bg-amber-400 rounded-full"></div>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
                    {locale === 'en' ? areaGroup.name_en : areaGroup.name_es}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
        </div>
      </section>
    </div>
  )
}

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
      return locale === 'en' ? 'Closed Today' : 'Cerrado Hoy'
    }
    return `${todaySchedule.openTime} - ${todaySchedule.closeTime}`
  }

  return (
    <div className="group relative">
      <div className="bg-white rounded-sm shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-700 border border-slate-100">
        <div className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Image Section */}
          <div className={`relative aspect-[5/4] lg:aspect-auto ${reverse ? 'lg:col-start-2' : ''}`}>
            {restaurant.featuredImage && (
              <Image
                src={urlFor(restaurant.featuredImage).width(700).height(560).url()}
                alt={name}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            {/* Luxury Featured Badge */}
            <div className="absolute top-6 left-6">
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg">
                <StarIcon className="w-4 h-4 mr-2" />
                Featured
              </span>
            </div>

            {/* Price Badge */}
            {restaurant.pricing?.priceRange && (
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-800 rounded-full text-sm font-semibold shadow-lg">
                  {restaurant.pricing.priceRange}
                </span>
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              {restaurant.cuisine && (
                <p className="text-sm font-medium text-amber-600 tracking-wide uppercase mb-3">
                  {restaurant.cuisine.slice(0, 2).join(' • ')}
                </p>
              )}
              <h3 className="text-3xl lg:text-4xl font-light text-slate-900 mb-4 tracking-tight">{name}</h3>
              {summary && (
                <p className="text-lg text-slate-600 leading-relaxed font-light">{summary}</p>
              )}
            </div>

            {/* Highlights */}
            {highlights && highlights.length > 0 && (
              <div className="mb-8">
                <ul className="space-y-3">
                  {highlights.slice(0, 3).map((highlight: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                      <span className="text-slate-700 leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 mb-8 text-slate-600">
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-3 text-slate-400" />
                <span className="font-medium">{getTodayHours()}</span>
              </div>
              {address && (
                <div className="flex items-start">
                  <MapPinIcon className="w-5 h-5 mr-3 mt-0.5 text-slate-400 flex-shrink-0" />
                  <span>{address}</span>
                </div>
              )}
              {restaurant.contact?.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-3 text-slate-400" />
                  <a 
                    href={`tel:${restaurant.contact.phone}`}
                    className="hover:text-amber-600 transition-colors"
                  >
                    {restaurant.contact.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href={`/restaurants/${restaurant.slug}`}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r border-1 border-amber-600 from-amber-600 to-orange-600 text-white rounded-sm font-semibold shadow-lg"
              >
                Explore Restaurant
              </Link>
              
              {restaurant.contact?.reservationUrl && (
                <a
                  href={restaurant.contact.reservationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border-1 border-amber-600 text-amber-600 rounded-sm font-semibold hover:bg-amber-50"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Reserve Table
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RestaurantCard({ restaurant, locale }: { restaurant: any; locale: string }) {
  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es
  const address = locale === 'en' ? restaurant.contact?.address_en : restaurant.contact?.address_es

  const getTodayHours = () => {
    const today = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todaySchedule = restaurant.hours?.schedule?.find((s: any) => s.day_en === dayNames[today])
    
    if (!todaySchedule || todaySchedule.closed) {
      return locale === 'en' ? 'Closed Today' : 'Cerrado Hoy'
    }
    return `${todaySchedule.openTime} - ${todaySchedule.closeTime}`
  }

  const getVibeLabel = (vibe: string) => {
    return vibe.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="group relative">
      <div className="bg-white rounded-sm shadow-lg overflow-hidden border border-slate-100 h-full">
        <div className="relative aspect-[4/3]">
          {restaurant.featuredImage && (
            <Image
              src={urlFor(restaurant.featuredImage).width(500).height(375).url()}
              alt={name}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500"></div>
          
          {/* Luxury Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {restaurant.vibes?.includes('beachfront') && (
              <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-medium shadow-lg">
                Beachfront
              </span>
            )}
            {restaurant.vibes?.includes('fine-dining') && (
              <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium shadow-lg">
                Fine Dining
              </span>
            )}
          </div>

          {restaurant.pricing?.priceRange && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-slate-800 rounded-full text-sm font-semibold shadow-lg">
                {restaurant.pricing.priceRange}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-4">
            {restaurant.cuisine && (
              <p className="text-sm font-medium text-amber-600 tracking-wide uppercase mb-2">
                {restaurant.cuisine.slice(0, 2).join(' • ')}
              </p>
            )}
            <h3 className="text-2xl font-light text-slate-900 mb-3 tracking-tight leading-tight">{name}</h3>
            {summary && (
              <p className="text-slate-600 leading-relaxed font-light line-clamp-2">{summary}</p>
            )}
          </div>

          {/* Operating Hours */}
          <div className="flex items-center text-sm text-slate-500 mb-4">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>{getTodayHours()}</span>
          </div>

          {/* Address */}
          {address && (
            <div className="flex items-start text-sm text-slate-500 mb-4">
              <MapPinIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{address}</span>
            </div>
          )}

          {/* Vibes */}
          {restaurant.vibes && restaurant.vibes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {restaurant.vibes.slice(0, 3).map((vibe: string) => (
                <span key={vibe} className="inline-flex items-center text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-medium">
                  {getVibeLabel(vibe)}
                </span>
              ))}
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto pt-4">
            <Link
              href={`/restaurants/${restaurant.slug}`}
              className="group/btn relative block w-full text-center bg-gradient-to-r border-1 border-amber-600 from-amber-600 to-orange-600 text-white px-6 py-3 rounded-sm font-semibold shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10">
                {locale === 'en' ? 'Explore Restaurant' : 'Explorar Restaurante'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}