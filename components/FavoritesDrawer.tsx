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
            <Heart className="w-5 h-5 text-ink fill-ink" />
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
            <div className="p-4 space-y-4">
              {favorites.map((property, index) => {
                const title = locale === 'es' ? property.title_es : property.title_en
                const areaTitle = property.area
                  ? (locale === 'es' ? property.area.title_es : property.area.title_en)
                  : ''

                return (
                  <motion.div
                    key={property._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-surface border border-line rounded-none overflow-hidden hover:border-ink transition-colors group"
                  >
                    <div className="flex gap-3 p-3">
                      {/* Image */}
                      <Link
                        href={`/property/${property.slug}`}
                        className="relative w-24 h-24 flex-shrink-0 rounded-none overflow-hidden bg-sand"
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
                          <h3 className="font-light text-sm text-ink line-clamp-2 group-hover:text-body-strong transition-colors mb-1">
                            {title}
                          </h3>
                        </Link>

                        {areaTitle && (
                          <div className="flex items-center gap-1 text-xs text-muted-2 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{areaTitle}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted">
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
                        className="flex-shrink-0 p-2 h-fit hover:bg-sand rounded-none transition-colors"
                        aria-label="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4 text-faint hover:text-status-attention transition-colors" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}

              {/* Clear all — sits at the end of the list, not the footer */}
              <button
                onClick={clearFavorites}
                className="w-full flex items-center justify-center gap-2 pt-4 mt-2 border-t border-line text-sm font-light text-muted hover:text-status-attention transition-colors"
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
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-surface z-10 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-line">
        <h3 className="font-serif text-lg text-ink">
          {t({ en: 'Send Inquiry', es: 'Enviar Consulta' })}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-sand rounded-none transition-colors"
        >
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <p className="text-sm text-muted">
          {t({
            en: `You have selected ${favorites.length} ${favorites.length === 1 ? 'property' : 'properties'}. Please provide your contact information.`,
            es: `Has seleccionado ${favorites.length} ${favorites.length === 1 ? 'propiedad' : 'propiedades'}. Por favor proporciona tu información de contacto.`
          })}
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-light text-body-strong mb-1">
              {t({ en: 'Name', es: 'Nombre' })} <span className="text-status-attention">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (touched.name) setTouched({ ...touched, name: false })
              }}
              onBlur={() => setTouched({ ...touched, name: true })}
              className={`w-full px-3 py-2 border rounded-[2px] focus:outline-none focus:ring-2 focus:ring-ring text-sm ${
                touched.name && !formData.name ? 'border-status-attention' : 'border-line'
              }`}
              required
            />
            {touched.name && !formData.name && (
              <p className="text-status-attention text-xs mt-1">
                {t({ en: 'Name is required', es: 'El nombre es requerido' })}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-light text-body-strong mb-1">
              {t({ en: 'Email', es: 'Correo Electrónico' })} <span className="text-status-attention">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (touched.email) setTouched({ ...touched, email: false })
              }}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full px-3 py-2 border rounded-[2px] focus:outline-none focus:ring-2 focus:ring-ring text-sm ${
                touched.email && !formData.email ? 'border-status-attention' : 'border-line'
              }`}
              required
            />
            {touched.email && !formData.email && (
              <p className="text-status-attention text-xs mt-1">
                {t({ en: 'Email is required', es: 'El correo es requerido' })}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-light text-body-strong mb-1">
              {t({ en: 'Phone', es: 'Teléfono' })}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-line rounded-[2px] focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-body-strong mb-1">
              {t({ en: 'Message (optional)', es: 'Mensaje (opcional)' })}
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-line rounded-[2px] focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
            />
          </div>
        </div>

        {/* Selected Properties Preview */}
        <div className="pt-4 border-t border-line">
          <h4 className="text-sm font-light text-body-strong mb-2">
            {t({ en: 'Selected Properties:', es: 'Propiedades Seleccionadas:' })}
          </h4>
          <ul className="space-y-1 text-sm text-muted">
            {favorites.map((prop, index) => {
              const title = locale === 'es' ? prop.title_es : prop.title_en
              return (
                <li key={prop._id} className="flex items-start gap-2">
                  <span className="text-faint">{index + 1}.</span>
                  <span className="line-clamp-1">{title}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-line p-4 space-y-3 bg-canvas">
        <div className="flex gap-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand text-surface text-xs font-medium uppercase tracking-[0.14em] rounded-[2px] hover:bg-brand-deep transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={handleEmail}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-ink text-surface text-xs font-medium uppercase tracking-[0.14em] rounded-[2px] hover:bg-brand transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-canvas px-2 text-muted-2">
              {t({ en: 'or share another way', es: 'o comparte de otra forma' })}
            </span>
          </div>
        </div>

        <button
          onClick={handleCopyToClipboard}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface text-body-strong border border-control-border rounded-[2px] hover:border-ink transition-colors text-sm font-light"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-status-confirmed" />
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
    </motion.div>
  )
}
