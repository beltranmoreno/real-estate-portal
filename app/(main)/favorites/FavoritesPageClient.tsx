'use client'

import React, { useState } from 'react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useLocale } from '@/contexts/LocaleContext'
import PropertyCard from '@/components/PropertyCard'
import { Heart, Trash2, Send, MessageCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FavoritesPageClient() {
  const { favorites, clearFavorites, favoritesCount } = useFavorites()
  const { locale, t } = useLocale()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleWhatsApp = () => {
    const propertyList = favorites
      .map((prop, index) => {
        const title = locale === 'es' ? prop.title_es : prop.title_en
        return `${index + 1}. ${title}`
      })
      .join('\n')

    const message = encodeURIComponent(
      `${t({ en: 'Hello! I am interested in the following properties:', es: 'Hola! Estoy interesado en las siguientes propiedades:' })}\n\n${propertyList}\n\n${formData.message ? `${t({ en: 'Additional comments:', es: 'Comentarios adicionales:' })} ${formData.message}` : ''}`
    )

    const whatsappNumber = '18095551234' // TODO: Update with actual number
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  const handleEmail = () => {
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

    const email = 'info@lcsrealestate.com' // TODO: Update with actual email
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
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
                      {t({ en: 'Name', es: 'Nombre' })} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light text-stone-700 mb-1">
                      {t({ en: 'Email', es: 'Correo Electrónico' })} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-800 text-sm"
                      required
                    />
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
                  <div className="space-y-2 pt-4">
                    <button
                      onClick={handleWhatsApp}
                      disabled={!formData.name || !formData.email}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-200 font-light text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t({ en: 'Send via WhatsApp', es: 'Enviar por WhatsApp' })}
                    </button>
                    <button
                      onClick={handleEmail}
                      disabled={!formData.name || !formData.email}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 disabled:bg-stone-300 disabled:cursor-not-allowed transition-all duration-200 font-light text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      {t({ en: 'Send via Email', es: 'Enviar por Correo' })}
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
