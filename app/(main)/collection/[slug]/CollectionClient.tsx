'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PropertyCard from '@/components/PropertyCard'
import { urlFor } from '@/sanity/lib/image'
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Lock,
  Share2,
  Copy,
  Home,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react'

interface Collection {
  _id: string
  slug: string
  title: {
    es: string
    en: string
  }
  description: {
    es: string
    en: string
  }
  welcomeMessage?: {
    es: string
    en: string
  }
  collectionType: 'event' | 'travel' | 'business' | 'personal'
  coverImage?: any
  dateRange?: {
    startDate: string
    endDate: string
  }
  expiresAt?: string
  organizer?: {
    name: string
    email: string
    phone?: string
    company?: string
  }
  customization?: {
    primaryColor: string
    secondaryColor: string
    logoUrl?: string
  }
  features?: {
    enableSharing: boolean
    showPricing: boolean
    showAvailability: boolean
    allowInquiries: boolean
  }
  metadata?: {
    expectedGuests: number
    budget: {
      min: number
      max: number
      currency: string
    }
  }
  properties: any[]
  totalProperties: number
}

interface CollectionError {
  error: string
  expired?: boolean
  requiresAccessCode?: boolean
}

interface CollectionClientProps {
  collection: Collection | null
  error?: CollectionError
  slug: string
}

export default function CollectionClient({ collection, error, slug }: CollectionClientProps) {
  const { locale, t } = useLocale()
  const [accessCode, setAccessCode] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      // Track share event
      if (collection) {
        fetch('/api/collection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collectionId: collection._id,
            sharedBy: 'anonymous' // In production, use actual user info
          })
        })
      }
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (accessCode.trim()) {
      window.location.href = `${window.location.pathname}?accessCode=${accessCode}`
    }
  }

  const handleAddToCalendar = () => {
    if (!collection?.dateRange?.startDate || !collection?.dateRange?.endDate) return

    const startDate = new Date(collection.dateRange.startDate)
    const endDate = new Date(collection.dateRange.endDate)

    // Format dates for ICS file (YYYYMMDD format)
    const formatICSDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}${month}${day}`
    }

    const title = locale === 'es' ? collection.title.es : collection.title.en
    const description = locale === 'es' ? collection.description.es : collection.description.en
    const location = 'Casa de Campo, La Romana, Dominican Republic'

    // Create ICS file content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Leticia Coudray Real Estate//Collection//EN',
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${formatICSDate(startDate)}`,
      `DTEND;VALUE=DATE:${formatICSDate(new Date(endDate.getTime() + 86400000))}`, // Add 1 day for all-day event
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `URL:${shareUrl}`,
      `UID:${collection._id}@leticiacoudrayrealestate.com`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `${collection.slug}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle error cases
  if (error) {
    if (error.expired) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6">
                <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h1 className="text-2xl font-light text-slate-900 mb-2">
                  {t({
                    en: 'Collection Expired',
                    es: 'Colección Expirada'
                  })}
                </h1>
                <p className="text-slate-600">
                  {t({
                    en: 'This collection is no longer available.',
                    es: 'Esta colección ya no está disponible.'
                  })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    {t({ en: 'Back to Home', es: 'Volver al Inicio' })}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">
                    <Mail className="w-4 h-4 mr-2" />
                    {t({ en: 'Contact Us', es: 'Contactar' })}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (error.requiresAccessCode) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="p-6 rounded-sm shadow-none">
                <div className="text-center mb-6">
                  <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h1 className="text-2xl font-light text-slate-900 mb-2">
                    {t({
                      en: 'Private Collection',
                      es: 'Colección Privada'
                    })}
                  </h1>
                  <p className="text-slate-600">
                    {t({
                      en: 'Enter the access code to view this collection.',
                      es: 'Ingresa el código de acceso para ver esta colección.'
                    })}
                  </p>
                </div>

                <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
                  <Input
                    type="password"
                    placeholder={t({
                      en: 'Access Code',
                      es: 'Código de Acceso'
                    })}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="text-center"
                  />
                  <Button type="submit" className="w-full">
                    {t({ en: 'Access Collection', es: 'Acceder a Colección' })}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      )
    }

    // Generic error
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-light text-slate-900 mb-2">
              {t({ en: 'Error Loading Collection', es: 'Error Cargando Colección' })}
            </h1>
            <p className="text-slate-600 mb-6">{error.error}</p>
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                {t({ en: 'Back to Home', es: 'Volver al Inicio' })}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!collection) return null

  const title = locale === 'es' ? collection.title.es : collection.title.en
  const description = locale === 'es' ? collection.description.es : collection.description.en
  const welcomeMessage = collection.welcomeMessage
    ? (locale === 'es' ? collection.welcomeMessage.es : collection.welcomeMessage.en)
    : null

  console.log(collection)
  const getCollectionTypeLabel = () => {
    const types = {
      event: { en: 'Event', es: 'Evento' },
      travel: { en: 'Travel', es: 'Viaje' },
      business: { en: 'Business', es: 'Negocios' },
      personal: { en: 'Personal', es: 'Personal' }
    }
    return types[collection.collectionType]?.[locale] || collection.collectionType
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-DO' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const primaryColor = collection.customization?.primaryColor || '#3B82F6'
  const secondaryColor = collection.customization?.secondaryColor || '#F1F5F9'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with cover image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
        {collection.coverImage && (
          <Image
            src={urlFor(collection.coverImage).width(1200).height(400).url()}
            alt={title}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Collection info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30 capitalize hover:bg-white/30"
                  >
                    {getCollectionTypeLabel()}
                  </Badge>
                  {collection.dateRange && collection.dateRange.startDate && collection.dateRange.endDate && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 capitalize hover:bg-white/30 cursor-pointer"
                      onClick={handleAddToCalendar}
                      title={t({ en: 'Add to calendar', es: 'Añadir al calendario' })}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(collection.dateRange.startDate)} - {formatDate(collection.dateRange.endDate)}
                      </span>
                    </Badge>
                  )}
                  {collection.features?.enableSharing && (
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/30 capitalize hover:bg-white/30 cursor-pointer"
                      onClick={handleShare}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied
                        ? t({ en: 'Copied!', es: '¡Copiado!' })
                        : t({ en: 'Copy Link', es: 'Copiar Link' })
                      }
                    </Badge>
                  )}

                </div>
                <h1 className="text-3xl md:text-5xl font-light mb-2">{title}</h1>
                <p className="text-white/90 max-w-2xl">{description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome message */}
        {welcomeMessage && (
          <div className="rounded-sm p-6 mb-8 shadow-none">
            <h2 className="font-light text-xs text-gray-700 mb-2 uppercase">
              {t({ en: 'Welcome Message', es: 'Mensaje de Bienvenida' })}
            </h2>
            <p className="text-slate-800 text-lg">{welcomeMessage}</p>
          </div>
        )}

        {/* Collection metadata */}
        {(collection.organizer || collection?.metadata?.expectedGuests || collection?.metadata?.budget?.min || collection?.metadata?.budget?.max) && (
          <div className="bg-white rounded-sm p-6 mb-8 shadow-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collection.organizer && (
                <div>
                  <h3 className="font-light mb-3">
                    {t({ en: 'Organized by', es: 'Organizado por' })}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{collection.organizer.name}</p>
                    {collection.organizer.company && (
                      <p className="text-slate-600">{collection.organizer.company}</p>
                    )}
                    <p className="text-slate-600">{collection.organizer.email}</p>
                  </div>
                </div>
              )}

              {collection.metadata && (
                <div className="space-y-4">
                  {collection.metadata.expectedGuests && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">
                        {collection.metadata.expectedGuests} {t({
                          en: 'expected guests',
                          es: 'huéspedes esperados'
                        })}
                      </span>
                    </div>
                  )}
                  {collection.metadata.budget && collection.metadata.budget.min && collection.metadata.budget.max && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {t({ en: 'Budget', es: 'Presupuesto' })}: {' '}
                        {new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
                          style: 'currency',
                          currency: collection.metadata.budget.currency
                        }).format(collection.metadata.budget.min)} - {' '}
                        {new Intl.NumberFormat(locale === 'es' ? 'es-DO' : 'en-US', {
                          style: 'currency',
                          currency: collection.metadata.budget.currency
                        }).format(collection.metadata.budget.max)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Properties grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light">
              {t({
                en: `Properties (${collection.totalProperties})`,
                es: `Propiedades (${collection.totalProperties})`
              })}
            </h2>
          </div>

          {collection.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-light text-slate-600 mb-2">
                {t({ en: 'No Properties Available', es: 'No Hay Propiedades Disponibles' })}
              </h3>
              <p className="text-slate-500">
                {t({
                  en: 'This collection currently has no available properties.',
                  es: 'Esta colección no tiene propiedades disponibles actualmente.'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Contact Leticia Section */}
        <div className="bg-gradient-to-br from-blue-900/90 to-cyan-900/90 rounded-sm p-8 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
              {t({
                en: 'Need Help Planning Your Stay?',
                es: '¿Necesitas Ayuda Planificando tu Estadía?'
              })}
            </h2>
            <p className="text-white/90 mb-6 text-lg">
              {t({
                en: 'Contact Leticia directly for personalized assistance with your group booking',
                es: 'Contacta a Leticia directamente para asistencia personalizada con tu reserva grupal'
              })}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 min-w-[200px]"
              >
                <a href="tel:+18293422566" className="inline-flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  {t({ en: 'Call Now', es: 'Llamar Ahora' })}
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 min-w-[200px]"
              >
                <a
                  href="https://wa.me/18293422566"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t({ en: 'WhatsApp', es: 'WhatsApp' })}
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white min-w-[200px]"
              >
                <Link href="/contact" className="inline-flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  {t({ en: 'Send Email', es: 'Enviar Email' })}
                </Link>
              </Button>
            </div>

            <p className="text-white/70 text-sm mt-6">
              {t({
                en: '+1 (829) 342-2566 • leticiacoudrayrealestate@gmail.com',
                es: '+1 (829) 342-2566 • leticiacoudrayrealestate@gmail.com'
              })}
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              {t({ en: 'Back to Home', es: 'Volver al Inicio' })}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}