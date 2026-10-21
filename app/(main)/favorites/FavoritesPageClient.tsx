'use client'

import React from 'react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useLocale } from '@/contexts/LocaleContext'
import PropertyCard from '@/components/PropertyCard'
import { Heart, Trash2, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import InquiryForm from '@/components/InquiryForm'

export default function FavoritesPageClient() {
  const { favorites, clearFavorites, favoritesCount } = useFavorites()
  const { locale, t } = useLocale()

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header — title styled like the /search results title */}
        <div className="container mx-auto px-4 py-4">
          <h1 className="font-title text-3xl text-ink">
            {t({ en: 'My Favorites', es: 'Mis Favoritos' })}
          </h1>
          <p className="text-muted-2 mt-1 text-sm font-light">
            {favoritesCount > 0
              ? t({
                  en: `${favoritesCount} ${favoritesCount === 1 ? 'property' : 'properties'} saved`,
                  es: `${favoritesCount} ${favoritesCount === 1 ? 'propiedad' : 'propiedades'} guardadas`
                })
              : t({ en: 'No properties saved yet', es: 'No hay propiedades guardadas aún' })
            }
          </p>
        </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="w-14 h-14 text-faint mb-6" strokeWidth={1} />
            <h2 className="font-display text-2xl text-ink mb-2">
              {t({ en: 'No favorites yet', es: 'No hay favoritos aún' })}
            </h2>
            <p className="text-muted font-light max-w-md mb-7 leading-relaxed">
              {t({
                en: 'Start adding properties to your favorites to easily compare and inquire about them later',
                es: 'Comienza a agregar propiedades a tus favoritos para compararlas y consultar sobre ellas más tarde'
              })}
            </p>
            <Button asChild>
              <Link href="/search">
                {t({ en: 'Browse residences', es: 'Ver residencias' })}
              </Link>
            </Button>
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

              {/* Clear all — under all of the saved favorites */}
              <button
                onClick={clearFavorites}
                className="mt-10 pt-6 border-t border-line w-full flex items-center justify-center gap-2 text-sm font-light text-muted hover:text-status-attention transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t({ en: 'Clear all favorites', es: 'Borrar todos los favoritos' })}
              </button>
            </div>

            {/* Inquiry Form - Right Side (1/3) */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-none border border-line p-6 sticky top-24">
                <h2 className="font-serif text-xl text-ink mb-4">
                  {t({ en: 'Send us your list', es: 'Envíanos tu lista' })}
                </h2>

                <p className="text-sm text-muted font-light mb-6">
                  {t({
                    en: `Interested in ${favoritesCount} ${favoritesCount === 1 ? 'property' : 'properties'}? We’ll put together the details for you.`,
                    es: `¿Interesado en ${favoritesCount} ${favoritesCount === 1 ? 'propiedad' : 'propiedades'}? Te prepararemos los detalles.`
                  })}
                </p>

                <InquiryForm
                  source="FAVORITES"
                  hideProperties
                  properties={favorites.map((prop) => ({
                    _id: prop._id,
                    title: (locale === 'es' ? prop.title_es : prop.title_en) || prop.title_en || prop.title_es,
                  }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
