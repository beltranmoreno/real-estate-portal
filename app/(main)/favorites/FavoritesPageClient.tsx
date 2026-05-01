'use client'

import React, { useState } from 'react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useLocale } from '@/contexts/LocaleContext'
import PropertyCard from '@/components/PropertyCard'
import { Heart, Trash2, Send, MessageCircle, Mail, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FavoritesPageClient() {
  const { favorites, clearFavorites, favoritesCount } = useFavorites()
  const { locale, t } = useLocale()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    // All fields below are optional — they help the agent triage the
    // inquiry but the form should still send with just name + email.
    checkIn: '',
    checkOut: '',
    guests: '',
    bedrooms: '',
    nationality: '',
    budget: '',
  })
  const [copied, setCopied] = useState(false)
  const [touched, setTouched] = useState({
    name: false,
    email: false
  })

  /**
   * Build a single multi-line inquiry message that all three send paths
   * (WhatsApp / email body / clipboard) share. Optional fields are only
   * included when the user filled them in, so the message stays clean.
   */
  const buildInquiryBody = () => {
    const propertyList = favorites
      .map((prop, index) => {
        const title = locale === 'es' ? prop.title_es : prop.title_en
        const url = `${window.location.origin}/property/${prop.slug}`
        return `${index + 1}. ${title}\n   ${url}`
      })
      .join('\n\n')

    const greeting = t({ en: 'Hello! My name is', es: 'Hola! Mi nombre es' })
    const propertyIntro = t({
      en: 'I am interested in the following properties:',
      es: 'Estoy interesado en las siguientes propiedades:',
    })

    const contactLines: string[] = [`${greeting} ${formData.name}`]
    if (formData.email) {
      contactLines.push(`${t({ en: 'Email:', es: 'Correo:' })} ${formData.email}`)
    }
    if (formData.phone) {
      contactLines.push(`${t({ en: 'Phone:', es: 'Teléfono:' })} ${formData.phone}`)
    }

    // Optional inquiry details — only rendered when filled.
    const detailLines: string[] = []
    if (formData.checkIn || formData.checkOut) {
      const dates = [formData.checkIn, formData.checkOut].filter(Boolean).join(' → ')
      detailLines.push(`${t({ en: 'Dates:', es: 'Fechas:' })} ${dates}`)
    }
    if (formData.guests) {
      detailLines.push(`${t({ en: 'Guests:', es: 'Huéspedes:' })} ${formData.guests}`)
    }
    if (formData.bedrooms) {
      detailLines.push(`${t({ en: 'Bedrooms needed:', es: 'Habitaciones necesarias:' })} ${formData.bedrooms}`)
    }
    if (formData.nationality) {
      detailLines.push(`${t({ en: 'Nationality:', es: 'Nacionalidad:' })} ${formData.nationality}`)
    }
    if (formData.budget) {
      detailLines.push(`${t({ en: 'Budget:', es: 'Presupuesto:' })} ${formData.budget}`)
    }

    const sections = [
      contactLines.join('\n'),
      `${propertyIntro}\n\n${propertyList}`,
    ]
    if (detailLines.length > 0) {
      sections.push(
        `${t({ en: 'Trip details:', es: 'Detalles del viaje:' })}\n${detailLines.join('\n')}`
      )
    }
    if (formData.message) {
      sections.push(
        `${t({ en: 'Additional comments:', es: 'Comentarios adicionales:' })}\n${formData.message}`
      )
    }

    return sections.join('\n\n')
  }

  const handleWhatsApp = () => {
    if (!formData.name || !formData.email) {
      setTouched({ name: true, email: true })
      return
    }
    const message = encodeURIComponent(buildInquiryBody())
    const whatsappNumber = '+18293422566' // TODO: Update with actual number
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  const handleEmail = () => {
    if (!formData.name || !formData.email) {
      setTouched({ name: true, email: true })
      return
    }
    const subject = encodeURIComponent(
      t({ en: 'Property Inquiry - Multiple Properties', es: 'Consulta de Propiedades - Múltiples Propiedades' })
    )
    const body = encodeURIComponent(buildInquiryBody())
    const email = 'leticiacoudrayrealestate@gmail.com' // TODO: Update with actual email
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  const handleCopyToClipboard = async () => {
    if (!formData.name || !formData.email) {
      setTouched({ name: true, email: true })
      return
    }
    try {
      await navigator.clipboard.writeText(buildInquiryBody())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-light text-stone-900">
                  {t({ en: 'My Favorites', es: 'Mis Favoritos' })}
                </h1>
                <p className="text-sm text-stone-600 mt-1">
                  {favoritesCount > 0
                    ? t({
                        en: `${favoritesCount} ${favoritesCount === 1 ? 'property' : 'properties'} saved`,
                        es: `${favoritesCount} ${favoritesCount === 1 ? 'propiedad' : 'propiedades'} guardadas`
                      })
                    : t({ en: 'No properties saved yet', es: 'No hay propiedades guardadas aún' })
                  }
                </p>
              </div>
            </div>

            {favorites.length > 0 && (
              <Button
                variant="outline"
                onClick={clearFavorites}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t({ en: 'Clear All', es: 'Borrar Todo' })}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="w-24 h-24 text-stone-300 mb-6" />
            <h2 className="text-2xl font-light text-stone-900 mb-2">
              {t({ en: 'No favorites yet', es: 'No hay favoritos aún' })}
            </h2>
            <p className="text-stone-600 max-w-md mb-6">
              {t({
                en: 'Start adding properties to your favorites to easily compare and inquire about them later',
                es: 'Comienza a agregar propiedades a tus favoritos para compararlas y consultar sobre ellas más tarde'
              })}
            </p>
            <Link href="/search">
              <Button>
                {t({ en: 'Browse Properties', es: 'Ver Propiedades' })}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Properties Grid - Left Side (2/3) */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    locale={locale}
                  />
                ))}
              </div>
            </div>

            {/* Inquiry Form - Right Side (1/3) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xs border border-stone-200 p-6 sticky top-24">
                <h2 className="text-xl font-light text-stone-900 mb-4">
                  {t({ en: 'Send Inquiry', es: 'Enviar Consulta' })}
                </h2>

                <p className="text-sm text-stone-600 mb-6">
                  {t({
                    en: `Interested in ${favoritesCount} ${favoritesCount === 1 ? 'property' : 'properties'}? Send us your contact information.`,
                    es: `¿Interesado en ${favoritesCount} ${favoritesCount === 1 ? 'propiedad' : 'propiedades'}? Envíanos tu información de contacto.`
                  })}
                </p>

                <div className="space-y-4">
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

                  {/* Optional trip details — collapsed under a small header
                      so the form doesn't feel overwhelming. All fields here
                      are passed through to the inquiry message only when filled. */}
                  <details className="pt-2 group">
                    <summary className="text-sm font-light text-stone-700 cursor-pointer select-none flex items-center justify-between">
                      <span>
                        {t({
                          en: 'Trip details (optional)',
                          es: 'Detalles del viaje (opcional)',
                        })}
                      </span>
                      <span className="text-xs text-stone-500 group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-light text-stone-600 mb-1">
                            {t({ en: 'Check-in', es: 'Llegada' })}
                          </label>
                          <input
                            type="date"
                            value={formData.checkIn}
                            onChange={(e) =>
                              setFormData({ ...formData, checkIn: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-light text-stone-600 mb-1">
                            {t({ en: 'Check-out', es: 'Salida' })}
                          </label>
                          <input
                            type="date"
                            value={formData.checkOut}
                            onChange={(e) =>
                              setFormData({ ...formData, checkOut: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-light text-stone-600 mb-1">
                            {t({ en: 'Guests', es: 'Huéspedes' })}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={formData.guests}
                            onChange={(e) =>
                              setFormData({ ...formData, guests: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-light text-stone-600 mb-1">
                            {t({ en: 'Bedrooms', es: 'Habitaciones' })}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={formData.bedrooms}
                            onChange={(e) =>
                              setFormData({ ...formData, bedrooms: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-light text-stone-600 mb-1">
                          {t({ en: 'Nationality', es: 'Nacionalidad' })}
                        </label>
                        <input
                          type="text"
                          value={formData.nationality}
                          onChange={(e) =>
                            setFormData({ ...formData, nationality: e.target.value })
                          }
                          placeholder={t({ en: 'e.g. American', es: 'ej. Dominicana' })}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-light text-stone-600 mb-1">
                          {t({ en: 'Budget', es: 'Presupuesto' })}
                        </label>
                        <input
                          type="text"
                          value={formData.budget}
                          onChange={(e) =>
                            setFormData({ ...formData, budget: e.target.value })
                          }
                          placeholder={t({
                            en: 'e.g. $5,000 / night',
                            es: 'ej. USD 5,000 por noche',
                          })}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
                        />
                      </div>
                    </div>
                  </details>

                  <div>
                    <label className="block text-sm font-light text-stone-700 mb-1">
                      {t({ en: 'Message (optional)', es: 'Mensaje (opcional)' })}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm resize-none"
                    />
                  </div>

                  {/* Selected Properties Preview */}
                  <div className="pt-4 border-t border-stone-200">
                    <h4 className="text-sm font-light text-stone-700 mb-2">
                      {t({ en: 'Selected Properties:', es: 'Propiedades Seleccionadas:' })}
                    </h4>
                    <div className="max-h-32 overflow-y-auto">
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

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleWhatsApp}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-light text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </button>
                      <button
                        onClick={handleEmail}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-all duration-200 font-light text-sm"
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
                        <span className="bg-white px-2 text-stone-500">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
