'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import Image from 'next/image'
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from 'lucide-react'
import { InstagramIcon } from './icons/InstagramIcon'

const LOGO_URL = '/Logo_LCS_Real_Estate.png'
export default function Footer() {
  const { locale, t } = useLocale()
  const currentYear = new Date().getFullYear()

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
      href: '/owners',
      label: t({ en: 'For owners', es: 'Para propietarios' })
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
      name: t({ en: 'Beach', es: 'Playa' }),
      href: '/info/beaches'
    },
    {
      name: t({ en: 'Nightlife', es: 'Vida Nocturna' }),
      href: '/restaurants#bars'
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
      href: '/info/activities#water'
    },
    {
      name: t({ en: 'Golf Cart Rental', es: 'Alquiler de Carritos' }),
      href: '/services/concierge#golf-carts'
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
      href: '/info/activities#water'
    },
    {
      name: t({ en: 'Beach', es: 'Playa' }),
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
    <footer className="bg-canvas text-body-strong border-t border-line">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Logo row — the lettering sits optically centred between the footer's
            top edge and the divider. The PNG carries ~10px more transparent
            padding above the lettering than below (at h-24), so the bottom
            padding is 10px larger to compensate. */}
        <div className="flex items-center justify-center w-full pt-11 pb-[3.375rem] mb-12 border-b border-line">
          <Image
            src={LOGO_URL}
            alt="Leticia Coudray - Real Estate & Services"
            width={743}
            height={200}
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