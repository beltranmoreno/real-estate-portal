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
  ClockIcon,
  StarIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline'

interface RestaurantDetailClientProps {
  restaurant: any
  relatedRestaurants: any[]
}

export default function RestaurantDetailClient({ 
  restaurant, 
  relatedRestaurants 
}: RestaurantDetailClientProps) {
  const { locale, t } = useLocale()
  
  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es
  const highlights = locale === 'en' ? restaurant.highlights_en : restaurant.highlights_es
  const description = locale === 'en' ? restaurant.description_en : restaurant.description_es
  const address = locale === 'en' ? restaurant.contact?.address_en : restaurant.contact?.address_es

  const areaNames = {
    'marina': { en: 'Marina', es: 'Marina' },
    'altos-de-chavon': { en: 'Altos de Chavón', es: 'Altos de Chavón' },
    'hotel': { en: 'Hotel', es: 'Hotel' },
    'beach-club': { en: 'Beach Club', es: 'Club de Playa' },
    'golf-club': { en: 'Golf Club', es: 'Club de Golf' },
    'other': { en: 'Other', es: 'Otros' }
  }

  const areaName = restaurant.area ? (locale === 'en' 
    ? areaNames[restaurant.area as keyof typeof areaNames]?.en 
    : areaNames[restaurant.area as keyof typeof areaNames]?.es) : null

  const getTodayHours = () => {
    const today = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todaySchedule = restaurant.hours?.schedule?.find((s: any) => s.day_en === dayNames[today])
    
    if (!todaySchedule || todaySchedule.closed) {
      return { text: locale === 'en' ? 'Closed Today' : 'Cerrado Hoy', isOpen: false }
    }
    return { text: `${todaySchedule.openTime} - ${todaySchedule.closeTime}`, isOpen: true }
  }

  const todayHours = getTodayHours()

  return (
    <div className="min-h-screen bg-white">
      {/* Luxury Hero Section */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden">
        {restaurant.media?.featuredImage && (
          <>
            <Image
              src={urlFor(restaurant.media.featuredImage).width(1920).height(1080).url()}
              alt={name}
              fill
              className="object-cover scale-105 transition-transform duration-[10s] hover:scale-100"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
          </>
        )}
        
        {/* Floating content container */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-16">
            <div className="max-w-5xl text-white">
              <div className="flex items-center gap-4 mb-6">
                {areaName && (
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg">
                    {areaName}
                  </span>
                )}
                {restaurant.pricing?.priceRange && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold border border-white/30">
                    {restaurant.pricing.priceRange}
                  </span>
                )}
                {restaurant.vibes?.includes('fine-dining') && (
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-lg">
                    Fine Dining
                  </span>
                )}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight leading-tight">
                {name}
              </h1>
              
              {restaurant.cuisine && (
                <p className="text-xl md:text-2xl mb-8 text-amber-200 font-light tracking-wide">
                  {restaurant.cuisine.join(' • ')}
                </p>
              )}
              
              {summary && (
                <p className="text-lg md:text-xl mb-10 text-white/90 max-w-4xl font-light leading-relaxed">
                  {summary}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30">
                  <ClockIcon className="w-5 h-5 inline mr-3" />
                  <span className={`font-medium ${todayHours.isOpen ? 'text-green-300' : 'text-red-300'}`}>
                    {todayHours.text}
                  </span>
                </div>
                {restaurant.vibes?.includes('beachfront') && (
                  <div className="bg-cyan-500/20 backdrop-blur-md px-6 py-3 rounded-xl border border-cyan-300/30">
                    <span className="font-medium text-cyan-200">Beachfront Dining</span>
                  </div>
                )}
                {restaurant.vibes?.includes('romantic') && (
                  <div className="bg-pink-500/20 backdrop-blur-md px-6 py-3 rounded-xl border border-pink-300/30">
                    <span className="font-medium text-pink-200">Romantic Setting</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {restaurant.contact?.reservationUrl && (
                  <a
                    href={restaurant.contact.reservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                  >
                    <CalendarIcon className="w-5 h-5 mr-3" />
                    {t({ en: 'Reserve Your Table', es: 'Reservar Mesa' })}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </a>
                )}
                
                {restaurant.contact?.phone && (
                  <a
                    href={`tel:${restaurant.contact.phone}`}
                    className="inline-flex items-center px-6 py-4 border-2 border-white/50 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white/70 transition-all duration-300 backdrop-blur-md"
                  >
                    <PhoneIcon className="w-5 h-5 mr-3" />
                    {t({ en: 'Call Now', es: 'Llamar Ahora' })}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Elegant decorative elements */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-8">
          <div className="flex items-center justify-center">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <div className="mx-4 w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Restaurant Details */}
      <section className="py-24 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-7xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Highlights */}
              {highlights && highlights.length > 0 && (
                <div className="mb-16">
                  <h2 className="text-3xl font-light text-slate-900 mb-8 tracking-tight text-center">
                    {t({ en: 'What Makes Us Special', es: 'Lo Que Nos Hace Especiales' })}
                  </h2>
                  <div className="space-y-4">
                    {highlights.map((highlight: string, index: number) => (
                      <div key={index} className="flex items-start p-6 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-300">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                        <span className="text-slate-700 leading-relaxed font-light">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="mb-16">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center mb-6">
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                      <div className="mx-4 w-2 h-2 bg-amber-400 rounded-full"></div>
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
                      {t({ en: 'Our Story', es: 'Nuestra Historia' })}
                    </h2>
                  </div>
                  <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-100">
                    <div className="prose prose-lg prose-slate max-w-none font-light leading-relaxed">
                      <PortableText value={description} />
                    </div>
                  </div>
                </div>
              )}

              {/* Leticia's Recommendation */}
              {restaurant.leticiaRecommendation && restaurant.leticiaRecommendation.isActive && (
                <div className="mb-16">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-6">
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                      <div className="mx-4 w-2 h-2 bg-amber-400 rounded-full"></div>
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
                      {t({ en: 'Leticia\'s Personal Recommendation', es: 'Recomendación Personal de Leticia' })}
                    </h2>
                  </div>
                  <LeticiaRecommendation 
                    recommendation={restaurant.leticiaRecommendation}
                    className="max-w-4xl mx-auto"
                  />
                </div>
              )}

              {/* Hours */}
              {restaurant.hours?.schedule && (
                <div className="mb-16">
                  <h2 className="text-3xl font-light text-slate-900 tracking-tight mb-8 text-center">
                    {t({ en: 'Opening Hours', es: 'Horarios de Apertura' })}
                  </h2>
                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="space-y-3">
                      {restaurant.hours.schedule.map((day: any, index: number) => {
                        const dayName = locale === 'en' ? day.day_en : day.day_es
                        const isToday = new Date().getDay() === index
                        
                        return (
                          <div 
                            key={index} 
                            className={`flex justify-between items-center p-4 rounded transition-all duration-300 ${
                              isToday 
                                ? 'bg-amber-50 border border-amber-200' 
                                : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <span className={`font-medium ${
                              isToday ? 'text-amber-800' : 'text-slate-700'
                            }`}>
                              {dayName}
                            </span>
                            <span className={`font-medium ${
                              day.closed 
                                ? 'text-red-600' 
                                : isToday 
                                  ? 'text-amber-700' 
                                  : 'text-slate-600'
                            }`}>
                              {day.closed 
                                ? t({ en: 'Closed', es: 'Cerrado' })
                                : `${day.openTime} - ${day.closeTime}`
                              }
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    {restaurant.hours.specialHours_en && (
                      <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <strong>{t({ en: 'Special Hours:', es: 'Horarios Especiales:' })}</strong>{' '}
                          {locale === 'en' ? restaurant.hours.specialHours_en : restaurant.hours.specialHours_es}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {restaurant.media?.gallery && restaurant.media.gallery.length > 0 && (
                <div className="mb-16">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">
                      {t({ en: 'Gallery', es: 'Galería' })}
                    </h2>
                    <p className="text-xl text-slate-600 font-light">
                      {t({ en: 'A visual journey through our dining experience', es: 'Un viaje visual a través de nuestra experiencia gastronómica' })}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurant.media.gallery.slice(0, 6).map((image: any, index: number) => {
                      const caption = locale === 'en' ? image.caption_en : image.caption_es
                      return (
                        <div key={index} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                          <Image
                            src={urlFor(image).width(500).height(375).url()}
                            alt={caption || `Restaurant photo ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          
                          {image.category && (
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-slate-800 rounded-full text-sm font-medium shadow-lg">
                                {image.category}
                              </span>
                            </div>
                          )}
                          
                          {caption && (
                            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <p className="text-white font-light text-sm leading-relaxed">
                                {caption}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Luxury Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 sticky top-24 shadow-lg hover:shadow-xl transition-shadow duration-500">
                <div className="text-center mb-8">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mx-auto mb-4"></div>
                  <h3 className="text-2xl font-light text-slate-900 tracking-tight">
                    {t({ en: 'Visit Us', es: 'Visítanos' })}
                  </h3>
                </div>
                
                <div className="space-y-6 mb-8">
                  {address && (
                    <div className="flex items-start group">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:shadow-md transition-shadow">
                        <MapPinIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="text-slate-700 font-light leading-relaxed">{address}</p>
                      </div>
                    </div>
                  )}

                  {restaurant.contact?.phone && (
                    <div className="flex items-center group">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:shadow-md transition-shadow">
                        <PhoneIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 pt-2">
                        <a 
                          href={`tel:${restaurant.contact.phone}`}
                          className="text-slate-700 hover:text-amber-600 transition-colors font-light"
                        >
                          {restaurant.contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {restaurant.contact?.email && (
                    <div className="flex items-center group">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:shadow-md transition-shadow">
                        <EnvelopeIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 pt-2">
                        <a 
                          href={`mailto:${restaurant.contact.email}`}
                          className="text-slate-700 hover:text-amber-600 transition-colors font-light break-all"
                        >
                          {restaurant.contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {restaurant.contact?.website && (
                    <div className="flex items-center group">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:shadow-md transition-shadow">
                        <GlobeAltIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 pt-2">
                        <a 
                          href={restaurant.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 hover:text-amber-600 transition-colors font-light"
                        >
                          {t({ en: 'Visit Website', es: 'Visitar Sitio Web' })}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {restaurant.contact?.reservationUrl && (
                  <a
                    href={restaurant.contact.reservationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block w-full text-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-8 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 mr-3" />
                      {t({ en: 'Reserve Your Table', es: 'Reservar Mesa' })}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                )}

                <div className="space-y-8">
                  {/* Price Range */}
                  {restaurant.pricing?.priceRange && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                      <h4 className="font-semibold text-slate-800 mb-3 text-center">
                        {t({ en: 'Price Range', es: 'Rango de Precios' })}
                      </h4>
                      <div className="text-center">
                        <span className="text-2xl font-light text-amber-600">
                          {restaurant.pricing.priceRange}
                        </span>
                        {restaurant.pricing.averagePrice && (
                          <p className="text-sm text-slate-600 mt-2 font-light">
                            ${restaurant.pricing.averagePrice} {t({ en: 'average', es: 'promedio' })}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cuisine */}
                  {restaurant.cuisine && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-4 text-center">
                        {t({ en: 'Cuisine', es: 'Cocina' })}
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {restaurant.cuisine.map((cuisine: string) => (
                          <span key={cuisine} className="px-3 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium">
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Atmosphere */}
                  {restaurant.vibes && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-4 text-center">
                        {t({ en: 'Atmosphere', es: 'Ambiente' })}
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {restaurant.vibes.map((vibe: string) => (
                          <span key={vibe} className="px-3 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-full text-sm font-medium">
                            {vibe.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {restaurant.features && restaurant.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-4 text-center">
                        {t({ en: 'Features', es: 'Características' })}
                      </h4>
                      <div className="space-y-3">
                        {restaurant.features.map((feature: any, index: number) => {
                          const name = locale === 'en' ? feature.feature_en : feature.feature_es
                          return (
                            <div key={index} className="flex items-center justify-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                              {feature.icon && <span className="mr-3 text-lg">{feature.icon}</span>}
                              <span className="font-light text-slate-700">{name}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Restaurants */}
      {relatedRestaurants.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-amber-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full text-sm font-medium tracking-wide uppercase mb-6">
                {t({ en: 'More Dining Options', es: 'Más Opciones Gastronómicas' })}
              </span>
              <h2 className="text-4xl md:text-5xl font-light text-slate-900 mb-6 tracking-tight">
                {t({ en: 'You Might Also Like', es: 'También Te Puede Gustar' })}
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
                {t({ 
                  en: 'Discover more exceptional dining experiences that share similar vibes and cuisine styles.',
                  es: 'Descubre más experiencias gastronómicas excepcionales que comparten ambientes y estilos de cocina similares.'
                })}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {relatedRestaurants.map((relatedRestaurant) => (
                <RelatedRestaurantCard
                  key={relatedRestaurant._id}
                  restaurant={relatedRestaurant}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function RelatedRestaurantCard({ restaurant, locale }: { restaurant: any; locale: string }) {
  const name = locale === 'en' ? restaurant.name_en : restaurant.name_es
  const summary = locale === 'en' ? restaurant.summary_en : restaurant.summary_es

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3]">
        {restaurant.featuredImage && (
          <Image
            src={urlFor(restaurant.featuredImage).width(400).height(300).url()}
            alt={name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        {restaurant.cuisine && (
          <p className="text-sm text-gray-600 mb-2">
            {restaurant.cuisine.slice(0, 2).join(' • ')}
          </p>
        )}
        {summary && (
          <p className="text-gray-600 mb-4 line-clamp-2">{summary}</p>
        )}
        <div className="flex items-center justify-between">
          {restaurant.pricing?.priceRange && (
            <span className="text-sm font-semibold text-orange-600">
              {restaurant.pricing.priceRange}
            </span>
          )}
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="text-orange-500 hover:text-orange-600 font-semibold text-sm"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}