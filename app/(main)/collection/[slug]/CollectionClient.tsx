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
import { formatDateKey, fromDateKey } from '@/lib/dates'
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

/** Collection types where "Hosted by" makes sense (someone invites a group). */
const HOSTED_TYPES = ['wedding', 'corporate', 'family-reunion', 'group']

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
    name?: string
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
    expectedGuests?: number
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

    const startDate = fromDateKey(collection.dateRange.startDate)
    const endDate = fromDateKey(collection.dateRange.endDate)

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
      `UID:${collection._id}@updates.leticiacoudrayrealestate.com
`,
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
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6">
                <Clock className="w-16 h-16 text-faint mx-auto mb-4" />
                <h1 className="font-title text-2xl text-ink mb-2">
                  {t({
                    en: 'Collection Expired',
                    es: 'Colección Expirada'
                  })}
                </h1>
                <p className="text-muted">
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
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="p-6 rounded-sm shadow-none">
                <div className="text-center mb-6">
                  <Lock className="w-16 h-16 text-faint mx-auto mb-4" />
                  <h1 className="font-title text-2xl text-ink mb-2">
                    {t({
                      en: 'Private Collection',
                      es: 'Colección Privada'
                    })}
                  </h1>
                  <p className="text-muted">
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
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-status-attention mx-auto mb-4" />
            <h1 className="font-title text-2xl text-ink mb-2">
              {t({ en: 'Error Loading Collection', es: 'Error Cargando Colección' })}
            </h1>
            <p className="text-muted mb-6">{error.error}</p>
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

  const getCollectionTypeLabel = () => {
    const types = {
      event: { en: 'Event', es: 'Evento' },
      travel: { en: 'Travel', es: 'Viaje' },
      business: { en: 'Business', es: 'Negocios' },
      personal: { en: 'Personal', es: 'Personal' }
    }
    return types[collection.collectionType]?.[locale] || collection.collectionType
  }

  const formatDate = (dateString: string) =>
    formatDateKey(dateString, locale, { year: 'numeric', month: 'long', day: 'numeric' })

  const primaryColor = collection.customization?.primaryColor || '#33504c'
  const secondaryColor = collection.customization?.secondaryColor || '#edeae5'

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header: over the cover image when there is one, otherwise a plain
          title block — no empty image space. Same container as the body. */}
      {(() => {
        const onImage = !!collection.coverImage
        const badgeClass = onImage
          ? 'bg-white/20 text-white border-white/30 capitalize hover:bg-white/30'
          : 'bg-sand text-body-strong border-line capitalize hover:bg-sand'
        const info = (
          <div className={onImage ? 'text-white' : 'text-ink'}>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <Badge variant="secondary" className={badgeClass}>
                {getCollectionTypeLabel()}
              </Badge>
              {collection.dateRange && collection.dateRange.startDate && collection.dateRange.endDate && (
                <Badge
                  variant="secondary"
                  className={`${badgeClass} cursor-pointer`}
                  onClick={handleAddToCalendar}
                  title={t({ en: 'Add to calendar', es: 'Añadir al calendario' })}
                >
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDate(collection.dateRange.startDate)} - {formatDate(collection.dateRange.endDate)}
                  </span>
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-5xl mb-2">{title}</h1>
            {description && <p className={`max-w-2xl ${onImage ? 'text-white/90' : 'text-muted font-light'}`}>{description}</p>}
            {collection.features?.enableSharing && (
              <button
                type="button"
                onClick={handleShare}
                className={`mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] border-b pb-1 transition-colors ${
                  onImage
                    ? 'text-white/80 hover:text-white border-white/30 hover:border-white'
                    : 'text-muted hover:text-ink border-line hover:border-ink'
                }`}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t({ en: 'Copied!', es: '¡Copiado!' }) : t({ en: 'Copy link', es: 'Copiar link' })}
              </button>
            )}
          </div>
        )

        if (!onImage) {
          return (
            <div className="container mx-auto px-4 pt-32">
              <div className="pb-10 border-b border-line">{info}</div>
            </div>
          )
        }

        return (
          <div data-hero className="relative h-64 md:h-[80vh] overflow-hidden">
            <Image
              src={urlFor(collection.coverImage).width(2400).height(1200).quality(75).url()}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {/* Darken only the lower text area, leaving the top of the image clear. */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12">
              <div className="container mx-auto px-4">{info}</div>
            </div>
          </div>
        )
      })()}

      <div className="container mx-auto px-4 py-10">
        {/* Welcome message */}
        {welcomeMessage && (
          <div className="mb-8">
            <h2 className="eyebrow mb-2">
              {t({ en: 'Welcome Message', es: 'Mensaje de Bienvenida' })}
            </h2>
            <p className="text-ink text-lg">{welcomeMessage}</p>
          </div>
        )}

        {/* Host — only for group/event collections, where invitees need to
            know who put the list together. Never contact details or budget. */}
        {HOSTED_TYPES.includes(collection.collectionType) && collection.organizer?.name && (
          <div className="mb-8 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-line pb-8">
            <div>
              <h2 className="eyebrow mb-2">{t({ en: 'Hosted by', es: 'Organizado por' })}</h2>
              <p className="font-title text-xl text-ink">
                {collection.organizer.name}
                {collection.organizer.company && (
                  <span className="text-muted font-light"> · {collection.organizer.company}</span>
                )}
              </p>
            </div>
            {collection.metadata?.expectedGuests ? (
              <p className="flex items-center gap-2 text-sm text-muted font-light">
                <Users className="w-4 h-4 text-muted-2" />
                {collection.metadata.expectedGuests} {t({ en: 'guests expected', es: 'huéspedes esperados' })}
              </p>
            ) : null}
          </div>
        )}

        {/* Properties grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-title text-2xl text-ink">
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
              <MapPin className="w-16 h-16 text-faint mx-auto mb-4" />
              <h3 className="font-serif text-xl text-ink mb-2">
                {t({ en: 'No Properties Available', es: 'No Hay Propiedades Disponibles' })}
              </h3>
              <p className="text-muted-2">
                {t({
                  en: 'This collection currently has no available properties.',
                  es: 'Esta colección no tiene propiedades disponibles actualmente.'
                })}
              </p>
            </div>
          )}
        </div>

        {/* Contact us section */}
        <div className="bg-sand/60 border border-line rounded-sm p-8 mb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl text-ink mb-4">
              {t({
                en: 'Need Help Planning Your Stay?',
                es: '¿Necesitas Ayuda Planificando tu Estadía?'
              })}
            </h2>
            <p className="text-muted mb-6 text-lg font-light">
              {t({
                en: 'Contact us directly for personalized assistance with your group booking',
                es: 'Contáctanos directamente para asistencia personalizada con tu reserva grupal'
              })}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="min-w-[200px]">
                <a href="tel:+18293422566" className="inline-flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  {t({ en: 'Call Now', es: 'Llamar Ahora' })}
                </a>
              </Button>

              <Button asChild size="lg" variant="outline" className="min-w-[200px]">
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

              <Button asChild size="lg" variant="outline" className="min-w-[200px]">
                <Link href="/contact" className="inline-flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  {t({ en: 'Send Email', es: 'Enviar Email' })}
                </Link>
              </Button>
            </div>

            <p className="text-muted-2 text-sm mt-6">
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