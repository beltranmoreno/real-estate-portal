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
  CheckCircle2
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
    start: string
    end: string
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
    allowSharing: boolean
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

  // Handle error cases
  if (error) {
    if (error.expired) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-6">
                <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
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

    if (error.requiresAccessCode) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
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
                    className="bg-white/20 text-white border-white/30"
                  >
                    {getCollectionTypeLabel()}
                  </Badge>
                  {collection.dateRange && (
                    <div className="flex items-center gap-1 text-sm text-white/90">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(collection.dateRange.start)} - {formatDate(collection.dateRange.end)}
                      </span>
                    </div>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
                <p className="text-white/90 max-w-2xl">{description}</p>
              </div>

              {collection.features?.allowSharing && (
                <Button
                  onClick={handleShare}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Share2 className="w-4 h-4 mr-2" />
                  )}
                  {copied 
                    ? t({ en: 'Copied!', es: '¡Copiado!' })
                    : t({ en: 'Share', es: 'Compartir' })
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome message */}
        {welcomeMessage && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="font-semibold text-lg mb-2">
              {t({ en: 'Welcome Message', es: 'Mensaje de Bienvenida' })}
            </h2>
            <p className="text-slate-600">{welcomeMessage}</p>
          </div>
        )}

        {/* Collection metadata */}
        {(collection.organizer || collection.metadata) && (
          <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collection.organizer && (
                <div>
                  <h3 className="font-semibold mb-3">
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
                  {collection.metadata.budget && (
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
            <h2 className="text-2xl font-bold">
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
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
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