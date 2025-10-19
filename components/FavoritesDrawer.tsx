'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import {
  X,
  Trash2,
  Heart,
  Bed,
  Bath,
  Users,
  MapPin,
  Send,
  MessageCircle,
  Mail,
  Copy,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoritesDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function FavoritesDrawer({ isOpen, onClose }: FavoritesDrawerProps) {
  const { favorites, removeFavorite, clearFavorites, favoritesCount } = useFavorites()
  const { locale, t } = useLocale()
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={cn(
        "fixed right-0 top-0 h-[100dvh] w-full md:w-[480px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-xl font-light text-stone-900">
              {t({ en: 'My Favorites', es: 'Mis Favoritos' })}
              {favoritesCount > 0 && (
                <span className="ml-2 text-sm text-stone-500">({favoritesCount})</span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Heart className="w-16 h-16 text-stone-300 mb-4" />
              <h3 className="text-lg font-light text-stone-900 mb-2">
                {t({ en: 'No favorites yet', es: 'No hay favoritos aún' })}
              </h3>
              <p className="text-sm text-stone-500 max-w-sm">
                {t({
                  en: 'Start adding properties to your favorites to easily compare them later',
                  es: 'Comienza a agregar propiedades a tus favoritos para compararlas fácilmente más tarde'
                })}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {favorites.map((property) => {
                const title = locale === 'es' ? property.title_es : property.title_en
                const areaTitle = property.area
                  ? (locale === 'es' ? property.area.title_es : property.area.title_en)
                  : ''

                return (
                  <div
                    key={property._id}
                    className="bg-white border border-stone-200 rounded-lg overflow-hidden hover:border-stone-300 transition-all group"
                  >
                    <div className="flex gap-3 p-3">
                      {/* Image */}
                      <Link
                        href={`/property/${property.slug}`}
                        className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100"
                      >
                        {property.mainImage && (
                          <Image
                            src={urlFor(property.mainImage).width(200).height(200).url()}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="96px"
                          />
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/property/${property.slug}`}>
                          <h3 className="font-light text-sm text-stone-900 line-clamp-2 group-hover:text-stone-700 transition-colors mb-1">
                            {title}
                          </h3>
                        </Link>

                        {areaTitle && (
                          <div className="flex items-center gap-1 text-xs text-stone-500 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{areaTitle}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-stone-600">
                          <div className="flex items-center gap-1">
                            <Bed className="w-3 h-3" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-3 h-3" />
                            <span>{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{property.maxGuests}</span>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFavorite(property._id)}
                        className="flex-shrink-0 p-2 h-fit hover:bg-stone-100 rounded-lg transition-colors"
                        aria-label="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4 text-stone-400 hover:text-rose-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {favorites.length > 0 && (
          <div className="border-t border-stone-200 p-4 space-y-3 bg-stone-50">
            <div className="flex gap-2">
              <Link
                href="/favorites"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 text-stone-800 rounded-lg hover:bg-stone-200 border border-stone-200 transition-all duration-200 font-light text-sm"
                onClick={onClose}
              >
                <Heart className="w-4 h-4" />
                {t({ en: 'View All', es: 'Ver Todos' })}
              </Link>
              <button
                onClick={() => setShowInquiryForm(!showInquiryForm)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-all duration-200 font-light text-sm"
              >
                <Send className="w-4 h-4" />
                {t({ en: 'Inquire', es: 'Consultar' })}
              </button>
            </div>

            <button
              onClick={clearFavorites}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-stone-600 hover:text-rose-600 transition-colors text-sm font-light"
            >
              <Trash2 className="w-4 h-4" />
              {t({ en: 'Clear all favorites', es: 'Borrar todos los favoritos' })}
            </button>
          </div>
        )}

        {/* Inquiry Form (shown when button clicked) */}
        {showInquiryForm && favorites.length > 0 && (
          <BulkInquiryForm
            favorites={favorites}
            locale={locale}
            onClose={() => setShowInquiryForm(false)}
            t={t}
          />
        )}
      </div>
    </>,
    document.body
  )
}

interface BulkInquiryFormProps {
  favorites: any[]
  locale: 'en' | 'es'
  onClose: () => void
  t: (translations: { en: string; es: string }) => string
}

function BulkInquiryForm({ favorites, locale, onClose, t }: BulkInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [copied, setCopied] = useState(false)
  const [touched, setTouched] = useState({
    name: false,
    email: false
  })

  const handleWhatsApp = () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      setTouched({ name: true, email: true })
      return
    }

    const propertyList = favorites
      .map((prop, index) => {
        const title = locale === 'es' ? prop.title_es : prop.title_en
        const url = `${window.location.origin}/property/${prop.slug}`
        return `${index + 1}. ${title}\n   ${url}`
      })
      .join('\n\n')

    const greeting = t({
      en: 'Hello! My name is',
      es: 'Hola! Mi nombre es'
    })

    const contactInfo = formData.email
      ? `${greeting} ${formData.name}\n${t({ en: 'Email:', es: 'Correo:' })} ${formData.email}\n\n`
      : `${greeting} ${formData.name}\n\n`

    const propertyIntro = t({
      en: 'I am interested in the following properties:',
      es: 'Estoy interesado en las siguientes propiedades:'
    })

    const message = encodeURIComponent(
      `${contactInfo}${propertyIntro}\n\n${propertyList}\n\n${formData.message ? `${t({ en: 'Additional comments:', es: 'Comentarios adicionales:' })}\n${formData.message}` : ''}`
    )

    // Replace with your WhatsApp business number
    const whatsappNumber = '18095551234' // TODO: Update with actual number
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  const handleEmail = () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      setTouched({ name: true, email: true })
      return
    }

    const propertyList = favorites
      .map((prop, index) => {
        const title = locale === 'es' ? prop.title_es : prop.title_en
        const url = `${window.location.origin}/property/${prop.slug}`
        return `${index + 1}. ${title}\n   ${url}`
      })
      .join('\n\n')

    const subject = encodeURIComponent(
      t({ en: 'Property Inquiry - Multiple Properties', es: 'Consulta de Propiedades - Múltiples Propiedades' })
    )

    const body = encodeURIComponent(
      `${t({ en: 'Name:', es: 'Nombre:' })} ${formData.name}\n${t({ en: 'Email:', es: 'Correo:' })} ${formData.email}\n${t({ en: 'Phone:', es: 'Teléfono:' })} ${formData.phone}\n\n${t({ en: 'I am interested in the following properties:', es: 'Estoy interesado en las siguientes propiedades:' })}\n\n${propertyList}\n\n${formData.message ? `${t({ en: 'Additional comments:', es: 'Comentarios adicionales:' })}\n${formData.message}` : ''}`
    )

    // Replace with your business email
    const email = 'info@lcsrealestate.com' // TODO: Update with actual email
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  const handleCopyToClipboard = async () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      setTouched({ name: true, email: true })
      return
    }

    const propertyList = favorites
      .map((prop, index) => {
        const title = locale === 'es' ? prop.title_es : prop.title_en
        const url = `${window.location.origin}/property/${prop.slug}`
        return `${index + 1}. ${title}\n   ${url}`
      })
      .join('\n\n')

    const greeting = t({
      en: 'Hello! My name is',
      es: 'Hola! Mi nombre es'
    })

    const contactInfo = `${greeting} ${formData.name}\n${t({ en: 'Email:', es: 'Correo:' })} ${formData.email}\n${formData.phone ? `${t({ en: 'Phone:', es: 'Teléfono:' })} ${formData.phone}\n` : ''}\n`

    const propertyIntro = t({
      en: 'I am interested in the following properties:',
      es: 'Estoy interesado en las siguientes propiedades:'
    })

    const fullMessage = `${contactInfo}${propertyIntro}\n\n${propertyList}\n\n${formData.message ? `${t({ en: 'Additional comments:', es: 'Comentarios adicionales:' })}\n${formData.message}` : ''}`

    try {
      await navigator.clipboard.writeText(fullMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="absolute inset-0 bg-white z-10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-stone-200">
        <h3 className="text-lg font-light text-stone-900">
          {t({ en: 'Send Inquiry', es: 'Enviar Consulta' })}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-stone-600" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <p className="text-sm text-stone-600">
          {t({
            en: `You have selected ${favorites.length} ${favorites.length === 1 ? 'property' : 'properties'}. Please provide your contact information.`,
            es: `Has seleccionado ${favorites.length} ${favorites.length === 1 ? 'propiedad' : 'propiedades'}. Por favor proporciona tu información de contacto.`
          })}
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-light text-stone-700 mb-1">
              {t({ en: 'Name', es: 'Nombre' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (touched.name) setTouched({ ...touched, name: false })
              }}
              onBlur={() => setTouched({ ...touched, name: true })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm ${
                touched.name && !formData.name ? 'border-red-500' : 'border-stone-200'
              }`}
              required
            />
            {touched.name && !formData.name && (
              <p className="text-red-500 text-xs mt-1">
                {t({ en: 'Name is required', es: 'El nombre es requerido' })}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-1">
              {t({ en: 'Email', es: 'Correo Electrónico' })} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (touched.email) setTouched({ ...touched, email: false })
              }}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm ${
                touched.email && !formData.email ? 'border-red-500' : 'border-stone-200'
              }`}
              required
            />
            {touched.email && !formData.email && (
              <p className="text-red-500 text-xs mt-1">
                {t({ en: 'Email is required', es: 'El correo es requerido' })}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-1">
              {t({ en: 'Phone', es: 'Teléfono' })}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-stone-700 mb-1">
              {t({ en: 'Message (optional)', es: 'Mensaje (opcional)' })}
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm resize-none"
            />
          </div>
        </div>

        {/* Selected Properties Preview */}
        <div className="pt-4 border-t border-stone-200">
          <h4 className="text-sm font-light text-stone-700 mb-2">
            {t({ en: 'Selected Properties:', es: 'Propiedades Seleccionadas:' })}
          </h4>
          <ul className="space-y-1 text-sm text-stone-600">
            {favorites.map((prop, index) => {
              const title = locale === 'es' ? prop.title_es : prop.title_en
              return (
                <li key={prop._id} className="flex items-start gap-2">
                  <span className="text-stone-400">{index + 1}.</span>
                  <span className="line-clamp-1">{title}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-stone-200 p-4 space-y-3 bg-stone-50">
        <div className="flex gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-light text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-all duration-200 font-light text-sm"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-stone-50 px-2 text-stone-500">
              {t({ en: 'or share another way', es: 'o comparte de otra forma' })}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopyToClipboard}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-50 transition-all duration-200 font-light text-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              {t({ en: 'Copied!', es: '¡Copiado!' })}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              {t({ en: 'Copy Information', es: 'Copiar Información' })}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
