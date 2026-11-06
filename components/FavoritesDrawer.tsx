'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import {
  X,
  Trash2,
  Heart,
  Send,
} from 'lucide-react'
import InquiryForm from '@/components/InquiryForm'

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

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-[100dvh] w-full md:w-[480px] bg-surface z-[101] shadow-panel flex flex-col"
          >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-line">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl text-ink">
              {t({ en: 'My Favorites', es: 'Mis Favoritos' })}
              {favoritesCount > 0 && (
                <span className="ml-2 text-sm text-muted-2">({favoritesCount})</span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sand rounded-none transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Heart className="w-12 h-12 text-faint mb-5" strokeWidth={1} />
              <h3 className="font-serif text-lg text-ink mb-2">
                {t({ en: 'No favorites yet', es: 'No hay favoritos aún' })}
              </h3>
              <p className="text-sm text-muted-2 font-light max-w-sm leading-relaxed">
                {t({
                  en: 'Start adding properties to your favorites to easily compare them later',
                  es: 'Comienza a agregar propiedades a tus favoritos para compararlas fácilmente más tarde'
                })}
              </p>
            </div>
          ) : (
            <div className="px-6 py-2">
              <ul className="divide-y divide-line">
              {favorites.map((property, index) => {
                const title = locale === 'es' ? property.title_es : property.title_en
                const areaTitle = property.area
                  ? (locale === 'es' ? property.area.title_es : property.area.title_en)
                  : ''
                const n = (v: number | null | undefined, en: [string, string], es: [string, string]) =>
                  v ? `${v} ${(locale === 'es' ? es : en)[v === 1 ? 0 : 1]}` : null
                const specs = [
                  n(property.bedrooms, ['bedroom', 'bedrooms'], ['habitación', 'habitaciones']),
                  n(property.bathrooms, ['bath', 'baths'], ['baño', 'baños']),
                  n(property.maxGuests, ['guest', 'guests'], ['huésped', 'huéspedes']),
                ].filter(Boolean).join(' · ')
                const href = `/property/${property.slug}`

                return (
                  <motion.li
                    key={property._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-4 py-4 group"
                  >
                    {/* Square photo, matching the property cards. No hover zoom. */}
                    <Link
                      href={href}
                      onClick={onClose}
                      className="relative w-28 h-28 shrink-0 overflow-hidden bg-sand"
                      tabIndex={-1}
                      aria-hidden
                    >
                      {property.mainImage?.asset && (
                        <Image
                          src={urlFor(property.mainImage).width(320).height(320).url()}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 pr-8 flex flex-col justify-center gap-1">
                      {areaTitle && <span className="eyebrow !tracking-[0.16em]">{areaTitle}</span>}
                      <Link href={href} onClick={onClose} className="block">
                        <h3 className="font-serif text-[19px] leading-tight text-ink line-clamp-2 underline-offset-4 decoration-1 group-hover:underline">
                          {title}
                        </h3>
                      </Link>
                      {specs && <p className="text-[13px] font-light text-muted mt-0.5">{specs}</p>}
                    </div>

                    {/* Filled heart = saved; tap to remove. */}
                    <button
                      type="button"
                      onClick={() => removeFavorite(property._id)}
                      className="absolute top-4 right-0 p-1.5 text-ink hover:text-status-attention transition-colors"
                      aria-label={t({ en: `Remove ${title} from favorites`, es: `Quitar ${title} de favoritos` })}
                      title={t({ en: 'Remove from favorites', es: 'Quitar de favoritos' })}
                    >
                      <Heart className="w-[18px] h-[18px] fill-current" />
                    </button>
                  </motion.li>
                )
              })}
              </ul>

              {/* Clear all — sits at the end of the list, not the footer */}
              <button
                onClick={clearFavorites}
                className="w-full flex items-center justify-center gap-2 py-5 border-t border-line text-sm font-light text-muted hover:text-status-attention transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t({ en: 'Clear all favorites', es: 'Borrar todos los favoritos' })}
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {favorites.length > 0 && (
          <div className="border-t border-line p-4 bg-canvas">
            <div className="flex gap-2">
              <Link
                href="/favorites"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-control-border bg-surface text-ink text-xs font-medium uppercase tracking-[0.14em] rounded-[2px] hover:border-ink transition-colors"
                onClick={onClose}
              >
                <Heart className="w-4 h-4" />
                {t({ en: 'View all', es: 'Ver todos' })}
              </Link>
              <button
                onClick={() => setShowInquiryForm(!showInquiryForm)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-ink text-surface text-xs font-medium uppercase tracking-[0.14em] rounded-[2px] hover:bg-brand transition-colors"
              >
                <Send className="w-4 h-4" />
                {t({ en: 'Inquire', es: 'Consultar' })}
              </button>
            </div>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>,
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
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-surface z-10 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-line">
        <h3 className="font-serif text-lg text-ink">
          {t({ en: 'Send us your list', es: 'Envíanos tu lista' })}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-sand rounded-none transition-colors"
        >
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <InquiryForm
          source="FAVORITES"
          properties={favorites.map((prop) => ({
            _id: prop._id,
            title: (locale === 'es' ? prop.title_es : prop.title_en) || prop.title_en || prop.title_es,
          }))}
        />
      </div>
    </motion.div>
  )
}
