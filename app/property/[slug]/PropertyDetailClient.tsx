'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import PropertyGallery from '@/components/PropertyGallery'
import AmenitiesList from '@/components/AmenitiesList'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  Share2, 
  Heart,
  Calendar,
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
  Wifi
} from 'lucide-react'

interface PropertyDetailClientProps {
  property: any
}

export default function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const { locale, t } = useLocale()
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '', guests: 2 })
  const [quoteData, setQuoteData] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [showInquiryForm, setShowInquiryForm] = useState(false)

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

  // Get localized content
  const title = locale === 'es' ? property.title_es : property.title_en
  const description = locale === 'es' ? property.description_es : property.description_en
  const areaTitle = property.area 
    ? (locale === 'es' ? property.area.title_es : property.area.title_en)
    : ''
  const address = locale === 'es' ? property.location?.address_es : property.location?.address_en

  const handleGetQuote = async () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      alert(t({ en: 'Please select check-in and check-out dates', es: 'Por favor selecciona las fechas de entrada y salida' }))
      return
    }

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
    const message = `Hello! I'm interested in ${title}. Property Code: ${property.propertyCode}${
      selectedDates.checkIn ? `\nDates: ${selectedDates.checkIn} to ${selectedDates.checkOut}` : ''
    }${selectedDates.guests ? `\nGuests: ${selectedDates.guests}` : ''}`
    
    const whatsappUrl = `https://wa.me/${property.contactInfo?.whatsapp || property.contactInfo?.phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/search" 
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {t({ en: 'Back to Results', es: 'Volver a Resultados' })}
            </Link>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                {t({ en: 'Share', es: 'Compartir' })}
              </Button>
              <Button variant="outline" size="sm">
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
                  <Badge key={theme} variant="secondary" className="capitalize">
                    {theme}
                  </Badge>
                ))}
                {property.isFeatured && (
                  <Badge variant="default" className="bg-amber-500 border-amber-500">
                    {t({ en: 'Featured', es: 'Destacado' })}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {title}
              </h1>
              
              <div className="flex items-center gap-2 text-slate-600 mb-4">
                <MapPin className="w-5 h-5" />
                <span>{address}{areaTitle ? `, ${areaTitle}` : ''}</span>
              </div>

              {property.reviews && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{property.reviews.averageRating}</span>
                  </div>
                  <span className="text-slate-600">
                    ({property.reviews.totalReviews} {t({ en: 'reviews', es: 'reseñas' })})
                  </span>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Button onClick={() => setShowInquiryForm(true)} className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t({ en: 'Send Inquiry', es: 'Enviar Consulta' })}
                </Button>
                
                {property.contactInfo?.whatsapp && (
                  <Button onClick={handleWhatsApp} variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            {description && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {t({ en: 'About This Property', es: 'Sobre Esta Propiedad' })}
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-relaxed">{description}</p>
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                {t({ en: 'Amenities', es: 'Amenidades' })}
              </h2>
              <AmenitiesList amenities={property.amenities} />
            </div>

            {/* Image Gallery */}
            {property.gallery && property.gallery.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
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
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        {getCategoryLabel(category)}
                        <span className="text-sm text-slate-500 font-normal">
                          ({groupedImages[category].length} {groupedImages[category].length === 1 ? 
                            t({ en: 'photo', es: 'foto' }) : 
                            t({ en: 'photos', es: 'fotos' })
                          })
                        </span>
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedImages[category].map((image: any, idx: number) => (
                          <div key={`${category}-${idx}`} className="group cursor-pointer overflow-hidden rounded-xl bg-slate-100 hover:shadow-lg transition-all duration-300">
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={urlFor(image.asset).width(500).height(375).quality(85).url()}
                                alt={image.alt || image.caption || `${getCategoryLabel(category)} ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                <h2 className="text-2xl font-bold mb-4">
                  {t({ en: 'Location', es: 'Ubicación' })}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Info */}
                  <div className="space-y-4">
                    {property.location.distanceToBeach && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          🏖️
                        </div>
                        <div>
                          <div className="font-semibold">
                            {t({ en: 'Distance to Beach', es: 'Distancia a la Playa' })}
                          </div>
                          <div className="text-slate-600">
                            {property.location.distanceToBeach}m
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {property.location.distanceToAirport && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          ✈️
                        </div>
                        <div>
                          <div className="font-semibold">
                            {t({ en: 'Distance to Airport', es: 'Distancia al Aeropuerto' })}
                          </div>
                          <div className="text-slate-600">
                            {property.location.distanceToAirport}km
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nearby Attractions */}
                  {property.location.nearbyAttractions && property.location.nearbyAttractions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">
                        {t({ en: 'Nearby Attractions', es: 'Atracciones Cercanas' })}
                      </h4>
                      <div className="space-y-2">
                        {property.location.nearbyAttractions.slice(0, 5).map((attraction: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-slate-700">
                              {locale === 'es' ? attraction.name_es : attraction.name_en}
                            </span>
                            {attraction.distance && (
                              <span className="text-sm text-slate-500">
                                {attraction.distance}km
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* House Rules */}
            {property.houseRules && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {t({ en: 'House Rules', es: 'Reglas de la Casa' })}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.houseRules.smokingAllowed !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${property.houseRules.smokingAllowed ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{t({ en: 'Smoking', es: 'Fumar' })}: {property.houseRules.smokingAllowed ? t({ en: 'Allowed', es: 'Permitido' }) : t({ en: 'Not Allowed', es: 'No Permitido' })}</span>
                    </div>
                  )}
                  {property.houseRules.petsAllowed !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${property.houseRules.petsAllowed ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{t({ en: 'Pets', es: 'Mascotas' })}: {property.houseRules.petsAllowed ? t({ en: 'Allowed', es: 'Permitidas' }) : t({ en: 'Not Allowed', es: 'No Permitidas' })}</span>
                    </div>
                  )}
                  {property.houseRules.eventsAllowed !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${property.houseRules.eventsAllowed ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span>{t({ en: 'Events', es: 'Eventos' })}: {property.houseRules.eventsAllowed ? t({ en: 'Allowed', es: 'Permitidos' }) : t({ en: 'Not Allowed', es: 'No Permitidos' })}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    {property.pricing?.rentalPricing?.nightlyRate && (
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {formatPrice(property.pricing.rentalPricing.nightlyRate.amount, property.pricing.rentalPricing.nightlyRate.currency)}
                        <span className="text-lg font-normal text-slate-500 ml-2">
                          / {t({ en: 'night', es: 'noche' })}
                        </span>
                      </div>
                    )}
                    
                    {property.pricing?.salePricing?.salePrice && (
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {formatPrice(property.pricing.salePricing.salePrice.amount, property.pricing.salePricing.salePrice.currency)}
                      </div>
                    )}
                    
                    {property.pricing?.rentalPricing?.minimumNights && (
                      <div className="text-sm text-slate-600">
                        {t({ en: 'Minimum', es: 'Mínimo' })}: {property.pricing.rentalPricing.minimumNights} {t({ en: 'nights', es: 'noches' })}
                      </div>
                    )}
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {t({ en: 'Check-in', es: 'Entrada' })}
                        </label>
                        <Input
                          type="date"
                          value={selectedDates.checkIn}
                          onChange={(e) => setSelectedDates({...selectedDates, checkIn: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {t({ en: 'Check-out', es: 'Salida' })}
                        </label>
                        <Input
                          type="date"
                          value={selectedDates.checkOut}
                          onChange={(e) => setSelectedDates({...selectedDates, checkOut: e.target.value})}
                          min={selectedDates.checkIn}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {t({ en: 'Guests', es: 'Huéspedes' })}
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max={property.amenities?.maxGuests || 10}
                        value={selectedDates.guests}
                        onChange={(e) => setSelectedDates({...selectedDates, guests: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  {/* Quote Section */}
                  {quoteData && (
                    <div className="border rounded-lg p-4 mb-4 bg-slate-50">
                      <h4 className="font-semibold mb-2">
                        {t({ en: 'Price Breakdown', es: 'Desglose de Precios' })}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>{(quoteData as any).quote?.nights} {t({ en: 'nights', es: 'noches' })}</span>
                          <span>{formatPrice((quoteData as any).quote?.breakdown.accommodationTotal, (quoteData as any).quote?.currency)}</span>
                        </div>
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
                        <div className="border-t pt-1 flex justify-between font-semibold">
                          <span>{t({ en: 'Total', es: 'Total' })}</span>
                          <span>{formatPrice((quoteData as any).quote?.total, (quoteData as any).quote?.currency)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleGetQuote} 
                    className="w-full"
                    disabled={loadingQuote}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {loadingQuote 
                      ? t({ en: 'Getting Quote...', es: 'Obteniendo Cotización...' })
                      : t({ en: 'Get Quote', es: 'Obtener Cotización' })
                    }
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Card */}
              {property.contactInfo && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">
                      {t({ en: 'Contact Host', es: 'Contactar Anfitrión' })}
                    </h3>
                    
                    {property.contactInfo.hostName && (
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium">{property.contactInfo.hostName}</div>
                          {property.contactInfo.responseTime && (
                            <div className="text-sm text-slate-500">
                              {t({ en: 'Responds in', es: 'Responde en' })} {property.contactInfo.responseTime}h
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {property.contactInfo.phone && (
                        <Button variant="outline" className="w-full justify-start">
                          <Phone className="w-4 h-4 mr-2" />
                          {property.contactInfo.phone}
                        </Button>
                      )}
                      
                      {property.contactInfo.whatsapp && (
                        <Button 
                          onClick={handleWhatsApp}
                          variant="outline" 
                          className="w-full justify-start text-green-600 hover:text-green-700"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      )}
                      
                      {property.contactInfo.email && (
                        <Button variant="outline" className="w-full justify-start">
                          <Mail className="w-4 h-4 mr-2" />
                          {t({ en: 'Email', es: 'Correo' })}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}