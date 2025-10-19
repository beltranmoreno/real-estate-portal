'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/contexts/LocaleContext'
import PropertyGallery from '@/components/PropertyGallery'
import AmenitiesList from '@/components/AmenitiesList'
import PropertyMap from '@/components/PropertyMap'
import SameBedroomProperties from '@/components/SameBedroomProperties'
import SimilarThemeProperties from '@/components/SimilarThemeProperties'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import {
  MapPin,
  Share2,
  Heart,
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  Phone,
  Mail,
  MessageCircle,
  Star,
  ChevronLeft,
  ExternalLink,
  Clock,
  Shield,
  Waves,
  Plane,
  Cigarette,
  PawPrint,
  PartyPopper,
  X,
  Wifi,
  Ban,
  CheckCircle2,
} from 'lucide-react'

interface PropertyDetailClientProps {
  property: any
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const { locale, t } = useLocale()
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '', guests: 2 })
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [quoteData, setQuoteData] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [showMobileBooking, setShowMobileBooking] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Add CSS styles for calendar blocked dates
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      /* Blocked dates styling */
      .rdp-day_disabled:not(.rdp-day_outside) {
        background-color: #fef2f2 !important;
        color: #dc2626 !important;
        opacity: 1 !important;
      }
      .rdp-day_disabled:not(.rdp-day_outside):hover {
        background-color: #fef2f2 !important;
        color: #dc2626 !important;
        cursor: not-allowed !important;
      }
      /* Selected dates styling */
      .rdp-day_selected:not(.rdp-day_disabled) {
        background-color: #3b82f6 !important;
        color: white !important;
      }
      .rdp-day_selected:hover:not(.rdp-day_disabled) {
        background-color: #2563eb !important;
      }
      /* Range middle styling */
      .rdp-day_range_middle:not(.rdp-day_disabled) {
        background-color: #dbeafe !important;
        color: #1e40af !important;
      }
      /* Today styling */
      .rdp-day_today {
        font-weight: bold;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Process blocked dates for the calendar
  const blockedDates = useMemo(() => {
    const dates: Date[] = []

    if (property.availability?.blockedDates) {
      property.availability.blockedDates.forEach((block: any) => {
        const start = new Date(block.startDate)
        const end = new Date(block.endDate)

        // Add all dates in the range
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d))
        }
      })
    }

    return dates
  }, [property.availability?.blockedDates])

  // Check if a date is blocked
  const isDateBlocked = (date: Date) => {
    return blockedDates.some(blockedDate =>
      blockedDate.toDateString() === date.toDateString()
    )
  }

  // Disable past dates and blocked dates
  const disabledDays = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today || isDateBlocked(date)
  }

  // Check if pricing is on request - must be explicitly set to true
  const isPriceOnRequest = property.pricing?.rentalPricing?.priceOnRequest === true || property.pricing?.salePricing?.priceOnRequest === true

  // Calculate the applicable nightly rate based on selected dates
  const calculateApplicableRate = useMemo(() => {
    // If price is on request, don't show any pricing calculations
    if (isPriceOnRequest) {
      return {
        rate: null,
        averageRate: null,
        breakdown: null,
        seasonNames: [],
        priceOnRequest: true
      }
    }

    // Default to standard nightly rate
    const baseRate = property.pricing?.rentalPricing?.nightlyRate

    if (!dateRange?.from || !dateRange?.to || !baseRate) {
      return {
        rate: baseRate,
        averageRate: null,
        breakdown: null,
        seasonNames: []
      }
    }

    const selectedStart = dateRange.from
    const selectedEnd = dateRange.to
    const totalDays = Math.ceil((selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Build a day-by-day pricing map
    const dailyRates: { date: Date; rate: any; seasonName?: string }[] = []

    for (let d = new Date(selectedStart); d <= selectedEnd; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d)
      let dayRate = baseRate
      let daySeasonName = undefined

      // Check if this day falls within any seasonal pricing period
      if (property.pricing?.rentalPricing?.seasonalPricing) {
        for (const season of property.pricing.rentalPricing.seasonalPricing) {
          const seasonStart = new Date(season.startDate)
          const seasonEnd = new Date(season.endDate)

          if (currentDate >= seasonStart && currentDate <= seasonEnd) {
            dayRate = season.nightlyRate
            daySeasonName = season.name
            break // Use the first matching season
          }
        }
      }

      dailyRates.push({
        date: new Date(currentDate),
        rate: dayRate,
        seasonName: daySeasonName
      })
    }

    // Calculate average rate and build breakdown
    let totalAmount = 0
    const rateBreakdown: { [key: string]: { days: number; rate: any; total: number } } = {}
    const uniqueSeasons = new Set<string>()

    dailyRates.forEach(({ rate, seasonName }) => {
      const key = seasonName || 'Standard'
      if (seasonName) uniqueSeasons.add(seasonName)

      if (!rateBreakdown[key]) {
        rateBreakdown[key] = {
          days: 0,
          rate: rate,
          total: 0
        }
      }

      rateBreakdown[key].days++
      rateBreakdown[key].total += rate.amount
      totalAmount += rate.amount
    })

    // Calculate weighted average rate
    const averageAmount = totalAmount / totalDays
    const averageRate = {
      ...baseRate,
      amount: averageAmount
    }

    // Determine if it's mixed pricing
    const hasMixedRates = Object.keys(rateBreakdown).length > 1

    return {
      rate: hasMixedRates ? averageRate : dailyRates[0].rate,
      averageRate: hasMixedRates ? averageRate : null,
      breakdown: rateBreakdown, // Always return breakdown when we have dates
      seasonNames: Array.from(uniqueSeasons),
      hasMixedRates
    }
  }, [dateRange, property.pricing?.rentalPricing, isPriceOnRequest])

  // Helper function to translate category labels
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      exterior: { en: 'Exterior', es: 'Exterior' },
      interior: { en: 'Interior', es: 'Interior' },
      bedroom: { en: 'Bedroom', es: 'Dormitorio' },
      bathroom: { en: 'Bathroom', es: 'Baño' },
      kitchen: { en: 'Kitchen', es: 'Cocina' },
      living: { en: 'Living Area', es: 'Sala de Estar' },
      dining: { en: 'Dining', es: 'Comedor' },
      pool: { en: 'Pool', es: 'Piscina' },
      view: { en: 'View', es: 'Vista' },
      amenities: { en: 'Amenities', es: 'Amenidades' },
    }

    const label = labels[category]
    if (!label) return category
    return locale === 'es' ? label.es : label.en
  }

  const getThemeLabel = (theme: string) => {
    const themeLabels: Record<string, { en: string; es: string; icon: string }> = {
      family: { en: 'Family Friendly', es: 'Familiar', icon: '' },
      golf: { en: 'Golf', es: 'Golf', icon: '' },
      beachfront: { en: 'Beachfront', es: 'Frente al Mar', icon: '' },
      'remote-work': { en: 'Remote Work', es: 'Trabajo Remoto', icon: '' },
      events: { en: 'Events', es: 'Eventos', icon: '' },
      luxury: { en: 'Luxury', es: 'Lujo', icon: '' },
      budget: { en: 'Budget Friendly', es: 'Económico', icon: '' },
      'pet-friendly': { en: 'Pet Friendly', es: 'Mascotas Bienvenidas', icon: '' },
      'eco-friendly': { en: 'Eco Friendly', es: 'Eco Amigable', icon: '' },
      romantic: { en: 'Romantic', es: 'Romántico', icon: '' },
      adventure: { en: 'Adventure', es: 'Aventura', icon: '' },
      business: { en: 'Business', es: 'Negocios', icon: '' },
      culture: { en: 'Culture', es: 'Cultura', icon: '' },
      nightlife: { en: 'Nightlife', es: 'Vida Nocturna', icon: '' },
      relaxation: { en: 'Relaxation', es: 'Relajación', icon: '' },
      romance: { en: 'Romance', es: 'Romance', icon: '' },
      spa: { en: 'Spa', es: 'Spa', icon: '' },
      sports: { en: 'Sports', es: 'Deportes', icon: '' },
      wellness: { en: 'Wellness', es: 'Bienestar', icon: '' },
    }

    return themeLabels[theme] || { en: theme, es: theme, icon: '' }
  }

  // Get localized content
  const title = locale === 'es' ? property.title_es : property.title_en
  const description = locale === 'es' ? property.description_es : property.description_en
  const areaTitle = property.area
    ? (locale === 'es' ? property.area.title_es : property.area.title_en)
    : ''
  const address = locale === 'es' ? property.location?.address_es : property.location?.address_en

  const handleGetQuote = async () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      setValidationError(t({ en: 'Please select check-in and check-out dates', es: 'Por favor selecciona las fechas de entrada y salida' }))
      return
    }

    setValidationError(null)
    setLoadingQuote(true)
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property._id,
          checkIn: selectedDates.checkIn,
          checkOut: selectedDates.checkOut,
          guests: selectedDates.guests
        })
      })

      const data = await response.json()
      setQuoteData(data)
    } catch (error) {
      console.error('Quote error:', error)
      alert(t({ en: 'Error getting quote', es: 'Error al obtener cotización' }))
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleWhatsApp = () => {
    const message = `Hello! I'm interested in ${title}. Property Code: ${property.propertyCode}${selectedDates.checkIn ? `\nDates: ${selectedDates.checkIn} to ${selectedDates.checkOut}` : ''
      }${selectedDates.guests ? `\nGuests: ${selectedDates.guests}` : ''}`

    const whatsappUrl = `https://wa.me/${property.contactInfo?.whatsapp || property.contactInfo?.phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const formatPrice = (amount: number, currency: string | undefined) => {
    // Ensure currency is always a valid string
    const safeCurrency = (currency && typeof currency === 'string') ? currency : 'USD'

    try {
      return new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
        style: 'currency',
        currency: safeCurrency,
        minimumFractionDigits: 0
      }).format(amount || 0)
    } catch (error) {
      console.warn('Currency formatting error:', error, 'Using fallback format')
      // Fallback formatting if currency is invalid
      return `$${(amount || 0).toLocaleString()}`
    }
  }

  // Safe rate access with fallbacks
  const getSafeRate = () => {
    const rate = calculateApplicableRate?.rate
    if (!rate) return null

    return {
      amount: rate.amount || 0,
      currency: (rate.currency && typeof rate.currency === 'string') ? rate.currency : 'USD'
    }
  }

  const safeRate = getSafeRate()

  // Safe quote data access
  const getSafeQuoteData = () => {
    if (!quoteData) return null
    const quote = (quoteData as any)?.quote
    if (!quote) return null

    return {
      ...quote,
      currency: (quote.currency && typeof quote.currency === 'string') ? quote.currency : 'USD',
      total: quote.total || 0,
      nights: quote.nights || 1,
      breakdown: {
        accommodationTotal: quote.breakdown?.accommodationTotal || 0,
        cleaningFee: quote.breakdown?.cleaningFee || 0,
        taxAmount: quote.breakdown?.taxAmount || 0
      }
    }
  }

  const safeQuoteData = getSafeQuoteData()
  
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/search"
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors font-light"
            >
              <ChevronLeft className="w-5 h-5" />
              {t({ en: 'Back to Results', es: 'Volver a Resultados' })}
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-stone-300 text-stone-700 hover:bg-stone-100 font-light">
                <Share2 className="w-4 h-4 mr-2" />
                {t({ en: 'Share', es: 'Compartir' })}
              </Button>
              <Button variant="outline" size="sm" className="border-stone-300 text-stone-700 hover:bg-stone-100">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <PropertyGallery
              mainImage={property.mainImage}
              gallery={property.gallery || []}
              alt={title}
            />

            {/* Property Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {property.themes?.map((theme: string) => (
                  <Badge key={theme} variant="secondary" className="capitalize bg-stone-100 text-stone-700 border-stone-200 font-light">
                    {theme}
                  </Badge>
                ))}
                {property.isFeatured && (
                  <Badge variant="default" className="bg-stone-800 text-white border-stone-800 font-light">
                    {t({ en: 'Featured', es: 'Destacado' })}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-light text-stone-900 mb-2 tracking-wide">
                {title}
              </h1>

              <div className="flex items-center gap-2 text-stone-600 mb-4 font-light">
                <MapPin className="w-5 h-5" />
                <span>{address}{areaTitle ? `, ${areaTitle}` : ''}</span>
              </div>

              {property.reviews && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{property.reviews.averageRating}</span>
                  </div>
                  <span className="text-stone-600 font-light">
                    ({property.reviews.totalReviews} {t({ en: 'reviews', es: 'reseñas' })})
                  </span>
                </div>
              )}

              {/* Quick Actions */}
              {/* <div className="flex gap-3">
                <Button onClick={() => setShowInquiryForm(true)} className="flex-1 bg-stone-900 hover:bg-stone-800 font-light">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t({ en: 'Send Inquiry', es: 'Enviar Consulta' })}
                </Button>
                
                {property.contactInfo?.whatsapp && (
                  <Button onClick={handleWhatsApp} variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-100 font-light">
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div> */}
            </div>

            {/* Description */}
            {description && (
              <div>
                <h2 className="text-2xl font-light text-stone-900 mb-4">
                  {t({ en: 'About This Property', es: 'Sobre Esta Propiedad' })}
                </h2>
                <div className="prose prose-stone max-w-none">
                  <p className="text-stone-600 leading-relaxed font-light">{description}</p>
                </div>
              </div>
            )}

            {/* Leticia's Recommendation */}
            {property.leticiaRecommendation && property.leticiaRecommendation.isActive && (
              <div>
                <h2 className="text-2xl font-light text-stone-900 mb-4">
                  {t({ en: 'Leticia\'s Personal Recommendation', es: 'Recomendación Personal de Leticia' })}
                </h2>
                <LeticiaRecommendation 
                  recommendation={property.leticiaRecommendation}
                  className="mb-2"
                />
              </div>
            )}

            {/* Mobile Pricing Card - Show before amenities on mobile only */}
            <div className="lg:hidden mb-8">
              <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    {safeRate && (
                      <div>
                        <div className="text-2xl font-light text-stone-900 mb-1">
                          {formatPrice(safeRate.amount, safeRate.currency)}
                          <span className="text-sm font-light text-stone-600 ml-2">
                            / {t({ en: 'night', es: 'noche' })}
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 font-light mb-3">
                          {t({ en: 'Starting rate', es: 'Tarifa desde' })}
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => setShowMobileBooking(true)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-light tracking-wide"
                    >
                      {t({ en: 'Check Availability', es: 'Ver Disponibilidad' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-light text-stone-900 mb-6">
                {t({ en: 'Amenities', es: 'Amenidades' })}
              </h2>
              <AmenitiesList amenities={property.amenities} />
            </div>

            {/* Property Themes */}
            {property.themes && property.themes.length > 0 && (
              <div>
                <h2 className="text-2xl font-light text-stone-900 mb-6">
                  {t({ en: 'Property Features', es: 'Características de la Propiedad' })}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {property.themes.map((theme: string) => {
                    const themeInfo = getThemeLabel(theme)
                    return (
                      <div
                        key={theme}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 border border-stone-200 rounded-full text-stone-700 font-light"
                      >
                        {/* <span className="text-lg">{themeInfo.icon}</span> */}
                        <span className="text-sm">
                          {locale === 'es' ? themeInfo.es : themeInfo.en}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            <div>
              <h2 className="text-2xl font-light text-stone-900 mb-6">
                {t({ en: 'Availability Calendar', es: 'Calendario de Disponibilidad' })}
              </h2>

              <Card className="rounded-xs border border-slate-200 shadow-none">
                <CardContent className="p-6">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-100 rounded border border-slate-300"></div>
                      <span className="text-sm text-slate-600">
                        {t({ en: 'Available', es: 'Disponible' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 rounded border border-red-300"></div>
                      <span className="text-sm text-slate-600">
                        {t({ en: 'Booked', es: 'Reservado' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-slate-600">
                        {t({ en: 'Selected', es: 'Seleccionado' })}
                      </span>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="flex justify-center">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range)
                        if (range?.from && range?.to) {
                          setSelectedDates({
                            ...selectedDates,
                            checkIn: range.from.toISOString().split('T')[0],
                            checkOut: range.to.toISOString().split('T')[0]
                          })
                        }
                      }}
                      numberOfMonths={2}
                      disabled={disabledDays}
                      className="rounded-md"
                      modifiers={{
                        booked: blockedDates
                      }}
                      modifiersStyles={{
                        booked: {
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          fontWeight: '500'
                        }
                      }}
                      modifiersClassNames={{
                        booked: 'bg-red-100 text-red-600 hover:bg-red-100 hover:text-red-600'
                      }}
                    />
                  </div>

                  {/* Availability Info */}
                  <div className="mt-6 space-y-3 border-t pt-4">
                    {property.availability?.checkInTime && property.availability?.checkOutTime && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {t({ en: 'Check-in', es: 'Entrada' })}: {property.availability.checkInTime} |
                          {' '}{t({ en: 'Check-out', es: 'Salida' })}: {property.availability.checkOutTime}
                        </span>
                      </div>
                    )}

                    {property.pricing?.rentalPricing?.minimumNights && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {t({ en: 'Minimum stay', es: 'Estancia mínima' })}: {property.pricing.rentalPricing.minimumNights} {t({ en: 'nights', es: 'noches' })}
                        </span>
                      </div>
                    )}

                    {property.availability?.instantBooking && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {t({ en: 'Instant booking available', es: 'Reserva instantánea disponible' })}
                        </span>
                      </div>
                    )}

                    {property.availability?.preparationTime && property.availability.preparationTime > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Shield className="w-4 h-4" />
                        <span>
                          {t({
                            en: `${property.availability.preparationTime} day${property.availability.preparationTime > 1 ? 's' : ''} preparation time between bookings`,
                            es: `${property.availability.preparationTime} día${property.availability.preparationTime > 1 ? 's' : ''} de preparación entre reservas`
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Blocked Dates Info */}
                  {(() => {
                    const upcomingBookings = property.availability?.blockedDates?.filter(
                      (block: any) => new Date(block.endDate) >= new Date()
                    ) || []

                    return upcomingBookings.length > 0 && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">
                          {t({ en: 'Upcoming Bookings', es: 'Próximas Reservas' })}
                        </h4>
                        <div className="space-y-1">
                          {upcomingBookings
                            .slice(0, 3)
                            .map((block: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                                <Ban className="w-3 h-3" />
                                <span>
                                  {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                                  {block.reason === 'maintenance' && ` (${t({ en: 'Maintenance', es: 'Mantenimiento' })})`}
                                  {block.reason === 'owner' && ` (${t({ en: 'Owner use', es: 'Uso del propietario' })})`}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Seasonal Rates Information */}
                  {property.pricing?.rentalPricing && property.pricing.rentalPricing.length > 0 && (
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4">
                        {t({ en: 'Seasonal Rates Available', es: 'Tarifas Estacionales Disponibles' })}
                      </h3>
                      <div className="space-y-3">
                        {property.pricing.rentalPricing.map((rate: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <div>
                              <div className="font-medium text-slate-900">
                                {rate.seasonName || `${t({ en: 'Season', es: 'Temporada' })} ${index + 1}`}
                              </div>
                              <div className="text-sm text-slate-600">
                                {new Date(rate.startDate).toLocaleDateString()} - {new Date(rate.endDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-slate-900">
                                ${rate.nightly.toLocaleString()}/{t({ en: 'night', es: 'noche' })}
                              </div>
                              {rate.minimumNights && (
                                <div className="text-sm text-slate-600">
                                  {t({ en: 'Min', es: 'Mín' })} {rate.minimumNights} {t({ en: 'nights', es: 'noches' })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Agent */}
                  {(property.agent || property.contactInfo) && (
                    <div className="border-t pt-6 mt-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                          {t({ en: 'Contact Real Estate Agent', es: 'Contactar Agente Inmobiliario' })}
                        </h3>

                        {property.agent && (
                          <div className="flex items-center gap-3 mb-4">
                            {property.agent.photo && (
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                                <Image
                                  src={urlFor(property.agent.photo).width(48).height(48).quality(90).url()}
                                  alt={property.agent.name || 'Agent'}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-blue-900">{property.agent.name}</div>
                              <div className="text-sm text-blue-700">
                                {property.agent.yearsExperience && `${property.agent.yearsExperience} ${t({ en: 'years experience', es: 'años de experiencia' })}`}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                          {/* WhatsApp Button */}
                          {(property.agent?.whatsapp || property.contactInfo?.whatsapp) && (
                            <a
                              href={`https://wa.me/${(property.agent?.whatsapp || property.contactInfo?.whatsapp)?.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
                                `${t({ en: 'Hello! I\'m interested in', es: 'Hola! Estoy interesado en' })} ${property.title_en || property.title_es}.\n\n${dateRange?.from && dateRange?.to ?
                                  `${t({ en: 'Check-in', es: 'Llegada' })}: ${format(dateRange.from, 'PPP')}\n${t({ en: 'Check-out', es: 'Salida' })}: ${format(dateRange.to, 'PPP')}\n${t({ en: 'Guests', es: 'Huéspedes' })}: ${selectedDates.guests}\n\n` :
                                  ''
                                }${t({ en: 'Could you please provide more information and availability?', es: '¿Podrías proporcionar más información y disponibilidad?' })}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                              </svg>
                              WhatsApp
                            </a>
                          )}

                          {/* Email Button */}
                          {(property.agent?.email || property.contactInfo?.email) && (
                            <a
                              href={`mailto:${property.agent?.email || property.contactInfo?.email}?subject=${encodeURIComponent(
                                `${t({ en: 'Inquiry about', es: 'Consulta sobre' })} ${property.title_en || property.title_es}`
                              )}&body=${encodeURIComponent(
                                `${t({ en: 'Hello! I\'m interested in', es: 'Hola! Estoy interesado en' })} ${property.title_en || property.title_es}.\n\n${dateRange?.from && dateRange?.to ?
                                  `${t({ en: 'Check-in', es: 'Llegada' })}: ${format(dateRange.from, 'PPP')}\n${t({ en: 'Check-out', es: 'Salida' })}: ${format(dateRange.to, 'PPP')}\n${t({ en: 'Guests', es: 'Huéspedes' })}: ${selectedDates.guests}\n\n` :
                                  ''
                                }${t({ en: 'Could you please provide more information and availability?', es: '¿Podrías proporcionar más información y disponibilidad?' })}`
                              )}`}
                              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {t({ en: 'Email', es: 'Correo' })}
                            </a>
                          )}
                        </div>

                        {/* Response time info */}
                        {(property.agent?.responseTime || property.contactInfo?.responseTime) && (
                          <div className="mt-3 text-sm text-blue-700">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t({ en: 'Average response time', es: 'Tiempo promedio de respuesta' })}: {property.agent?.responseTime || property.contactInfo?.responseTime} {t({ en: 'hours', es: 'horas' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Image Gallery */}
            {property.gallery && property.gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-light mb-6">
                  {t({ en: 'Property Photos', es: 'Fotos de la Propiedad' })}
                </h2>

                {/* Group images by category for better organization */}
                {(() => {
                  // Group images by category
                  const groupedImages = property.gallery.reduce((acc: any, image: any, index: number) => {
                    const category = image.category || 'other'
                    if (!acc[category]) acc[category] = []
                    acc[category].push({ ...image, index })
                    return acc
                  }, {})

                  // Prioritized category order for better display
                  const categoryOrder = ['exterior', 'interior', 'living', 'bedroom', 'kitchen', 'bathroom', 'dining', 'pool', 'view', 'amenities', 'other']
                  const sortedCategories = categoryOrder.filter(cat => groupedImages[cat])

                  return sortedCategories.map((category) => (
                    <div key={category} className="mb-8 last:mb-0">
                      <h3 className="text-lg font-light text-slate-800 mb-4 flex items-center gap-2">
                        {getCategoryLabel(category)}
                        <span className="text-sm text-slate-500 font-light">
                          ({groupedImages[category].length} {groupedImages[category].length === 1 ?
                            t({ en: 'photo', es: 'foto' }) :
                            t({ en: 'photos', es: 'fotos' })
                          })
                        </span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedImages[category].map((image: any, idx: number) => (
                          <div key={`${category}-${idx}`} className="group cursor-pointer overflow-hidden rounded-xs bg-slate-100 transition-all duration-300 border border-slate-200">
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <Image
                                src={urlFor(image.asset).width(500).height(375).quality(85).url()}
                                alt={image.alt || image.caption || `${getCategoryLabel(category)} ${idx + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>
                            {image.caption && (
                              <div className="p-4">
                                <p className="text-sm text-slate-700 leading-relaxed">
                                  {image.caption}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}

            {/* Location */}
            {property.location && (
              <div>
                <h2 className="text-2xl font-light text-stone-900 mb-6 tracking-wide">
                  {t({ en: 'Location', es: 'Ubicación' })}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Location Info */}
                  <div className="space-y-4">
                    {property.location.distanceToBeach && (
                      <div className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-sm border border-stone-200/30 rounded-lg hover:bg-white/60 hover:border-stone-300/40 transition-all duration-300">
                        <div className="p-3 rounded-lg bg-stone-100/60 border border-stone-200/30">
                          <Waves className="w-5 h-5 text-teal-700" />
                        </div>
                        <div className="flex-1">
                          <div className="font-light text-stone-900 mb-1">
                            {t({ en: 'Distance to Beach', es: 'Distancia a la Playa' })}
                          </div>
                          <div className="text-stone-600 font-light">
                            {property.location.distanceToBeach}m
                          </div>
                        </div>
                      </div>
                    )}

                    {property.location.distanceToAirport && (
                      <div className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-sm border border-stone-200/30 rounded-lg hover:bg-white/60 hover:border-stone-300/40 transition-all duration-300">
                        <div className="p-3 rounded-lg bg-stone-100/60 border border-stone-200/30">
                          <Plane className="w-5 h-5 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <div className="font-light text-stone-900 mb-1">
                            {t({ en: 'Distance to Airport', es: 'Distancia al Aeropuerto' })}
                          </div>
                          <div className="text-stone-600 font-light">
                            {property.location.distanceToAirport}km
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nearby Attractions */}
                  {property.location.nearbyAttractions && property.location.nearbyAttractions.length > 0 && (
                    <div>
                      <h4 className="text-lg font-light text-stone-900 mb-4 tracking-wide">
                        {t({ en: 'Nearby Attractions', es: 'Atracciones Cercanas' })}
                      </h4>
                      <div className="bg-white/30 backdrop-blur-sm border border-stone-200/30 rounded-lg p-4">
                        <div className="space-y-3">
                          {property.location.nearbyAttractions.slice(0, 5).map((attraction: any, index: number) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-stone-200/30 last:border-b-0">
                              <span className="text-stone-800 font-light">
                                {locale === 'es' ? attraction.name_es : attraction.name_en}
                              </span>
                              {attraction.distance && (
                                <span className="text-sm text-stone-600 bg-stone-100/60 px-2 py-1 rounded-full">
                                  {attraction.distance}km
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Map */}
                <div className="mt-8">
                  <h3 className="text-xl font-light mb-4">
                    {t({ en: 'Property Location', es: 'Ubicación de la Propiedad' })}
                  </h3>
                  <PropertyMap
                    coordinates={property.location.coordinates ? {
                      lat: property.location.coordinates.lat,
                      lng: property.location.coordinates.lng
                    } : undefined}
                    address={locale === 'es' ? property.location.address_es : property.location.address_en}
                    propertyTitle={locale === 'es' ? property.title_es : property.title_en}
                    className="h-[400px] w-full"
                  />
                  {(property.location.address_es || property.location.address_en) && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-slate-900 mb-1">
                            {t({ en: 'Address', es: 'Dirección' })}
                          </h4>
                          <p className="text-slate-700">
                            {locale === 'es' ? property.location.address_es : property.location.address_en}
                          </p>
                          {property.area?.title_en && (
                            <p className="text-sm text-slate-600 mt-1">
                              {locale === 'es' ? property.area.title_es : property.area.title_en}
                              {property.area.region && `, ${property.area.region}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* House Rules */}
            {property.houseRules && (
              <div>
                <h2 className="text-2xl font-light text-stone-900 mb-6 tracking-wide">
                  {t({ en: 'House Rules', es: 'Reglas de la Casa' })}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {property.houseRules.smokingAllowed !== undefined && (
                    <div className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-sm border border-stone-200/30 rounded-lg hover:bg-white/60 hover:border-stone-300/40 transition-all duration-300">
                      <div className="p-3 rounded-lg bg-stone-100/60 border border-stone-200/30">
                        <Cigarette className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-light text-stone-900">{t({ en: 'Smoking', es: 'Fumar' })}</span>
                        <div className="flex items-center gap-2">
                          {property.houseRules.smokingAllowed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <span className="text-sm font-light text-teal-700">{t({ en: 'Allowed', es: 'Permitido' })}</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 text-slate-500" />
                              <span className="text-sm font-light text-slate-600">{t({ en: 'Not Allowed', es: 'No Permitido' })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.houseRules.petsAllowed !== undefined && (
                    <div className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-sm border border-stone-200/30 rounded-lg hover:bg-white/60 hover:border-stone-300/40 transition-all duration-300">
                      <div className="p-3 rounded-lg bg-stone-100/60 border border-stone-200/30">
                        <PawPrint className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-light text-stone-900">{t({ en: 'Pets', es: 'Mascotas' })}</span>
                        <div className="flex items-center gap-2">
                          {property.houseRules.petsAllowed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <span className="text-sm font-light text-teal-700">{t({ en: 'Allowed', es: 'Permitidas' })}</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 text-slate-500" />
                              <span className="text-sm font-light text-slate-600">{t({ en: 'Not Allowed', es: 'No Permitidas' })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.houseRules.eventsAllowed !== undefined && (
                    <div className="flex items-center gap-4 p-4 bg-white/40 backdrop-blur-sm border border-stone-200/30 rounded-lg hover:bg-white/60 hover:border-stone-300/40 transition-all duration-300">
                      <div className="p-3 rounded-lg bg-stone-100/60 border border-stone-200/30">
                        <PartyPopper className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-light text-stone-900">{t({ en: 'Events', es: 'Eventos' })}</span>
                        <div className="flex items-center gap-2">
                          {property.houseRules.eventsAllowed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <span className="text-sm font-light text-teal-700">{t({ en: 'Allowed', es: 'Permitidos' })}</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 text-slate-500" />
                              <span className="text-sm font-light text-slate-600">{t({ en: 'Not Allowed', es: 'No Permitidos' })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Pricing Card */}
              <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xs">
                <CardContent className="p-6">
                  <div className="mb-6">
                    {property.availability?.isAvailable === false ? (
                      <div className="text-center py-4">
                        <div className="text-lg font-light text-slate-700 italic mb-2">
                          {t({ en: 'Property doesn\'t seem to be available', es: 'La propiedad no parece estar disponible' })}
                        </div>
                        <p className="text-sm text-slate-600 font-light">
                          {t({ en: 'Contact Leticia for information', es: 'Contacta a Leticia para información' })}
                        </p>
                      </div>
                    ) : isPriceOnRequest ? (
                      <div className="text-center py-4">
                        <div className="text-lg font-light text-slate-700 italic mb-2">
                          {t({ en: 'Price on request', es: 'Precio bajo consulta' })}
                        </div>
                        <p className="text-sm text-slate-600 font-light">
                          {t({ en: 'Contact us for detailed pricing information', es: 'Contáctanos para información detallada de precios' })}
                        </p>
                      </div>
                    ) : calculateApplicableRate.rate && (
                      <div>
                        <div className="text-3xl font-light text-stone-900 mb-1">
                          {formatPrice(calculateApplicableRate.rate.amount, calculateApplicableRate.rate.currency)}
                          <span className="text-lg font-light text-stone-600 ml-2">
                            / {t({ en: 'night', es: 'noche' })}
                            {calculateApplicableRate.hasMixedRates && (
                              <span className="text-sm text-teal-600 ml-1">
                                ({t({ en: 'avg', es: 'prom' })})
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Show rate breakdown */}
                        {calculateApplicableRate.breakdown && Object.keys(calculateApplicableRate.breakdown).length > 0 && (
                          <div className="mt-3 p-3 bg-stone-50/60 backdrop-blur-sm rounded-lg border border-stone-200/30">
                            <div className="text-xs font-light text-stone-700 mb-2">
                              {t({ en: 'Rate Breakdown', es: 'Desglose de Tarifas' })}:
                            </div>
                            <div className="space-y-1">
                              {Object.entries(calculateApplicableRate.breakdown).map(([period, details]: [string, any]) => (
                                <div key={period} className="flex justify-between text-xs">
                                  <span className="text-slate-600">
                                    {period} ({details.days} {details.days === 1 ? t({ en: 'night', es: 'noche' }) : t({ en: 'nights', es: 'noches' })})
                                  </span>
                                  <span className="font-medium text-slate-700">
                                    {formatPrice(details.rate.amount, details.rate.currency)}/night
                                  </span>
                                </div>
                              ))}
                            </div>
                            {calculateApplicableRate.averageRate && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <div className="flex justify-between text-xs">
                                  <span className="font-medium text-slate-700">
                                    {t({ en: 'Average per night', es: 'Promedio por noche' })}:
                                  </span>
                                  <span className="font-light text-stone-900">
                                    {formatPrice(calculateApplicableRate.averageRate.amount, calculateApplicableRate.averageRate.currency)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Show single season badge */}
                        {calculateApplicableRate.seasonNames.length === 1 && !calculateApplicableRate.hasMixedRates && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {calculateApplicableRate.seasonNames[0]}
                            </Badge>
                          </div>
                        )}

                        {/* Standard rate message */}
                        {!calculateApplicableRate.hasMixedRates && calculateApplicableRate.seasonNames.length === 0 && dateRange?.from && dateRange?.to && (
                          <div className="text-sm text-green-600 mt-1">
                            {t({ en: 'Standard rate applies', es: 'Se aplica tarifa estándar' })}
                          </div>
                        )}
                      </div>
                    )}

                    {property.pricing?.salePricing && !property.pricing?.rentalPricing?.nightlyRate && (
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {property.pricing.salePricing.priceOnRequest ? (
                          <span className="text-2xl font-medium text-slate-700 italic">
                            {t({ en: 'Price on request', es: 'Precio bajo consulta' })}
                          </span>
                        ) : property.pricing.salePricing.salePrice ? (
                          formatPrice(property.pricing.salePricing.salePrice.amount, property.pricing.salePricing.salePrice.currency)
                        ) : null}
                      </div>
                    )}

                    {property.pricing?.rentalPricing?.minimumNights && !isPriceOnRequest && property.availability?.isAvailable === true && (
                      <div className="text-sm text-slate-600 mt-2">
                        {t({ en: 'Minimum', es: 'Mínimo' })}: {property.pricing.rentalPricing.minimumNights} {t({ en: 'nights', es: 'noches' })}
                      </div>
                    )}

                    {/* Show seasonal pricing info if available */}
                    {property.pricing?.rentalPricing?.seasonalPricing && property.pricing.rentalPricing.seasonalPricing.length > 0 && !isPriceOnRequest && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs font-medium text-blue-900 mb-1">
                          {t({ en: 'Seasonal Rates Available', es: 'Tarifas de Temporada Disponibles' })}
                        </div>
                        <div className="space-y-1">
                          {property.pricing.rentalPricing.seasonalPricing.slice(0, 2).map((season: any, idx: number) => (
                            <div key={idx} className="text-xs text-blue-700">
                              {season.name}: {formatPrice(season.nightlyRate.amount, season.nightlyRate.currency)}
                              <span className="text-blue-600 ml-1">
                                ({new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Disclaimer */}
                    <div className="mt-3 flex items-start gap-1">
                      <Shield className="w-3 h-3 text-stone-500 mt-0.5" />
                      <p className="text-xs text-stone-500 leading-relaxed font-light">
                        {t({
                          en: 'Prices shown are estimates and subject to availability. Additional fees may apply.',
                          es: 'Los precios mostrados son estimados y sujetos a disponibilidad. Pueden aplicar cargos adicionales.'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-light text-stone-700 mb-2 tracking-wide">
                        {t({ en: 'Select Dates', es: 'Seleccionar Fechas' })}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              validationError && !dateRange?.from && "border-red-500 focus:ring-red-500"
                            )}
                            onClick={() => setValidationError(null)}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "MMM d, yyyy")} -{" "}
                                  {format(dateRange.to, "MMM d, yyyy")}
                                </>
                              ) : (
                                format(dateRange.from, "MMM d, yyyy")
                              )
                            ) : (
                              <span className="text-muted-foreground">
                                {t({ en: 'Pick dates', es: 'Elegir fechas' })}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => {
                              setDateRange(range)
                              if (range?.from && range?.to) {
                                setSelectedDates({
                                  ...selectedDates,
                                  checkIn: range.from.toISOString().split('T')[0],
                                  checkOut: range.to.toISOString().split('T')[0]
                                })
                              }
                            }}
                            numberOfMonths={2}
                            disabled={disabledDays}
                            modifiers={{
                              booked: blockedDates
                            }}
                            modifiersStyles={{
                              booked: {
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                fontWeight: '500'
                              }
                            }}
                            className="rounded-md"
                          />
                          <div className="p-3 border-t">
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-100 rounded"></div>
                                <span className="text-slate-600">
                                  {t({ en: 'Booked', es: 'Reservado' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <span className="text-slate-600">
                                  {t({ en: 'Selected', es: 'Seleccionado' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {validationError && !dateRange?.from && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {validationError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-light text-stone-700 mb-2 tracking-wide">
                        {t({ en: 'Guests', es: 'Huéspedes' })}
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max={property.amenities?.maxGuests || 10}
                        value={selectedDates.guests}
                        onChange={(e) => setSelectedDates({ ...selectedDates, guests: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* Quote Section */}
                  {safeQuoteData && (
                    <div className="border border-stone-200/30 rounded-lg p-4 mb-4 bg-stone-50/40 backdrop-blur-sm">
                      <h4 className="font-light text-stone-900 mb-3 tracking-wide">
                        {t({ en: 'Price Estimate', es: 'Estimado de Precio' })}
                      </h4>
                      <div className="space-y-1 text-sm">
                        {/* Show detailed breakdown if mixed rates apply */}
                        {calculateApplicableRate.breakdown ? (
                          <>
                            {Object.entries(calculateApplicableRate.breakdown).map(([period, details]: [string, any]) => (
                              <div key={period}>
                                <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                                  <span className="font-medium">{period}:</span>
                                </div>
                                <div className="flex justify-between pl-2">
                                  <span>
                                    {details.days} {details.days === 1 ? t({ en: 'night', es: 'noche' }) : t({ en: 'nights', es: 'noches' })} × {formatPrice(details.rate.amount, details.rate.currency)}
                                  </span>
                                  <span>{formatPrice(details.total, details.rate.currency)}</span>
                                </div>
                              </div>
                            ))}
                            <div className="border-t pt-1 mt-1">
                              <div className="flex justify-between font-medium">
                                <span>{t({ en: 'Accommodation Total', es: 'Total Alojamiento' })}</span>
                                <span>{formatPrice(safeQuoteData?.breakdown.accommodationTotal || 0, safeQuoteData?.currency)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>{t({ en: 'Price per night', es: 'Precio por noche' })}</span>
                              <span className="font-medium">
                                {formatPrice(
                                  calculateApplicableRate.rate?.amount || (quoteData as any).quote?.breakdown.accommodationTotal / (quoteData as any).quote?.nights,
                                  (quoteData as any).quote?.currency
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>
                                {safeQuoteData?.nights || 1} {t({ en: 'nights', es: 'noches' })} × {formatPrice(
                                  calculateApplicableRate.rate?.amount || (quoteData as any).quote?.breakdown.accommodationTotal / (quoteData as any).quote?.nights,
                                  (quoteData as any).quote?.currency
                                )}
                              </span>
                              <span>{formatPrice(safeQuoteData?.breakdown.accommodationTotal || 0, safeQuoteData?.currency)}</span>
                            </div>
                          </>
                        )}
                        {(safeQuoteData?.breakdown.cleaningFee || 0) > 0 && (
                          <div className="flex justify-between">
                            <span>{t({ en: 'Cleaning fee', es: 'Tarifa de limpieza' })}</span>
                            <span>{formatPrice(safeQuoteData?.breakdown.cleaningFee || 0, safeQuoteData?.currency)}</span>
                          </div>
                        )}
                        {(safeQuoteData?.breakdown.taxAmount || 0) > 0 && (
                          <div className="flex justify-between">
                            <span>{t({ en: 'Taxes', es: 'Impuestos' })}</span>
                            <span>{formatPrice(safeQuoteData?.breakdown.taxAmount || 0, safeQuoteData?.currency)}</span>
                          </div>
                        )}
                        <div className="border-t pt-1 mt-2 flex justify-between font-semibold">
                          <span>{t({ en: 'Total', es: 'Total' })}</span>
                          <span className="text-lg">{formatPrice(safeQuoteData?.total || 0, safeQuoteData?.currency)}</span>
                        </div>
                        <div className="text-xs text-slate-500 pt-1">
                          {calculateApplicableRate.breakdown ? (
                            <span>
                              {t({ en: 'Average total per night', es: 'Promedio total por noche' })}: {formatPrice((safeQuoteData?.total || 0) / (safeQuoteData?.nights || 1), safeQuoteData?.currency)}
                            </span>
                          ) : (
                            <span>
                              {t({ en: 'Total per night', es: 'Total por noche' })}: {formatPrice((safeQuoteData?.total || 0) / (safeQuoteData?.nights || 1), safeQuoteData?.currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <div className="mt-3 p-2 bg-stone-100/60 backdrop-blur-sm rounded-md border border-stone-200/30">
                        <p className="text-xs text-stone-800 leading-relaxed font-light">
                          {t({
                            en: '* This is a preliminary estimate for informational purposes only. Final pricing may vary based on additional services, special requests, or changes in availability. Please contact us for a formal quote.',
                            es: '* Este es un estimado preliminar solo para fines informativos. El precio final puede variar según servicios adicionales, solicitudes especiales o cambios en disponibilidad. Por favor contáctenos para una cotización formal.'
                          })}
                        </p>
                      </div>

                      {/* Contact Buttons - Show after quote is calculated */}
                      <div className="mt-4 space-y-2">
                        <div className="text-xs font-light text-stone-700 mb-2 tracking-wide">
                          {t({ en: 'Interested? Contact us now:', es: '¿Interesado? Contáctanos ahora:' })}
                        </div>

                        {/* WhatsApp Button */}
                        <Button
                          onClick={() => {
                            const quoteInfo = safeQuoteData
                            const message = encodeURIComponent(
                              `${t({ en: 'Hello! I\'m interested in', es: 'Hola! Estoy interesado en' })} ${title}\n\n` +
                              `📅 ${t({ en: 'Dates', es: 'Fechas' })}: ${dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : ''} - ${dateRange?.to ? format(dateRange.to, 'MMM d, yyyy') : ''}\n` +
                              `👥 ${t({ en: 'Guests', es: 'Huéspedes' })}: ${selectedDates.guests}\n` +
                              `💰 ${t({ en: 'Estimated Total', es: 'Total Estimado' })}: ${formatPrice(quoteInfo?.total || 0, quoteInfo?.currency)}\n` +
                              `🏠 ${t({ en: 'Property Code', es: 'Código de Propiedad' })}: ${property.propertyCode || property._id}\n\n` +
                              `${t({ en: 'Please confirm availability and final pricing.', es: 'Por favor confirma disponibilidad y precio final.' })}`
                            )
                            const whatsappNumber = property.agent?.whatsapp || property.agent?.phone || property.contactInfo?.whatsapp || property.contactInfo?.phone || '+18293422566'
                            const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`
                            window.open(whatsappUrl, '_blank')
                          }}
                          variant="default"
                          className="w-full bg-teal-600 hover:bg-teal-700 font-light tracking-wide"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {t({ en: 'WhatsApp Quote', es: 'Cotización por WhatsApp' })}
                        </Button>

                        {/* Email Button */}
                        <Button
                          onClick={() => {
                            const quoteInfo = safeQuoteData
                            const subject = encodeURIComponent(
                              `${t({ en: 'Quote Request for', es: 'Solicitud de Cotización para' })} ${title}`
                            )
                            const body = encodeURIComponent(
                              `${t({ en: 'Hello,\n\nI would like to request a formal quote for the following booking:', es: 'Hola,\n\nMe gustaría solicitar una cotización formal para la siguiente reserva:' })}\n\n` +
                              `${t({ en: 'Property', es: 'Propiedad' })}: ${title}\n` +
                              `${t({ en: 'Property Code', es: 'Código' })}: ${property.propertyCode || property._id}\n` +
                              `${t({ en: 'Check-in', es: 'Entrada' })}: ${dateRange?.from ? format(dateRange.from, 'MMMM d, yyyy') : ''}\n` +
                              `${t({ en: 'Check-out', es: 'Salida' })}: ${dateRange?.to ? format(dateRange.to, 'MMMM d, yyyy') : ''}\n` +
                              `${t({ en: 'Number of guests', es: 'Número de huéspedes' })}: ${selectedDates.guests}\n` +
                              `${t({ en: 'Estimated Total', es: 'Total Estimado' })}: ${formatPrice(quoteInfo?.total || 0, quoteInfo?.currency)}\n\n` +
                              `${t({ en: 'Please provide the final pricing and confirm availability.', es: 'Por favor proporcione el precio final y confirme la disponibilidad.' })}\n\n` +
                              `${t({ en: 'Thank you!', es: '¡Gracias!' })}`
                            )
                            const emailAddress = property.agent?.email || property.contactInfo?.email || 'info@drproperties.com'
                            window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {t({ en: 'Email Quote Request', es: 'Solicitar Cotización por Email' })}
                        </Button>
                      </div>
                    </div>
                  )}

                  {property.availability?.isAvailable === false ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          const message = encodeURIComponent(
                            `${t({ en: 'Hello! I\'m interested in', es: 'Hola! Estoy interesado en' })} ${title}\n\n` +
                            `🏠 ${t({ en: 'Property Code', es: 'Código de Propiedad' })}: ${property.propertyCode || property._id}\n\n` +
                            `${t({ en: 'This property shows as unavailable. Could you please check availability and provide information?', es: 'Esta propiedad aparece como no disponible. ¿Podrías verificar la disponibilidad y proporcionar información?' })}`
                          )
                          const whatsappNumber = '+18293422566' // Leticia's WhatsApp
                          const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`
                          window.open(whatsappUrl, '_blank')
                        }}
                        className="w-full bg-teal-600 hover:bg-teal-700"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {t({ en: 'WhatsApp Leticia', es: 'WhatsApp a Leticia' })}
                      </Button>
                      <Button
                        onClick={() => {
                          const subject = encodeURIComponent(
                            `${t({ en: 'Availability Inquiry for', es: 'Consulta de Disponibilidad para' })} ${title}`
                          )
                          const body = encodeURIComponent(
                            `${t({ en: 'Hello Leticia,\n\nI am interested in the following property that shows as unavailable:', es: 'Hola Leticia,\n\nEstoy interesado en la siguiente propiedad que aparece como no disponible:' })}\n\n` +
                            `${t({ en: 'Property', es: 'Propiedad' })}: ${title}\n` +
                            `${t({ en: 'Property Code', es: 'Código' })}: ${property.propertyCode || property._id}\n\n` +
                            `${t({ en: 'Could you please check the availability and provide updated information?', es: '¿Podrías verificar la disponibilidad y proporcionar información actualizada?' })}\n\n` +
                            `${t({ en: 'Thank you!', es: '¡Gracias!' })}`
                          )
                          window.location.href = `mailto:leticia@drproperties.com?subject=${subject}&body=${body}`
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {t({ en: 'Email Leticia', es: 'Email a Leticia' })}
                      </Button>
                    </div>
                  ) : isPriceOnRequest ? (
                    <Button
                      onClick={handleWhatsApp}
                      className="w-full"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {t({ en: 'Contact for Pricing', es: 'Contactar para Precio' })}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleGetQuote}
                      className="w-full"
                      disabled={loadingQuote}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {loadingQuote
                        ? t({ en: 'Calculating Estimate...', es: 'Calculando Estimado...' })
                        : t({ en: 'Get Price Estimate', es: 'Obtener Estimado de Precio' })
                      }
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Contact Card - Agent or Fallback */}
              {(property.agent) && (
                <Card className="bg-white/60 backdrop-blur-sm border-stone-200/50 transition-all duration-300 rounded-xs">
                  <CardContent className="p-6">
                    <h3 className="font-light text-stone-900 mb-4 tracking-wide">
                      {property.agent
                        ? t({ en: 'Your Agent', es: 'Tu Agente' })
                        : t({ en: 'Contact Host', es: 'Contactar Anfitrión' })
                      }
                    </h3>
                    {/* Agent Info */}
                    <div className="flex items-start gap-3 mb-4">
                      {property.agent.photo ? (
                        <img
                          src={urlFor(property.agent.photo).width(80).height(80).url()}
                          alt={property.agent.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-stone-100/60 border border-stone-200/30 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-slate-700" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-light text-stone-900">{property.agent.name}</div>
                        <div className="text-sm text-teal-700 mb-1 font-light">
                          {t({ en: 'Real Estate Agent', es: 'Agente Inmobiliario' })}
                        </div>
                        {property.agent.responseTime && (
                          <div className="text-xs text-stone-500 font-light">
                            {t({ en: 'Responds in', es: 'Responde en' })} {property.agent.responseTime}h
                          </div>
                        )}
                        {property.agent.yearsExperience && (
                          <div className="text-xs text-stone-500 font-light">
                            {property.agent.yearsExperience} {t({ en: 'years experience', es: 'años de experiencia' })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Phone Button */}
                      {(property.agent?.phone || property.contactInfo?.phone) && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.location.href = `tel:${property.agent?.phone || property.contactInfo?.phone}`}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {property.agent?.phone || property.contactInfo?.phone}
                        </Button>
                      )}

                      {/* WhatsApp Button */}
                      {(property.agent?.whatsapp || property.contactInfo?.whatsapp) && (
                        <Button
                          onClick={handleWhatsApp}
                          variant="outline"
                          className="w-full justify-start text-green-600 hover:text-green-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      )}

                      {/* Email Button */}
                      {(property.agent?.email || property.contactInfo?.email) && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.location.href = `mailto:${property.agent?.email || property.contactInfo?.email}`}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {t({ en: 'Email', es: 'Correo' })}
                        </Button>
                      )}

                      {/* Agent Specializations */}
                      {property.agent?.specializations && property.agent.specializations.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs font-light text-stone-700 mb-2 tracking-wide">
                            {t({ en: 'Specializes in', es: 'Se especializa en' })}:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {property.agent.specializations.slice(0, 3).map((spec: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-stone-100/60 text-stone-700 border-stone-200/30">
                                {spec.charAt(0).toUpperCase() + spec.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Related Properties Sections */}
        <div className="mt-16 space-y-4">
          {/* Properties with Same Bedrooms */}
          <SameBedroomProperties
            currentPropertyId={property._id}
            bedrooms={property.amenities?.bedrooms}
            listingType={property.pricing?.type}
            locale={locale}
          />

          {/* Similar Properties by Theme */}
          <SimilarThemeProperties
            currentPropertyId={property._id}
            themes={property.themes}
            listingType={property.pricing?.type}
            locale={locale}
          />
        </div>
      </div>

      {/* Floating Mobile Booking Button */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-white/95 backdrop-blur-xl border border-stone-200/50 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              {safeRate && (
                <div className="text-lg font-light text-stone-900">
                  {formatPrice(safeRate.amount, safeRate.currency)}
                  <span className="text-sm text-stone-600 ml-1">
                    / {t({ en: 'night', es: 'noche' })}
                  </span>
                </div>
              )}
              <div className="text-xs text-stone-600 font-light">
                {t({ en: 'Tap to book', es: 'Toca para reservar' })}
              </div>
            </div>
            <Button
              onClick={() => setShowMobileBooking(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 font-light tracking-wide"
            >
              {t({ en: 'Book Now', es: 'Reservar' })}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Booking Modal */}
      {showMobileBooking && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowMobileBooking(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-stone-200/50 rounded-t-xl shadow-2xl max-h-[85dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-200/50 flex-shrink-0 bg-white/98 backdrop-blur-xl">
              <h3 className="text-lg font-light text-stone-900 tracking-wide">
                {t({ en: 'Book Your Stay', es: 'Reserva tu Estadía' })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileBooking(false)}
                className="p-2 hover:bg-stone-100/50"
              >
                <X className="w-5 h-5 text-stone-600" />
              </Button>
            </div>

            {/* Booking Content - Full Desktop Sidebar Content */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0">
              <div className="mb-6">
                {isPriceOnRequest ? (
                  <div className="text-center py-4">
                    <div className="text-2xl font-medium text-slate-700 italic mb-2">
                      {t({ en: 'Price on request', es: 'Precio bajo consulta' })}
                    </div>
                    <p className="text-sm text-slate-600 font-light">
                      {t({ en: 'Contact us for pricing info', es: 'Contáctanos para info de precios' })}
                    </p>
                  </div>
                ) : safeRate && (
                  <div>
                    <div className="text-3xl font-light text-stone-900 mb-1">
                      {formatPrice(safeRate.amount, safeRate.currency)}
                      <span className="text-lg font-light text-stone-600 ml-2">
                        / {t({ en: 'night', es: 'noche' })}
                        {calculateApplicableRate.hasMixedRates && (
                          <span className="text-sm text-teal-600 ml-1">
                            ({t({ en: 'avg', es: 'prom' })})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Show breakdown for mixed rates */}
                    {calculateApplicableRate.breakdown && (
                      <div className="mt-3 p-3 bg-stone-50/60 backdrop-blur-sm rounded-lg border border-stone-200/30">
                        <div className="text-xs font-light text-stone-700 mb-2">
                          {t({ en: 'Rate Breakdown', es: 'Desglose de Tarifas' })}:
                        </div>
                        <div className="space-y-1">
                          {Object.entries(calculateApplicableRate.breakdown).map(([period, details]: [string, any]) => (
                            <div key={period} className="flex justify-between text-xs">
                              <span className="text-stone-600 font-light">
                                {period} ({details.days} {details.days === 1 ? t({ en: 'night', es: 'noche' }) : t({ en: 'nights', es: 'noches' })})
                              </span>
                              <span className="font-light text-stone-700">
                                {formatPrice(details.rate.amount, details.rate.currency)}/night
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-stone-200/50">
                          <div className="flex justify-between text-xs">
                            <span className="font-light text-stone-700">
                              {t({ en: 'Average per night', es: 'Promedio por noche' })}:
                            </span>
                            <span className="font-light text-stone-900">
                              {formatPrice(calculateApplicableRate.averageRate.amount, calculateApplicableRate.averageRate.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Single season badge */}
                    {calculateApplicableRate.seasonNames.length === 1 && !calculateApplicableRate.hasMixedRates && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs bg-stone-100/60 text-stone-700 border-stone-200/30">
                          {calculateApplicableRate.seasonNames[0]}
                        </Badge>
                      </div>
                    )}

                    {/* Standard rate message */}
                    {!calculateApplicableRate.hasMixedRates && calculateApplicableRate.seasonNames.length === 0 && dateRange?.from && dateRange?.to && (
                      <div className="text-sm text-teal-600 mt-1 font-light">
                        {t({ en: 'Standard rate applies', es: 'Se aplica tarifa estándar' })}
                      </div>
                    )}
                  </div>
                )}

                {property.pricing?.salePricing && !property.pricing?.rentalPricing?.nightlyRate && (
                  <div className="text-3xl font-light text-stone-900 mb-1">
                    {property.pricing.salePricing.priceOnRequest ? (
                      <span className="text-2xl font-medium text-slate-700 italic">
                        {t({ en: 'Price on request', es: 'Precio bajo consulta' })}
                      </span>
                    ) : property.pricing.salePricing.salePrice ? (
                      formatPrice(property.pricing.salePricing.salePrice.amount, property.pricing.salePricing.salePrice.currency)
                    ) : null}
                  </div>
                )}

                {property.pricing?.rentalPricing?.minimumNights && !isPriceOnRequest && (
                  <div className="text-sm text-stone-600 mt-2 font-light">
                    {t({ en: 'Minimum', es: 'Mínimo' })}: {property.pricing.rentalPricing.minimumNights} {t({ en: 'nights', es: 'noches' })}
                  </div>
                )}

                {/* Seasonal pricing info */}
                {property.pricing?.rentalPricing?.seasonalPricing && property.pricing.rentalPricing.seasonalPricing.length > 0 && !isPriceOnRequest && (
                  <div className="mt-3 p-3 bg-stone-50/60 backdrop-blur-sm rounded-lg border border-stone-200/30">
                    <div className="text-xs font-light text-stone-800 mb-1">
                      {t({ en: 'Seasonal Rates Available', es: 'Tarifas de Temporada Disponibles' })}
                    </div>
                    <div className="space-y-1">
                      {property.pricing.rentalPricing.seasonalPricing.slice(0, 2).map((season: any, idx: number) => (
                        <div key={idx} className="text-xs text-stone-700 font-light">
                          {season.name}: {formatPrice(season.nightlyRate.amount, season.nightlyRate.currency)}
                          <span className="text-stone-600 ml-1">
                            ({new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Disclaimer */}
                <div className="mt-3 flex items-start gap-1">
                  <Shield className="w-3 h-3 text-stone-500 mt-0.5" />
                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    {t({
                      en: 'Prices shown are estimates and subject to availability. Additional fees may apply.',
                      es: 'Los precios mostrados son estimados y sujetos a disponibilidad. Pueden aplicar cargos adicionales.'
                    })}
                  </p>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-light text-stone-700 mb-2 tracking-wide">
                    {t({ en: 'Select Dates', es: 'Seleccionar Fechas' })}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          validationError && !dateRange?.from && "border-red-500 focus:ring-red-500"
                        )}
                        onClick={() => setValidationError(null)}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "MMM d, yyyy")} -{" "}
                              {format(dateRange.to, "MMM d, yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "MMM d, yyyy")
                          )
                        ) : (
                          <span className="text-muted-foreground">
                            {t({ en: 'Pick dates', es: 'Elegir fechas' })}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range)
                          if (range?.from && range?.to) {
                            setSelectedDates({
                              ...selectedDates,
                              checkIn: range.from.toISOString().split('T')[0],
                              checkOut: range.to.toISOString().split('T')[0]
                            })
                          }
                        }}
                        numberOfMonths={1}
                        disabled={disabledDays}
                        modifiers={{
                          booked: blockedDates
                        }}
                        modifiersStyles={{
                          booked: {
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontWeight: '500'
                          }
                        }}
                        className="rounded-md"
                      />
                      <div className="p-3 border-t">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-100 rounded"></div>
                            <span className="text-stone-600">
                              {t({ en: 'Booked', es: 'Reservado' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-stone-600">
                              {t({ en: 'Selected', es: 'Seleccionado' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {validationError && !dateRange?.from && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {validationError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-light text-stone-700 mb-2 tracking-wide">
                    {t({ en: 'Guests', es: 'Huéspedes' })}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={property.amenities?.maxGuests || 10}
                    value={selectedDates.guests}
                    onChange={(e) => setSelectedDates({ ...selectedDates, guests: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* Quote Section */}
              {quoteData && (
                <div className="border border-stone-200/30 rounded-lg p-4 mb-4 bg-stone-50/40 backdrop-blur-sm">
                  <h4 className="font-light text-stone-900 mb-3 tracking-wide">
                    {t({ en: 'Price Estimate', es: 'Estimado de Precio' })}
                  </h4>
                  <div className="space-y-1 text-sm">
                    {/* Show detailed breakdown if mixed rates apply */}
                    {calculateApplicableRate.breakdown ? (
                      <>
                        {Object.entries(calculateApplicableRate.breakdown).map(([period, details]: [string, any]) => (
                          <div key={period}>
                            <div className="flex justify-between text-xs text-stone-600 mb-0.5">
                              <span className="font-medium">{period}:</span>
                            </div>
                            <div className="flex justify-between pl-2">
                              <span>
                                {details.days} {details.days === 1 ? t({ en: 'night', es: 'noche' }) : t({ en: 'nights', es: 'noches' })} × {formatPrice(details.rate.amount, details.rate.currency)}
                              </span>
                              <span>{formatPrice(details.total, details.rate.currency)}</span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-1 mt-1">
                          <div className="flex justify-between font-medium">
                            <span>{t({ en: 'Accommodation Total', es: 'Total Alojamiento' })}</span>
                            <span>{formatPrice(safeQuoteData?.breakdown.accommodationTotal || 0, safeQuoteData?.currency)}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>{t({ en: 'Price per night', es: 'Precio por noche' })}</span>
                          <span className="font-medium">
                            {formatPrice(
                              calculateApplicableRate.rate?.amount || (safeQuoteData?.breakdown.accommodationTotal || 0) / (safeQuoteData?.nights || 1),
                              safeQuoteData?.currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            {(quoteData as any).quote?.nights} {t({ en: 'nights', es: 'noches' })} × {formatPrice(
                              calculateApplicableRate.rate?.amount || (safeQuoteData?.breakdown.accommodationTotal || 0) / (safeQuoteData?.nights || 1),
                              safeQuoteData?.currency
                            )}
                          </span>
                          <span>{formatPrice((quoteData as any).quote?.breakdown.accommodationTotal, (quoteData as any).quote?.currency)}</span>
                        </div>
                      </>
                    )}
                    {(quoteData as any).quote?.breakdown.cleaningFee > 0 && (
                      <div className="flex justify-between">
                        <span>{t({ en: 'Cleaning fee', es: 'Tarifa de limpieza' })}</span>
                        <span>{formatPrice((quoteData as any).quote?.breakdown.cleaningFee, (quoteData as any).quote?.currency)}</span>
                      </div>
                    )}
                    {(quoteData as any).quote?.breakdown.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>{t({ en: 'Taxes', es: 'Impuestos' })}</span>
                        <span>{formatPrice((quoteData as any).quote?.breakdown.taxAmount, (quoteData as any).quote?.currency)}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 mt-2 flex justify-between font-semibold">
                      <span>{t({ en: 'Total', es: 'Total' })}</span>
                      <span className="text-lg">{formatPrice((quoteData as any).quote?.total, (quoteData as any).quote?.currency)}</span>
                    </div>
                    <div className="text-xs text-stone-500 pt-1">
                      {calculateApplicableRate.breakdown ? (
                        <span>
                          {t({ en: 'Average total per night', es: 'Promedio total por noche' })}: {formatPrice((quoteData as any).quote?.total / (quoteData as any).quote?.nights, (quoteData as any).quote?.currency)}
                        </span>
                      ) : (
                        <span>
                          {t({ en: 'Total per night', es: 'Total por noche' })}: {formatPrice((quoteData as any).quote?.total / (quoteData as any).quote?.nights, (quoteData as any).quote?.currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-3 p-2 bg-stone-100/60 backdrop-blur-sm rounded-md border border-stone-200/30">
                    <p className="text-xs text-stone-800 leading-relaxed font-light">
                      {t({
                        en: '* This is a preliminary estimate for informational purposes only. Final pricing may vary based on additional services, special requests, or changes in availability. Please contact us for a formal quote.',
                        es: '* Este es un estimado preliminar solo para fines informativos. El precio final puede variar según servicios adicionales, solicitudes especiales o cambios en disponibilidad. Por favor contáctenos para una cotización formal.'
                      })}
                    </p>
                  </div>

                  {/* Contact Buttons - Show after quote is calculated */}
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-light text-stone-700 mb-2 tracking-wide">
                      {t({ en: 'Interested? Contact us now:', es: '¿Interesado? Contáctanos ahora:' })}
                    </div>

                    {/* WhatsApp Button */}
                    <Button
                      onClick={() => {
                        const quoteInfo = safeQuoteData
                        const message = encodeURIComponent(
                          `${t({ en: 'Hello! I\'m interested in', es: 'Hola! Estoy interesado en' })} ${title}\n\n` +
                          `📅 ${t({ en: 'Dates', es: 'Fechas' })}: ${dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : ''} - ${dateRange?.to ? format(dateRange.to, 'MMM d, yyyy') : ''}\n` +
                          `👥 ${t({ en: 'Guests', es: 'Huéspedes' })}: ${selectedDates.guests}\n` +
                          `💰 ${t({ en: 'Estimated Total', es: 'Total Estimado' })}: ${formatPrice(quoteInfo?.total || 0, quoteInfo?.currency)}\n` +
                          `🏠 ${t({ en: 'Property Code', es: 'Código de Propiedad' })}: ${property.propertyCode || property._id}\n\n` +
                          `${t({ en: 'Please confirm availability and final pricing.', es: 'Por favor confirma disponibilidad y precio final.' })}`
                        )
                        const whatsappNumber = property.agent?.whatsapp || property.agent?.phone || property.contactInfo?.whatsapp || property.contactInfo?.phone || '+18293422566'
                        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`
                        window.open(whatsappUrl, '_blank')
                      }}
                      variant="default"
                      className="w-full bg-teal-600 hover:bg-teal-700 font-light tracking-wide"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t({ en: 'WhatsApp Quote', es: 'Cotización por WhatsApp' })}
                    </Button>

                    {/* Email Button */}
                    <Button
                      onClick={() => {
                        const quoteInfo = safeQuoteData
                        const subject = encodeURIComponent(
                          `${t({ en: 'Quote Request for', es: 'Solicitud de Cotización para' })} ${title}`
                        )
                        const body = encodeURIComponent(
                          `${t({ en: 'Hello,\n\nI would like to request a formal quote for the following booking:', es: 'Hola,\n\nMe gustaría solicitar una cotización formal para la siguiente reserva:' })}\n\n` +
                          `${t({ en: 'Property', es: 'Propiedad' })}: ${title}\n` +
                          `${t({ en: 'Property Code', es: 'Código' })}: ${property.propertyCode || property._id}\n` +
                          `${t({ en: 'Check-in', es: 'Entrada' })}: ${dateRange?.from ? format(dateRange.from, 'MMMM d, yyyy') : ''}\n` +
                          `${t({ en: 'Check-out', es: 'Salida' })}: ${dateRange?.to ? format(dateRange.to, 'MMMM d, yyyy') : ''}\n` +
                          `${t({ en: 'Number of guests', es: 'Número de huéspedes' })}: ${selectedDates.guests}\n` +
                          `${t({ en: 'Estimated Total', es: 'Total Estimado' })}: ${formatPrice(quoteInfo?.total || 0, quoteInfo?.currency)}\n\n` +
                          `${t({ en: 'Please provide the final pricing and confirm availability.', es: 'Por favor proporcione el precio final y confirme la disponibilidad.' })}\n\n` +
                          `${t({ en: 'Thank you!', es: '¡Gracias!' })}`
                        )
                        const emailAddress = property.agent?.email || property.contactInfo?.email || 'info@drproperties.com'
                        window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {t({ en: 'Email Quote Request', es: 'Solicitar Cotización por Email' })}
                    </Button>
                  </div>
                </div>
              )}

              {isPriceOnRequest ? (
                <Button
                  onClick={handleWhatsApp}
                  className="w-full"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {t({ en: 'Contact for Pricing', es: 'Contactar para Precio' })}
                </Button>
              ) : (
                <Button
                  onClick={handleGetQuote}
                  className="w-full"
                  disabled={loadingQuote}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  {loadingQuote
                    ? t({ en: 'Calculating Estimate...', es: 'Calculando Estimado...' })
                    : t({ en: 'Get Price Estimate', es: 'Obtener Estimado de Precio' })
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}