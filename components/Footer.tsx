'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import Image from 'next/image'
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { InstagramIcon } from './icons/InstagramIcon'
import { Button } from './ui/button'

const LOGO_URL = '/Logo_LCS_Real_Estate.png'
export default function Footer() {
  const { locale, t } = useLocale()
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to subscribe')
      }

      setSubmitStatus('success')
      setEmail('')

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('Error subscribing to newsletter:', error)
      setSubmitStatus('error')

      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const quickLinks = [
    {
      href: '/search?listingType=rental',
      label: t({ en: 'Vacation Rentals', es: 'Alquileres Vacacionales' })
    },
    {
      href: '/search?listingType=sale',
      label: t({ en: 'Properties for Sale', es: 'Propiedades en Venta' })
    },
    {
      href: '/search?themes=luxury',
      label: t({ en: 'Luxury Properties', es: 'Propiedades de Lujo' })
    },
    {
      href: '/search?themes=beachfront',
      label: t({ en: 'Beachfront', es: 'Frente al Mar' })
    }
  ]

  const infoPages = [
    {
      name: t({ en: 'Beaches', es: 'Playas' }),
      href: '/info/beaches'
    },
    {
      name: t({ en: 'Nightlife', es: 'Vida Nocturna' }),
      href: '/info/nightlife'
    },
    {
      name: t({ en: 'Local Tips', es: 'Consejos Locales' }),
      href: '/info/local-tips'
    },
    {
      name: t({ en: 'Activities', es: 'Actividades' }),
      href: '/info/activities'
    },
    {
      name: t({ en: 'Yacht Charters', es: 'Alquiler de Yates' }),
      href: '/info/yacht-charters'
    },
    {
      name: t({ en: 'Golf Cart Rental', es: 'Alquiler de Carritos' }),
      href: '/services/concierge/golf-cart-rental'
    }
  ]

  const resortAmenities = [
    {
      name: t({ en: 'Restaurants', es: 'Restaurantes' }),
      href: '/restaurants'
    },
    {
      name: t({ en: 'Golf Courses', es: 'Campos de Golf' }),
      href: '/courses'
    },
    {
      name: t({ en: 'Marina', es: 'Marina' }),
      href: '/info/yacht-charters'
    },
    {
      name: t({ en: 'Beaches', es: 'Playas' }),
      href: '/info/beaches'
    }
  ]

  const legalLinks = [
    {
      href: '/privacy',
      label: t({ en: 'Privacy Policy', es: 'Política de Privacidad' })
    },
    {
      href: '/terms',
      label: t({ en: 'Terms of Service', es: 'Términos de Servicio' })
    },
    {
      href: '/cookies',
      label: t({ en: 'Cookie Policy', es: 'Política de Cookies' })
    },
    // Discreet portal entry for returning guests who land on the
    // marketing site instead of their bookmark / magic-link email.
    {
      href: '/portal/sign-in',
      label: t({ en: 'Guest portal', es: 'Portal de huéspedes' })
    }
  ]

  const socialLinks = [
    { icon: InstagramIcon, href: 'https://instagram.com/leticiacoudrayrealestate', label: 'Instagram' },
  ]

  return (
    <footer className="bg-canvas text-body-strong">
      {/* Newsletter Section */}
      <section className="border-t border-line">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-title text-3xl md:text-4xl text-ink mb-4">
              {t({ en: 'Stay in Paradise', es: 'Quédate en el Paraíso' })}
            </h2>
            <p className="text-lg text-muted mb-8 font-light">
              {t({
                en: 'Subscribe for exclusive property listings and resort updates',
                es: 'Suscríbete para listados exclusivos y actualizaciones del resort'
              })}
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t({ en: 'Enter your email', es: 'Ingresa tu correo' })}
                className="flex-1 px-6 py-2 bg-surface border border-control-border rounded-[2px] text-ink placeholder-faint focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                required
                disabled={isSubmitting}
              />
              <Button type="submit" className="" size="lg" disabled={isSubmitting}>
                {isSubmitting
                  ? t({ en: 'Subscribing...', es: 'Suscribiendo...' })
                  : t({ en: 'Subscribe', es: 'Suscribir' })
                }
              </Button>
            </form>

            {/* Success/Error Messages */}
            {submitStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-[2px] flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>
                  {t({
                    en: 'Successfully subscribed! Check your email.',
                    es: '¡Suscrito exitosamente! Revisa tu correo.'
                  })}
                </span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-[2px] flex items-center justify-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>
                  {t({
                    en: 'Failed to subscribe. Please try again.',
                    es: 'Error al suscribirse. Inténtalo de nuevo.'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center w-full gap-3 mb-6 pb-6 border-b border-line">
          <Image
            src={LOGO_URL}
            alt="Leticia Coudray - Real Estate & Services"
            width={256}
            height={256}
            className="w-auto h-24 mx-auto"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>

              <p className="text-muted leading-relaxed font-light max-w-sm">
                {t({
                  en: "Experience unparalleled luxury in the Caribbean's most exclusive resort community. Your paradise awaits.",
                  es: "Experimenta el lujo incomparable en la comunidad resort más exclusiva del Caribe. Tu paraíso te espera."
                })}
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="eyebrow">
                {t({ en: 'Contact', es: 'Contacto' })}
              </h4>
              <div className="space-y-3">
                <a href="tel:+18293422566" className="flex items-center gap-3 text-muted hover:text-ink transition-colors group">
                  <div className="shrink-0">
                    <Phone className="w-4 h-4 text-muted" />
                  </div>
                  <span className="font-light">+1 (829) 342-2566</span>
                </a>
                <a href="mailto:info@casadecampo.com.do" className="flex items-center gap-3 text-muted hover:text-ink transition-colors group">
                  <div className="shrink-0">
                    <Mail className="w-4 h-4 text-muted" />
                  </div>
                  <span className="font-light">leticiacoudrayrealestate@gmail.com</span>
                </a>
                <a href="https://instagram.com/leticiacoudrayrealestate" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-muted hover:text-ink transition-colors group">
                  <div className="shrink-0">
                    <InstagramIcon className="w-4 h-4 text-muted" />
                  </div>
                  <span className="font-light">@leticiacoudrayrealestate</span>
                </a>
                <div className="flex items-start gap-3 text-muted">
                  <div className="shrink-0">
                    <MapPin className="w-4 h-4 text-muted" />
                  </div>
                  <span className="font-light">
                    Casa de Campo, La Romana 22000<br />
                    {t({
                      en: 'Dominican Republic',
                      es: 'República Dominicana'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Properties */}
          <div>
            <h4 className="eyebrow mb-6">
              {t({ en: 'Properties', es: 'Propiedades' })}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-ink transition-colors font-light inline-flex items-center gap-1 group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resort */}
          <div>
            <h4 className="eyebrow mb-6">
              {t({ en: 'Resort', es: 'Resort' })}
            </h4>
            <ul className="space-y-3">
              {resortAmenities.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-ink transition-colors font-light inline-flex items-center gap-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="eyebrow mb-6">
              {t({ en: 'Discover', es: 'Descubre' })}
            </h4>
            <ul className="space-y-3">
              {infoPages.slice(0, 4).map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-muted hover:text-ink transition-colors font-light inline-flex items-center gap-1 group"
                  >
                    <span>{page.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-line">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <p className="text-sm text-muted font-light">
                © {currentYear} Leticia Coudray Saladin Real Estate & Services {t({ en: 'All rights reserved.', es: 'Todos los derechos reservados.' })}
              </p>

              {/* Legal Links */}
              <div className="flex items-center gap-6">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted hover:text-ink transition-colors font-light"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-ink transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-muted group-hover:text-ink transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}