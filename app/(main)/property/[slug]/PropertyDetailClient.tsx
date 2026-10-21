'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import PropertyGallery, { type PropertyGalleryHandle } from '@/components/PropertyGallery'
import AmenitiesList from '@/components/AmenitiesList'
import PropertyMap from '@/components/PropertyMap'
import { MapLinks } from '@/components/MapLinks'
import PropertyReviews from '@/components/PropertyReviews'
import SimilarProperties from '@/components/SimilarProperties'
import InquiryDialog from '@/components/InquiryDialog'
import { addDaysToKey, formatDateKey, fromDateKey, nightsBetween, toDateKey, todayInDR } from '@/lib/dates'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { fieldClass, fieldLabelClass } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { resolveLocationVisibility } from '@/lib/location'
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
  Clock,
  Shield,
  Waves,
  Plane,
  Cigarette,
  PawPrint,
  PartyPopper,
  X,
  Ban,
  CheckCircle2,
  Anchor,
  Mountain,
  Flag,
  Utensils,
  ShoppingBag,
  Cross,
  Music,
  Check,
} from 'lucide-react'

interface PropertyDetailClientProps {
  property: any
  /** Ranked "Similar houses" rail, built server-side in page.tsx. */
  similar?: any[]
}

export default function PropertyDetailClient({ property, similar = [] }: PropertyDetailClientProps) {
  const { locale, t } = useLocale()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const galleryRef = useRef<PropertyGalleryHandle>(null)
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '', guests: 2 })
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [quoteData, setQuoteData] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [showMobileBooking, setShowMobileBooking] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const isPropertyFavorited = isFavorite(property._id)

  const handleToggleFavorite = () => {
    if (isPropertyFavorited) {
      removeFavorite(property._id)
    } else {
      addFavorite({
        _id: property._id,
        slug: property.slug,
        title_es: property.title_es,
        title_en: property.title_en,
        mainImage: property.mainImage,
        bedrooms: property.amenities?.bedrooms || 0,
        bathrooms: property.amenities?.bathrooms || 0,
        maxGuests: property.amenities?.maxGuests || 0,
        area: property.area,
        nightlyRate: property.pricing?.rentalPricing?.nightlyRate,
        salePrice: property.pricing?.salePricing?.price,
        listingType: property.propertyType
      })
    }
  }


  // Process blocked dates for the calendar
  const blockedDates = useMemo(() => {
    const dates: Date[] = []

    if (property.availability?.blockedDates) {
      property.availability.blockedDates.forEach((block: any) => {
        if (!block?.startDate || !block?.endDate) return
        // Blocked ranges are DR calendar days; walk them as keys so the
        // picker greys out the same days wherever the visitor is.
        for (let key = block.startDate.slice(0, 10); key <= block.endDate.slice(0, 10); key = addDaysToKey(key, 1)) {
          dates.push(fromDateKey(key))
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
    // "Today" is today in the Dominican Republic, not the visitor's timezone.
    return toDateKey(date) < todayInDR() || isDateBlocked(date)
  }

  // Check if pricing is on request - must be explicitly set to true
  // A property is treated as "price on request" when it's explicitly
  // flagged, OR when no usable price is actually set — otherwise the UI
  // would render "$0 / night". This mirrors the fallback on the cards.
  const explicitPriceOnRequest =
    property.pricing?.rentalPricing?.priceOnRequest === true ||
    property.pricing?.salePricing?.priceOnRequest === true
  const seasonalPricing = property.pricing?.rentalPricing?.seasonalPricing
  const hasValidRentalRate =
    typeof property.pricing?.rentalPricing?.nightlyRate?.amount === 'number' ||
    (Array.isArray(seasonalPricing) &&
      seasonalPricing.some((s: any) => typeof s?.nightlyRate?.amount === 'number'))
  const hasValidSalePrice =
    typeof property.pricing?.salePricing?.salePrice?.amount === 'number'
  const isPriceOnRequest =
    explicitPriceOnRequest || (!hasValidRentalRate && !hasValidSalePrice)
  // Sale-only listings have no stay to price or dates to pick.
  const isSaleOnly = property.pricing?.type === 'sale'
  // The estimate needs a nightly rate; without one (e.g. a sale price only)
  // the box goes straight to the inquiry instead of quoting $0 a night.
  const canEstimate =
    !isPriceOnRequest &&
    !isSaleOnly &&
    hasValidRentalRate &&
    property.pricing?.rentalPricing?.priceOnRequest !== true
  // A price is actually on screen — gates the estimate disclaimer.
  // "Is available" is a rental switch (taking bookings); a sale-only house
  // is on the market whenever it's active, whatever that switch says.
  const isUnavailable = property.availability?.isAvailable === false && !isSaleOnly
  const showsPrice = !isPriceOnRequest && !isUnavailable

  // Seasonal rates worth showing: current or upcoming (past seasons are noise),
  // soonest first. Dates are YYYY-MM-DD, so string comparison is date order.
  const today = todayInDR()
  const upcomingSeasons = (Array.isArray(seasonalPricing) ? seasonalPricing : [])
    .filter((s: any) => typeof s?.nightlyRate?.amount === 'number' && (!s.endDate || s.endDate >= today))
    .sort((a: any, b: any) => (a.startDate || '').localeCompare(b.startDate || ''))
  // The price block above "Select dates" has something in it (a price or the
  // unavailable notice) — otherwise drop its bottom margin.
  const hasPriceBlock = showsPrice || isUnavailable

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

    // One entry per night: check-in day up to (not including) check-out day.
    const checkInKey = toDateKey(dateRange.from)
    const checkOutKey = toDateKey(dateRange.to)
    const totalDays = Math.max(1, nightsBetween(checkInKey, checkOutKey))

    const dailyRates: { date: string; rate: any; seasonName?: string }[] = []

    for (let key = checkInKey; key < checkOutKey || dailyRates.length === 0; key = addDaysToKey(key, 1)) {
      let dayRate = baseRate
      let daySeasonName = undefined

      // Season dates are DR calendar days ("YYYY-MM-DD"), compared as strings.
      if (property.pricing?.rentalPricing?.seasonalPricing) {
        for (const season of property.pricing.rentalPricing.seasonalPricing) {
          if (season.startDate && season.endDate && key >= season.startDate && key <= season.endDate) {
            dayRate = season.nightlyRate
            daySeasonName = season.name
            break // Use the first matching season
          }
        }
      }

      dailyRates.push({ date: key, rate: dayRate, seasonName: daySeasonName })
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
      'tv-room': { en: 'TV Room', es: 'Sala de TV' },
      dining: { en: 'Dining', es: 'Comedor' },
      pool: { en: 'Pool', es: 'Piscina' },
      view: { en: 'View', es: 'Vista' },
      amenities: { en: 'Amenities', es: 'Amenidades' },
    }

    const label = labels[category]
    if (!label) return category
    return locale === 'es' ? label.es : label.en
  }

  // Renders "12km • 10 min by golf cart", omitting either part (and the
  // separator) when its value is missing.
  const renderDistanceLine = (distance?: number, golfCartTime?: number) => {
    const hasDistance = typeof distance === 'number'
    const hasTime = typeof golfCartTime === 'number'
    if (!hasDistance && !hasTime) return null
    return (
      <>
        {hasDistance && `${distance}km`}
        {hasTime && (
          <span className={`text-muted-2 ${hasDistance ? 'ml-2' : ''}`}>
            {hasDistance ? '• ' : ''}
            {golfCartTime} {t({ en: 'min by golf cart', es: 'min en carrito' })}
          </span>
        )}
      </>
    )
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
  // Location visibility: 'full' shows the exact address + a pinned map,
  // 'sector' shows only the area with an approximate map, 'hidden' shows
  // neither. Falls back to the legacy `isPrivateAddress` flag.
  const locVisibility = resolveLocationVisibility(property.location)
  const address =
    locVisibility === 'full'
      ? [
          property.location?.street,
          property.location?.city,
          property.location?.country,
        ]
          .filter(Boolean)
          .join(', ') || undefined
      : undefined

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

    // Contact routes to the assigned agent, or Leticia by default — the
    // owner's private contactInfo is never used publicly.
    const number = (property.agent?.whatsapp || property.agent?.phone || '+18293422566').replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`
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
    // Only a real numeric amount counts — never coerce a missing price to 0,
    // which would render "$0 / night".
    if (!rate || typeof rate.amount !== 'number') return null

    return {
      amount: rate.amount,
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

  // A new stay needs a new estimate.
  useEffect(() => {
    setQuoteData(null)
  }, [selectedDates.checkIn, selectedDates.checkOut, selectedDates.guests])

  const safeQuoteData = getSafeQuoteData()

  // Why the last estimate couldn't be given (blocked dates, minimum stay…).
  const quoteProblem = (() => {
    const q = quoteData as any
    if (!q || q.quote) return null
    switch (q.reason) {
      case 'DATES_BLOCKED':
        return t({ en: 'Those dates are already taken. Try different dates, or ask us.', es: 'Esas fechas ya están ocupadas. Prueba otras fechas o consúltanos.' })
      case 'MIN_NIGHTS':
        return t({ en: `The minimum stay is ${q.minimumNights} nights.`, es: `La estadía mínima es de ${q.minimumNights} noches.` })
      case 'EXCEEDS_CAPACITY':
        return t({ en: `This house sleeps up to ${q.maxGuests} guests.`, es: `Esta casa tiene capacidad para ${q.maxGuests} huéspedes.` })
      case 'PROPERTY_UNAVAILABLE':
        return t({ en: 'This house is not taking bookings right now.', es: 'Esta casa no está aceptando reservas en este momento.' })
      default:
        return q.error || q.message || t({ en: 'We could not price those dates.', es: 'No pudimos cotizar esas fechas.' })
    }
  })()

  /**
   * Booking box actions as two steps: 1) get an estimate for the dates,
   * 2) inquire with Leticia about those dates. Changing dates or guests
   * clears the estimate and goes back to step 1.
   */
  const renderBookingActions = () => {
    if (isPriceOnRequest) {
      return (
        <Button onClick={() => setInquiryOpen(true)} className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          {t({ en: 'Contact for Pricing', es: 'Contactar para Precio' })}
        </Button>
      )
    }

    if (!canEstimate) {
      return (
        <Button onClick={() => setInquiryOpen(true)} className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          {isSaleOnly
            ? t({ en: 'Inquire about this house', es: 'Consultar por esta casa' })
            : t({ en: 'Inquire', es: 'Consultar' })}
        </Button>
      )
    }

    const step = safeQuoteData ? 2 : 1
    const stepClass = (n: number) =>
      cn('flex items-center gap-2', step === n ? 'text-ink' : 'text-muted-2')
    const dotClass = (n: number) =>
      cn(
        'flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
        step === n ? 'border-ink bg-ink text-surface' : step > n ? 'border-ink text-ink' : 'border-line'
      )

    return (
      <div className="space-y-3">
        <ol className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em]">
          <li className={stepClass(1)}>
            <span className={dotClass(1)}>{step > 1 ? <Check className="w-3 h-3" /> : '1'}</span>
            {t({ en: 'Estimate', es: 'Estimado' })}
          </li>
          <li aria-hidden className="h-px flex-1 bg-line" />
          <li className={stepClass(2)}>
            <span className={dotClass(2)}>2</span>
            {t({ en: 'Inquire', es: 'Consulta' })}
          </li>
        </ol>

        {quoteProblem && <p className="text-sm font-light text-status-attention">{quoteProblem}</p>}

        {step === 2 ? (
          <>
            <Button onClick={() => setInquiryOpen(true)} className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t({ en: 'Inquire', es: 'Consultar' })}
            </Button>
            <p className="text-center text-xs font-light text-muted">
              {t({
                en: 'We confirm availability and the final price. Nothing is charged now.',
                es: 'Confirmamos la disponibilidad y el precio final. No se cobra nada ahora.',
              })}
            </p>
          </>
        ) : (
          <>
            <Button onClick={handleGetQuote} className="w-full" disabled={loadingQuote}>
              <DollarSign className="w-4 h-4 mr-2" />
              {loadingQuote
                ? t({ en: 'Calculating Estimate...', es: 'Calculando Estimado...' })
                : t({ en: 'Get Price Estimate', es: 'Obtener Estimado de Precio' })}
            </Button>
            <button
              type="button"
              onClick={() => setInquiryOpen(true)}
              className="w-full text-center text-xs font-light text-muted underline underline-offset-4 hover:text-ink"
            >
              {t({ en: 'Dates not set yet? Ask us directly', es: '¿Aún sin fechas? Consúltanos directamente' })}
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas">
      <InquiryDialog
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        source="PROPERTY"
        properties={[{ _id: property._id, title: title || property.title_en || property.title_es }]}
        hideProperties
        askStay={property.pricing?.type !== 'sale'}
        checkIn={selectedDates.checkIn}
        checkOut={selectedDates.checkOut}
        guests={selectedDates.guests}
        estimate={safeQuoteData?.total ? { total: safeQuoteData.total, currency: safeQuoteData.currency } : undefined}
      />
      {/* Full-bleed gallery mosaic — spans the whole page width. */}
      <PropertyGallery
        ref={galleryRef}
        mainImage={property.mainImage}
        gallery={property.gallery || []}
        alt={title}
        mosaic
        locale={locale}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {property.themes?.map((theme: string) => (
                    <Badge key={theme} variant="secondary" className="capitalize bg-sand text-body-strong border-line font-light">
                      {theme}
                    </Badge>
                  ))}
                  {property.isFeatured && (
                    <Badge variant="default" className="bg-ink text-white border-ink font-light">
                      {t({ en: 'Featured', es: 'Destacado' })}
                    </Badge>
                  )}
                </div>

                {/* Share / favourite — sit beside the tags. */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      const url = window.location.href
                      try {
                        if (navigator.share) await navigator.share({ title, url })
                        else await navigator.clipboard.writeText(url)
                      } catch { /* dismissed */ }
                    }}
                    className="grid size-9 place-items-center rounded-full border border-line text-body-strong hover:border-ink hover:text-ink transition-colors"
                    aria-label={t({ en: 'Share', es: 'Compartir' })}
                    title={t({ en: 'Share', es: 'Compartir' })}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className="grid size-9 place-items-center rounded-full border border-line hover:border-ink transition-colors"
                    aria-label={t({ en: isPropertyFavorited ? 'Remove from favorites' : 'Add to favorites', es: isPropertyFavorited ? 'Eliminar de favoritos' : 'Agregar a favoritos' })}
                    aria-pressed={isPropertyFavorited}
                    title={t({ en: isPropertyFavorited ? 'Remove from favorites' : 'Add to favorites', es: isPropertyFavorited ? 'Eliminar de favoritos' : 'Agregar a favoritos' })}
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4",
                        isPropertyFavorited ? "fill-ink text-ink" : "text-muted"
                      )}
                    />
                  </button>
                </div>
              </div>

              <h1 className="font-display text-4xl lg:text-5xl text-ink mb-2">
                {title}
              </h1>

              {(address || (locVisibility !== 'hidden' && areaTitle)) && (
                <div className="text-muted mb-4 font-light space-y-1">
                  {/* Exact address — only when fully public. */}
                  {address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{address}</span>
                    </div>
                  )}
                  {/* Area / sector — always within Casa de Campo. */}
                  {locVisibility !== 'hidden' && areaTitle && (
                    <div className={`flex items-center gap-2 ${address ? 'pl-7' : ''}`}>
                      {!address && <MapPin className="w-5 h-5" />}
                      <span>{areaTitle}, Casa de Campo</span>
                    </div>
                  )}
                </div>
              )}


              {/* Quick Actions */}
              {/* <div className="flex gap-3">
                <Button onClick={() => setShowInquiryForm(true)} className="flex-1 bg-ink hover:bg-ink font-light">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t({ en: 'Send Inquiry', es: 'Enviar Consulta' })}
                </Button>
                
                {property.contactInfo?.whatsapp && (
                  <Button onClick={handleWhatsApp} variant="outline" className="border-line text-body-strong hover:bg-sand font-light">
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div> */}
            </div>

            {/* Leticia's Recommendation is rendered inside AmenitiesList
                via the `afterKeyFacts` slot — keeps it pinned right
                under the Bedrooms/Bathrooms/Guests stats. */}

            {/* Description */}
            {description && (
              <div>
                <h2 className="font-title text-2xl text-ink mb-4">
                  {t({ en: 'About This Property', es: 'Sobre Esta Propiedad' })}
                </h2>
                <div className="prose prose-stone max-w-none">
                  <p className="text-muted leading-relaxed font-light">{description}</p>
                </div>
              </div>
            )}

            {/* Mobile Pricing Card - Show before amenities on mobile only */}
            <div className="lg:hidden mb-8">
              <Card className="bg-white/60 backdrop-blur-sm border-line rounded-sm shadow-none">
                <CardContent className="p-6">
                  <div className="text-center">
                    {safeRate && (
                      <div>
                        <div className="font-title text-2xl text-ink mb-1">
                          {formatPrice(safeRate.amount, safeRate.currency)}
                          <span className="text-sm font-light text-muted ml-2">
                            / {t({ en: 'night', es: 'noche' })}
                          </span>
                        </div>
                        <div className="text-xs text-muted font-light mb-3">
                          {t({ en: 'Starting rate', es: 'Tarifa desde' })}
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => setShowMobileBooking(true)}
                      className="w-full bg-ink hover:bg-ink text-white font-light tracking-wide"
                    >
                      {t({ en: 'Check Availability', es: 'Ver Disponibilidad' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="font-title text-2xl text-ink mb-6">
                {t({ en: 'Amenities', es: 'Amenidades' })}
              </h2>
              <AmenitiesList
                amenities={property.amenities}
                afterKeyFacts={
                  property.leticiaRecommendation &&
                  property.leticiaRecommendation.isActive &&
                  // Hide it when active but the recommendation text is empty.
                  (property.leticiaRecommendation.recommendation_en?.trim() ||
                    property.leticiaRecommendation.recommendation_es?.trim()) ? (
                    <LeticiaRecommendation
                      recommendation={property.leticiaRecommendation}
                      className="mb-2"
                    />
                  ) : null
                }
              />
            </div>

            {/* Property Themes */}
            {property.themes && property.themes.length > 0 && (
              <div>
                <h2 className="font-title text-2xl text-ink mb-6">
                  {t({ en: 'Property Features', es: 'Características de la Propiedad' })}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {property.themes.map((theme: string) => {
                    const themeInfo = getThemeLabel(theme)
                    return (
                      <div
                        key={theme}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sand border border-line rounded-full text-body-strong font-light"
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
              <h2 className="font-title text-2xl text-ink mb-6">
                {t({ en: 'Availability Calendar', es: 'Calendario de Disponibilidad' })}
              </h2>

              <Card className="rounded-xs border border-line shadow-none">
                <CardContent className="p-6">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-sand rounded border border-line"></div>
                      <span className="text-sm text-muted">
                        {t({ en: 'Available', es: 'Disponible' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-status-attention-bg rounded border border-status-attention-border"></div>
                      <span className="text-sm text-muted">
                        {t({ en: 'Booked', es: 'Reservado' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-brand rounded"></div>
                      <span className="text-sm text-muted">
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
                            checkIn: toDateKey(range.from),
                            checkOut: toDateKey(range.to)
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
                          backgroundColor: '#f8f1f0',
                          color: '#8c5a55',
                          fontWeight: '500'
                        }
                      }}
                      modifiersClassNames={{
                        booked: 'bg-status-attention-bg text-status-attention hover:bg-status-attention-bg hover:text-status-attention'
                      }}
                    />
                  </div>

                  {/* Availability Info */}
                  <div className="mt-6 space-y-3 border-t pt-4">
                    {property.availability?.checkInTime && property.availability?.checkOutTime && (
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Clock className="w-4 h-4" />
                        <span>
                          {t({ en: 'Check-in', es: 'Entrada' })}: {property.availability.checkInTime} |
                          {' '}{t({ en: 'Check-out', es: 'Salida' })}: {property.availability.checkOutTime}
                        </span>
                      </div>
                    )}

                    {property.pricing?.rentalPricing?.minimumNights && (
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {t({ en: 'Minimum stay', es: 'Estancia mínima' })}: {property.pricing.rentalPricing.minimumNights} {t({ en: 'nights', es: 'noches' })}
                        </span>
                      </div>
                    )}

                    {property.availability?.instantBooking && (
                      <div className="flex items-center gap-2 text-sm text-status-confirmed">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {t({ en: 'Instant booking available', es: 'Reserva instantánea disponible' })}
                        </span>
                      </div>
                    )}

                    {property.availability?.preparationTime && property.availability.preparationTime > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted">
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
                      (block: any) => block?.endDate && block.endDate.slice(0, 10) >= todayInDR()
                    ) || []

                    return upcomingBookings.length > 0 && (
                      <div className="mt-4 p-4 bg-canvas rounded-sm">
                        <h4 className="font-semibold text-sm mb-2">
                          {t({ en: 'Upcoming Bookings', es: 'Próximas Reservas' })}
                        </h4>
                        <div className="space-y-1">
                          {upcomingBookings
                            .slice(0, 3)
                            .map((block: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-muted">
                                <Ban className="w-3 h-3" />
                                <span>
                                  {formatDateKey(block.startDate, locale)} – {formatDateKey(block.endDate, locale)}
                                  {block.reason === 'maintenance' && ` (${t({ en: 'Maintenance', es: 'Mantenimiento' })})`}
                                  {block.reason === 'owner' && ` (${t({ en: 'Owner use', es: 'Uso del propietario' })})`}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  })()}

                </CardContent>
              </Card>
            </div>

            {/* Image Gallery */}
            {property.gallery && property.gallery.length > 0 && (
              <div>
                <h2 className="font-title text-2xl text-ink mb-6">
                  {t({ en: 'Property Photos', es: 'Fotos de la Propiedad' })}
                </h2>

                {/* Group images by category for better organization */}
                {(() => {
                  // Group images by category. Skip any gallery entry without
                  // an uploaded asset — urlFor() throws on an undefined source.
                  const groupedImages = property.gallery.reduce((acc: any, image: any, index: number) => {
                    if (!image?.asset) return acc
                    const category = image.category || 'other'
                    if (!acc[category]) acc[category] = []
                    acc[category].push({ ...image, index })
                    return acc
                  }, {})

                  // Prioritized category order for better display
                  const categoryOrder = ['exterior', 'interior', 'living', 'tv-room', 'bedroom', 'kitchen', 'bathroom', 'dining', 'pool', 'view', 'amenities', 'other']
                  const sortedCategories = categoryOrder.filter(cat => groupedImages[cat])

                  return sortedCategories.map((category) => (
                    <div key={category} className="mb-8 last:mb-0">
                      <h3 className="eyebrow mb-4 flex items-center gap-2">
                        <span>{getCategoryLabel(category)}</span>
                        <span className="text-faint normal-case tracking-normal">
                          ({groupedImages[category].length})
                        </span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {groupedImages[category].map((image: any, idx: number) => (
                          <figure key={`${category}-${idx}`} className="group m-0">
                            <button
                              type="button"
                              onClick={() => galleryRef.current?.openImage(image)}
                              className="relative block w-full aspect-[3/2] overflow-hidden bg-sand cursor-pointer"
                              aria-label={t({ en: 'View photo', es: 'Ver foto' })}
                            >
                              <Image
                                // Pass the whole image (not just .asset) so the focal point
                                // set in Studio decides what the 3:2 crop keeps.
                                src={urlFor(image).width(600).height(400).quality(85).url()}
                                alt={image.alt || image.caption || `${getCategoryLabel(category)} ${idx + 1}`}
                                fill
                                className="object-cover"
                                loading="lazy"
                              />
                            </button>
                            {image.caption && (
                              <figcaption className="mt-2 text-[13px] text-muted font-light leading-relaxed">
                                {image.caption}
                              </figcaption>
                            )}
                          </figure>
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
                <h2 className="font-title text-2xl text-ink mb-6">
                  {t({ en: 'Location', es: 'Ubicación' })}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                  {/* Location Info */}
                  {property.location.distanceToBeach && (
                    <div className="flex items-center gap-4 py-4 border-b border-line">
                      <div className="shrink-0 text-brand">
                        <Waves className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1">
                        <div className="font-light text-ink mb-1">
                          {t({ en: 'Distance to Beach', es: 'Distancia a la Playa' })}
                        </div>
                        <div className="text-muted font-light">
                          {typeof property.location.distanceToBeach === 'object'
                            ? renderDistanceLine(
                                property.location.distanceToBeach.distance,
                                property.location.distanceToBeach.golfCartTime
                              )
                            : `${property.location.distanceToBeach}m`
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {property.location.distanceToLaMarina && (
                    <div className="flex items-center gap-4 py-4 border-b border-line">
                      <div className="shrink-0 text-brand">
                        <Anchor className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1">
                        <div className="font-light text-ink mb-1">
                          {t({ en: 'Distance to La Marina', es: 'Distancia a La Marina' })}
                        </div>
                        <div className="text-muted font-light">
                          {renderDistanceLine(
                            property.location.distanceToLaMarina.distance,
                            property.location.distanceToLaMarina.golfCartTime
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {property.location.distanceToChavon && (
                    <div className="flex items-center gap-4 py-4 border-b border-line">
                      <div className="shrink-0 text-brand">
                        <Mountain className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1">
                        <div className="font-light text-ink mb-1">
                          {t({ en: 'Distance to Altos de Chavón', es: 'Distancia a Altos de Chavón' })}
                        </div>
                        <div className="text-muted font-light">
                          {renderDistanceLine(
                            property.location.distanceToChavon.distance,
                            property.location.distanceToChavon.golfCartTime
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {(() => {
                    // Prefer the multi-airport array; fall back to the legacy
                    // single distanceToAirport number for older documents.
                    const airports: Array<{ name?: string; code?: string; distanceKm?: number; driveTime?: number }> =
                      Array.isArray(property.location.airports) &&
                      property.location.airports.length > 0
                        ? property.location.airports
                        : property.location.distanceToAirport
                          ? [{ distanceKm: property.location.distanceToAirport }]
                          : []
                    if (airports.length === 0) return null
                    return (
                      <div className="flex items-start gap-4 py-4 border-b border-line">
                        <div className="shrink-0 text-brand">
                          <Plane className="w-5 h-5 text-brand" />
                        </div>
                        <div className="flex-1">
                          <div className="font-light text-ink mb-1">
                            {airports.length > 1
                              ? t({ en: 'Nearby Airports', es: 'Aeropuertos Cercanos' })
                              : t({ en: 'Distance to Airport', es: 'Distancia al Aeropuerto' })}
                          </div>
                          <ul className="text-muted font-light space-y-1">
                            {airports.map((a, i) => {
                              const name = a.name?.trim() || t({ en: 'Airport', es: 'Aeropuerto' })
                              const details = [
                                typeof a.distanceKm === 'number' && `${a.distanceKm} km`,
                                typeof a.driveTime === 'number' && `${a.driveTime} min`,
                              ].filter(Boolean)
                              return (
                                <li key={i} className="flex items-baseline justify-between gap-4">
                                  <span>
                                    {name}
                                    {a.code && <span className="text-muted-2"> ({a.code})</span>}
                                  </span>
                                  {details.length > 0 && (
                                    <span className="text-sm tabular-nums text-muted-2 shrink-0">{details.join(' · ')}</span>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Nearby attractions — same row treatment as the distances
                      above. Entries are objects ({name_en, name_es, distance,
                      type}); older docs stored plain strings, so accept both. */}
                  {(() => {
                    const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
                      beach: Waves,
                      golf: Flag,
                      restaurant: Utensils,
                      shopping: ShoppingBag,
                      airport: Plane,
                      hospital: Cross,
                      marina: Anchor,
                      nightlife: Music,
                    }
                    const attractions = (property.location.nearbyAttractions ?? [])
                      .map((a: any) =>
                        typeof a === 'string'
                          ? { name: a.trim(), distance: undefined, type: undefined }
                          : {
                              name: ((locale === 'es' ? a?.name_es : a?.name_en) || a?.name_en || a?.name_es || '').trim(),
                              distance: typeof a?.distance === 'number' ? a.distance : undefined,
                              type: a?.type as string | undefined,
                            }
                      )
                      .filter((a: { name: string }) => a.name)
                    if (attractions.length === 0) return null
                    return (
                      <div className="flex items-start gap-4 py-4 border-b border-line">
                        <div className="shrink-0 text-brand pt-0.5">
                          <MapPin className="w-5 h-5 text-brand" />
                        </div>
                        <div className="flex-1">
                          <div className="font-light text-ink mb-2">
                            {t({ en: 'Nearby', es: 'Cerca' })}
                          </div>
                          <ul className="space-y-1.5">
                            {attractions.map((a: { name: string; distance?: number; type?: string }, i: number) => {
                              const Icon = (a.type && ICONS[a.type]) || null
                              return (
                                <li key={i} className="flex items-center justify-between gap-4 text-muted font-light">
                                  <span className="flex items-center gap-2 min-w-0">
                                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-2 shrink-0" />}
                                    <span className="truncate">{a.name}</span>
                                  </span>
                                  {a.distance !== undefined && (
                                    <span className="text-sm tabular-nums text-muted-2 shrink-0">{a.distance} km</span>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Property Map — hidden entirely when locationVisibility
                    is 'hidden'. 'full' pins the exact address; 'sector'
                    shows an approximate map centered on the area. */}
                {locVisibility !== 'hidden' && (
                  <div className="mt-8">
                    <h3 className="font-title text-xl text-ink mb-4">
                      {t({ en: 'Property Location', es: 'Ubicación de la Propiedad' })}
                    </h3>
                    {locVisibility === 'full' ? (
                      <>
                        <PropertyMap
                          coordinates={property.location.coordinates ? {
                            lat: property.location.coordinates.lat,
                            lng: property.location.coordinates.lng
                          } : undefined}
                          address={address}
                          propertyTitle={locale === 'es' ? property.title_es : property.title_en}
                          className="h-[480px] w-full"
                        />
                        {address && (
                          <div className="mt-4 p-4 bg-sand/50 border border-line">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-md bg-sand/60 border border-line flex-shrink-0">
                                <MapPin className="w-4 h-4 text-body-strong" />
                              </div>
                              <div>
                                <h4 className="font-medium text-ink mb-1">
                                  {t({ en: 'Address', es: 'Dirección' })}
                                </h4>
                                <p className="text-body-strong">
                                  {address}
                                </p>
                                {property.area?.title_en && (
                                  <p className="text-sm text-muted mt-1">
                                    {locale === 'es' ? property.area.title_es : property.area.title_en}
                                    {property.area.region && `, ${property.area.region}`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      // 'sector' — approximate map centered on the area's
                      // center coordinates; no street is revealed.
                      <>
                        <PropertyMap
                          coordinates={property.area?.coordinates ? {
                            lat: property.area.coordinates.lat,
                            lng: property.area.coordinates.lng
                          } : undefined}
                          zoom={property.area?.mapZoom ?? 13}
                          sector
                          radiusKm={property.area?.sectorRadiusKm ?? 0.6}
                          boundary={property.area?.sectorBoundary}
                          propertyTitle={areaTitle || t({ en: 'Approximate area', es: 'Zona aproximada' })}
                          className="h-[480px] w-full"
                        />
                        {areaTitle && (
                          <div className="mt-4 p-4 bg-sand/50 border border-line">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-md bg-sand/60 border border-line flex-shrink-0">
                                <MapPin className="w-4 h-4 text-body-strong" />
                              </div>
                              <div>
                                <h4 className="font-medium text-ink mb-1">
                                  {t({ en: 'Area', es: 'Zona' })}
                                </h4>
                                <p className="text-body-strong">
                                  {areaTitle}, Casa de Campo
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <PropertyReviews reviews={property.reviewItems} />

            {/* House Rules */}
            {property.houseRules && (
              <div>
                <h2 className="font-title text-2xl text-ink mb-6">
                  {t({ en: 'House Rules', es: 'Reglas de la Casa' })}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {property.houseRules.smokingAllowed !== undefined && (
                    <div className="flex items-center gap-4 py-4 border-b border-line">
                      <div className="shrink-0 text-brand">
                        <Cigarette className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-light text-ink">{t({ en: 'Smoking', es: 'Fumar' })}</span>
                        <div className="flex items-center gap-2">
                          {property.houseRules.smokingAllowed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <span className="text-sm font-light text-teal-700">{t({ en: 'Allowed', es: 'Permitido' })}</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 text-muted-2" />
                              <span className="text-sm font-light text-muted">{t({ en: 'Not Allowed', es: 'No Permitido' })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.houseRules.petsAllowed !== undefined && (
                    <div className="flex items-center gap-4 py-4 border-b border-line">
                      <div className="shrink-0 text-brand">
                        <PawPrint className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-light text-ink">{t({ en: 'Pets', es: 'Mascotas' })}</span>
                        <div className="flex items-center gap-2">
                          {property.houseRules.petsAllowed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <span className="text-sm font-light text-teal-700">{t({ en: 'Allowed', es: 'Permitidas' })}</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 text-muted-2" />
                              <span className="text-sm font-light text-muted">{t({ en: 'Not Allowed', es: 'No Permitidas' })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {property.houseRules.eventsAllowed !== undefined && (
                    <div className="flex items-center gap-4 py-4 border-b border-line">
                      <div className="shrink-0 text-brand">
                        <PartyPopper className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-light text-ink">{t({ en: 'Events', es: 'Eventos' })}</span>
                        <div className="flex items-center gap-2">
                          {property.houseRules.eventsAllowed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <span className="text-sm font-light text-teal-700">{t({ en: 'Allowed', es: 'Permitidos' })}</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 text-muted-2" />
                              <span className="text-sm font-light text-muted">{t({ en: 'Not Allowed', es: 'No Permitidos' })}</span>
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
              <Card className="bg-white/60 backdrop-blur-sm border-line shadow-none rounded-sm">
                <CardContent className="p-6">
                  <div className={hasPriceBlock ? 'mb-6' : undefined}>
                    {isUnavailable ? (
                      <div className="text-center py-4">
                        <div className="text-lg font-light text-body-strong italic mb-2">
                          {t({ en: 'Property doesn\'t seem to be available', es: 'La propiedad no parece estar disponible' })}
                        </div>
                        <p className="text-sm text-muted font-light">
                          {t({ en: 'Contact us for information', es: 'Contáctanos para más información' })}
                        </p>
                      </div>
                    ) : isPriceOnRequest || isSaleOnly ? null : calculateApplicableRate.rate && (
                      <div>
                        <div className="font-display text-3xl text-ink mb-1">
                          {formatPrice(calculateApplicableRate.rate.amount, calculateApplicableRate.rate.currency)}
                          <span className="text-lg font-light text-muted ml-2">
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
                          <div className="mt-3 p-3 bg-canvas/60 backdrop-blur-sm rounded-sm border border-line">
                            <div className="text-xs font-light text-body-strong mb-2">
                              {t({ en: 'Rate Breakdown', es: 'Desglose de Tarifas' })}:
                            </div>
                            <div className="space-y-1">
                              {Object.entries(calculateApplicableRate.breakdown).map(([period, details]: [string, any]) => (
                                <div key={period} className="flex justify-between text-xs">
                                  <span className="text-muted">
                                    {period} ({details.days} {details.days === 1 ? t({ en: 'night', es: 'noche' }) : t({ en: 'nights', es: 'noches' })})
                                  </span>
                                  <span className="font-medium text-body-strong">
                                    {formatPrice(details.rate.amount, details.rate.currency)}/night
                                  </span>
                                </div>
                              ))}
                            </div>
                            {calculateApplicableRate.averageRate && (
                              <div className="mt-2 pt-2 border-t border-line">
                                <div className="flex justify-between text-xs">
                                  <span className="font-medium text-body-strong">
                                    {t({ en: 'Average per night', es: 'Promedio por noche' })}:
                                  </span>
                                  <span className="font-light text-ink">
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
                          <div className="text-sm text-status-confirmed mt-1">
                            {t({ en: 'Standard rate applies', es: 'Se aplica tarifa estándar' })}
                          </div>
                        )}
                      </div>
                    )}

                    {property.pricing?.salePricing?.salePrice && !property.pricing.salePricing.priceOnRequest && (isSaleOnly || !property.pricing?.rentalPricing?.nightlyRate) && (
                      <div className="font-display text-3xl text-ink mb-1">
                        {formatPrice(property.pricing.salePricing.salePrice.amount, property.pricing.salePricing.salePrice.currency)}
                      </div>
                    )}

                    {/* Rent-and-sale listing with a nightly rate: show the sale price too */}
                    {property.pricing?.type === 'both' &&
                      property.pricing?.rentalPricing?.nightlyRate &&
                      property.pricing?.salePricing?.salePrice &&
                      !property.pricing.salePricing.priceOnRequest && (
                        <div className="mt-3 pt-3 border-t border-line flex items-baseline justify-between gap-3">
                          <span className="eyebrow">{t({ en: 'Also for sale', es: 'También en venta' })}</span>
                          <span className="font-title text-xl text-ink tabular-nums">
                            {formatPrice(property.pricing.salePricing.salePrice.amount, property.pricing.salePricing.salePrice.currency)}
                          </span>
                        </div>
                      )}

                    {property.pricing?.rentalPricing?.minimumNights && !isPriceOnRequest && !isSaleOnly && property.availability?.isAvailable === true && (
                      <div className="text-sm text-muted mt-2">
                        {t({ en: 'Minimum', es: 'Mínimo' })}: {property.pricing.rentalPricing.minimumNights} {t({ en: 'nights', es: 'noches' })}
                      </div>
                    )}

                    {/* Show seasonal pricing info if available */}
                    {upcomingSeasons.length > 0 && !isPriceOnRequest && !isSaleOnly && (
                      <div className="mt-3 p-3 bg-brand-wash rounded-sm">
                        <div className="text-xs font-medium text-brand mb-1">
                          {t({ en: 'Seasonal Rates Available', es: 'Tarifas de Temporada Disponibles' })}
                        </div>
                        <div className="space-y-1">
                          {upcomingSeasons.slice(0, 2).map((season: any, idx: number) => (
                            <div key={idx} className="text-xs text-brand">
                              {season.name}: {formatPrice(season.nightlyRate.amount, season.nightlyRate.currency)}
                              <span className="text-brand ml-1">
                                ({formatDateKey(season.startDate, locale)} – {formatDateKey(season.endDate, locale)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price Disclaimer — only alongside a price */}
                    {showsPrice && !isSaleOnly && (
                    <div className="mt-3 flex items-start gap-1">
                      <Shield className="w-3 h-3 text-muted-2 mt-0.5" />
                      <p className="text-[10px] text-muted-2 leading-relaxed font-light">
                        {t({
                          en: 'Prices shown are estimates and subject to availability. Additional fees may apply.',
                          es: 'Los precios mostrados son estimados y sujetos a disponibilidad. Pueden aplicar cargos adicionales.'
                        })}
                      </p>
                    </div>
                    )}
                  </div>

                  {/* Date Selection — not for sale-only listings */}
                  {!isSaleOnly && (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className={fieldLabelClass}>
                        {t({ en: 'Select Dates', es: 'Seleccionar Fechas' })}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              fieldClass,
                              "gap-2 text-left",
                              validationError && !dateRange?.from && "border-status-attention"
                            )}
                            onClick={() => setValidationError(null)}
                          >
                            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-2" />
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
                              <span className="text-faint">
                                {t({ en: 'Pick dates', es: 'Elegir fechas' })}
                              </span>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 max-h-[var(--radix-popover-content-available-height)] overflow-y-auto"
                          align="start"
                          collisionPadding={16}
                        >
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={(range) => {
                              setDateRange(range)
                              if (range?.from && range?.to) {
                                setSelectedDates({
                                  ...selectedDates,
                                  checkIn: toDateKey(range.from),
                                  checkOut: toDateKey(range.to)
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
                                backgroundColor: '#f8f1f0',
                                color: '#8c5a55',
                                fontWeight: '500'
                              }
                            }}
                            className="rounded-md"
                          />
                          <div className="p-3 border-t">
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-status-attention-bg rounded"></div>
                                <span className="text-muted">
                                  {t({ en: 'Booked', es: 'Reservado' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-brand rounded"></div>
                                <span className="text-muted">
                                  {t({ en: 'Selected', es: 'Seleccionado' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {validationError && !dateRange?.from && (
                        <p className="mt-2 text-sm text-status-attention flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {validationError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={fieldLabelClass}>
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
                  )}

                  {/* Quote Section */}
                  {safeQuoteData && (
                    <div className="border border-line rounded-sm p-4 mb-4 bg-canvas/40 backdrop-blur-sm">
                      <h4 className="font-light text-ink mb-3 tracking-wide">
                        {t({ en: 'Price Estimate', es: 'Estimado de Precio' })}
                      </h4>
                      <div className="space-y-1 text-sm">
                        {/* Show detailed breakdown if mixed rates apply */}
                        {calculateApplicableRate.breakdown ? (
                          <>
                            {Object.entries(calculateApplicableRate.breakdown).map(([period, details]: [string, any]) => (
                              <div key={period}>
                                <div className="flex justify-between text-xs text-muted mb-0.5">
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
                        <div className="text-xs text-muted-2 pt-1">
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
                      <div className="mt-3 p-2 bg-sand/60 backdrop-blur-sm rounded-sm border border-line">
                        <p className="text-xs text-ink leading-relaxed font-light">
                          {t({
                            en: '* This is a preliminary estimate for informational purposes only. Final pricing may vary based on additional services, special requests, or changes in availability. Please contact us for a formal quote.',
                            es: '* Este es un estimado preliminar solo para fines informativos. El precio final puede variar según servicios adicionales, solicitudes especiales o cambios en disponibilidad. Por favor contáctenos para una cotización formal.'
                          })}
                        </p>
                      </div>

                    </div>
                  )}

                  {isUnavailable ? (
                    <Button onClick={() => setInquiryOpen(true)} className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t({ en: 'Ask us about dates', es: 'Consúltanos por fechas' })}
                    </Button>
                  ) : (
                    renderBookingActions()
                  )}
                </CardContent>
              </Card>

              {/* Contact Card - Agent or Fallback */}
              {(property.agent) && (
                <Card className="bg-surface border border-line rounded-none shadow-none">
                  <CardContent className="p-7">
                    {/* Agent Info */}
                    <div className="flex items-start gap-4 mb-5">
                      {property.agent.photo ? (
                        <img
                          src={urlFor(property.agent.photo).width(128).height(128).url()}
                          alt={property.agent.name}
                          className="w-16 h-16 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <Image src="/images/leticia-avatar.jpg"
                          alt="Leticia Coudray Saladin"
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover border border-line shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-xl text-ink mt-1 leading-tight">{property.agent.name}</div>
                        <div className="text-sm text-muted font-light">
                          {t({ en: 'Real Estate Agent', es: 'Agente Inmobiliario' })}
                        </div>
                        <Link href="/contact" className="inline-block mt-1.5 text-xs uppercase tracking-[0.12em] text-brand border-b border-brand-line pb-0.5 hover:border-brand transition-colors">
                          {t({ en: 'More information', es: 'Más información' })}
                        </Link>
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
                          className="w-full justify-start text-status-confirmed hover:text-status-confirmed"
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
                        <div className="mt-3 pt-3 border-t border-line">
                          <div className="eyebrow mb-2">
                            {t({ en: 'Specializes in', es: 'Se especializa en' })}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {property.agent.specializations.slice(0, 3).map((spec: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-sand/60 text-body-strong border-line">
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

        {/* Similar houses — one ranked rail, no repeats */}
        <div className="mt-16">
          <SimilarProperties
            properties={similar}
            mode={property.pricing?.type === 'sale' ? 'sale' : 'rental'}
            locale={locale}
          />
        </div>
      </div>

      {/* Floating Mobile Booking Button */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-white/95 backdrop-blur-xl border border-line rounded-sm shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              {canEstimate && safeRate ? (
                <>
                  <div className="text-lg font-light text-ink">
                    {formatPrice(safeRate.amount, safeRate.currency)}
                    <span className="text-sm text-muted ml-1">
                      / {t({ en: 'night', es: 'noche' })}
                    </span>
                  </div>
                  <div className="text-xs text-muted font-light">
                    {t({ en: 'Tap to book', es: 'Toca para reservar' })}
                  </div>
                </>
              ) : isSaleOnly && property.pricing?.salePricing?.salePrice && !property.pricing.salePricing.priceOnRequest ? (
                <div className="text-lg font-light text-ink">
                  {formatPrice(property.pricing.salePricing.salePrice.amount, property.pricing.salePricing.salePrice.currency)}
                </div>
              ) : null}
            </div>
            {/* No estimate possible (sale-only, no nightly rate): straight to the inquiry. */}
            <Button
              onClick={() => (canEstimate ? setShowMobileBooking(true) : setInquiryOpen(true))}
              className="bg-ink hover:bg-ink text-white px-6 py-2 font-light tracking-wide"
            >
              {canEstimate ? t({ en: 'Book Now', es: 'Reservar' }) : t({ en: 'Inquire', es: 'Consultar' })}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Booking Modal */}
      {showMobileBooking && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowMobileBooking(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-line rounded-t-xl shadow-2xl max-h-[85dvh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-line flex-shrink-0 bg-white/98 backdrop-blur-xl">
              <h3 className="text-lg font-light text-ink tracking-wide">
                {t({ en: 'Book Your Stay', es: 'Reserva tu Estadía' })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileBooking(false)}
                className="p-2 hover:bg-sand/50"
              >
                <X className="w-5 h-5 text-muted" />
              </Button>
            </div>

            {/* Booking Content - Full Desktop Sidebar Content */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0">
              <div className={hasPriceBlock ? 'mb-6' : undefined}>
                {isPriceOnRequest || isSaleOnly ? null : safeRate && (
                  <div>
                    <div className="font-display text-3xl text-ink mb-1">
                      {formatPrice(safeRate.amount, safeRate.currency)}
                      <span className="text-lg font-light text-muted ml-2">
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
                      <div className="mt-3 p-3 bg-canvas/60 backdrop-blur-sm rounded-sm border border-line">
                        <div className="text-xs font-light text-body-strong mb-2">
                          {t({ en: 'Rate Breakdown', es: 'Desglose de Tarifas' })}:
                        </div>
                        <div className="space-y-1">
                          {Object.entries(calculateApplicableRate.breakdown).map(([period, details]: [string, any]) => (
                            <div key={period} className="flex justify-between text-xs">
                              <span className="text-muted font-light">
                                {period} ({details.days} {details.days === 1 ? t({ en: 'night', es: 'noche' }) : t({ en: 'nights', es: 'noches' })})
                              </span>
                              <span className="font-light text-body-strong">
                                {formatPrice(details.rate.amount, details.rate.currency)}/night
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-line">
                          <div className="flex justify-between text-xs">
                            <span className="font-light text-body-strong">
                              {t({ en: 'Average per night', es: 'Promedio por noche' })}:
                            </span>
                            <span className="font-light text-ink">
                              {formatPrice(calculateApplicableRate.averageRate.amount, calculateApplicableRate.averageRate.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Single season badge */}
                    {calculateApplicableRate.seasonNames.length === 1 && !calculateApplicableRate.hasMixedRates && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs bg-sand/60 text-body-strong border-line">
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

                {property.pricing?.salePricing?.salePrice && !property.pricing.salePricing.priceOnRequest && (isSaleOnly || !property.pricing?.rentalPricing?.nightlyRate) && (
                  <div className="font-display text-3xl text-ink mb-1">
                    {formatPrice(property.pricing.salePricing.salePrice.amount, property.pricing.salePricing.salePrice.currency)}
                  </div>
                )}

                {/* Rent-and-sale listing with a nightly rate: show the sale price too */}
                {property.pricing?.type === 'both' &&
                  property.pricing?.rentalPricing?.nightlyRate &&
                  property.pricing?.salePricing?.salePrice &&
                  !property.pricing.salePricing.priceOnRequest && (
                    <div className="mt-3 pt-3 border-t border-line flex items-baseline justify-between gap-3">
                      <span className="eyebrow">{t({ en: 'Also for sale', es: 'También en venta' })}</span>
                      <span className="font-title text-xl text-ink tabular-nums">
                        {formatPrice(property.pricing.salePricing.salePrice.amount, property.pricing.salePricing.salePrice.currency)}
                      </span>
                    </div>
                  )}

                {property.pricing?.rentalPricing?.minimumNights && !isPriceOnRequest && !isSaleOnly && (
                  <div className="text-sm text-muted mt-2 font-light">
                    {t({ en: 'Minimum', es: 'Mínimo' })}: {property.pricing.rentalPricing.minimumNights} {t({ en: 'nights', es: 'noches' })}
                  </div>
                )}

                {/* Seasonal pricing info */}
                {upcomingSeasons.length > 0 && !isPriceOnRequest && !isSaleOnly && (
                  <div className="mt-3 p-3 bg-canvas/60 backdrop-blur-sm rounded-sm border border-line">
                    <div className="text-xs font-light text-ink mb-1">
                      {t({ en: 'Seasonal Rates Available', es: 'Tarifas de Temporada Disponibles' })}
                    </div>
                    <div className="space-y-1">
                      {upcomingSeasons.slice(0, 2).map((season: any, idx: number) => (
                        <div key={idx} className="text-xs text-body-strong font-light">
                          {season.name}: {formatPrice(season.nightlyRate.amount, season.nightlyRate.currency)}
                          <span className="text-muted ml-1">
                            ({formatDateKey(season.startDate, locale)} – {formatDateKey(season.endDate, locale)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Disclaimer — only alongside a price */}
                {showsPrice && !isSaleOnly && (
                <div className="mt-3 flex items-start gap-1">
                  <Shield className="w-3 h-3 text-muted-2 mt-0.5" />
                  <p className="text-xs text-muted-2 leading-relaxed font-light">
                    {t({
                      en: 'Prices shown are estimates and subject to availability. Additional fees may apply.',
                      es: 'Los precios mostrados son estimados y sujetos a disponibilidad. Pueden aplicar cargos adicionales.'
                    })}
                  </p>
                </div>
                )}
              </div>

              {/* Date Selection — not for sale-only listings */}
              {!isSaleOnly && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className={fieldLabelClass}>
                    {t({ en: 'Select Dates', es: 'Seleccionar Fechas' })}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          fieldClass,
                          "gap-2 text-left",
                          validationError && !dateRange?.from && "border-status-attention"
                        )}
                        onClick={() => setValidationError(null)}
                      >
                        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-2" />
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
                          <span className="text-faint">
                            {t({ en: 'Pick dates', es: 'Elegir fechas' })}
                          </span>
                        )}
                      </button>
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
                              checkIn: toDateKey(range.from),
                              checkOut: toDateKey(range.to)
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
                            backgroundColor: '#f8f1f0',
                            color: '#8c5a55',
                            fontWeight: '500'
                          }
                        }}
                        className="rounded-md"
                      />
                      <div className="p-3 border-t">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-status-attention-bg rounded"></div>
                            <span className="text-muted">
                              {t({ en: 'Booked', es: 'Reservado' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-brand rounded"></div>
                            <span className="text-muted">
                              {t({ en: 'Selected', es: 'Seleccionado' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {validationError && !dateRange?.from && (
                    <p className="mt-2 text-sm text-status-attention flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {validationError}
                    </p>
                  )}
                </div>

                <div>
                  <label className={fieldLabelClass}>
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
              )}

              {/* Quote Section */}
              {safeQuoteData && (
                <div className="border border-line rounded-sm p-4 mb-4 bg-canvas/40 backdrop-blur-sm">
                  <h4 className="font-light text-ink mb-3 tracking-wide">
                    {t({ en: 'Price Estimate', es: 'Estimado de Precio' })}
                  </h4>
                  <div className="space-y-1 text-sm">
                    {/* Show detailed breakdown if mixed rates apply */}
                    {calculateApplicableRate.breakdown ? (
                      <>
                        {Object.entries(calculateApplicableRate.breakdown).map(([period, details]: [string, any]) => (
                          <div key={period}>
                            <div className="flex justify-between text-xs text-muted mb-0.5">
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
                    <div className="text-xs text-muted-2 pt-1">
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
                  <div className="mt-3 p-2 bg-sand/60 backdrop-blur-sm rounded-sm border border-line">
                    <p className="text-xs text-ink leading-relaxed font-light">
                      {t({
                        en: '* This is a preliminary estimate for informational purposes only. Final pricing may vary based on additional services, special requests, or changes in availability. Please contact us for a formal quote.',
                        es: '* Este es un estimado preliminar solo para fines informativos. El precio final puede variar según servicios adicionales, solicitudes especiales o cambios en disponibilidad. Por favor contáctenos para una cotización formal.'
                      })}
                    </p>
                  </div>

                </div>
              )}

              {renderBookingActions()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}