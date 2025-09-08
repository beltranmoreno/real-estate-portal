'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Home,
  Search,
  Building2,
  Users,
  Shield,
  FileText,
  Heart
} from 'lucide-react'

export default function Footer() {
  const { locale, t } = useLocale()
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    {
      href: '/search?listingType=rental',
      label: t({ en: 'Vacation Rentals', es: 'Alquileres Vacacionales' }),
      icon: Home
    },
    {
      href: '/search?listingType=sale',
      label: t({ en: 'Properties for Sale', es: 'Propiedades en Venta' }),
      icon: Building2
    },
    {
      href: '/search?themes=luxury',
      label: t({ en: 'Luxury Properties', es: 'Propiedades de Lujo' }),
      icon: Heart
    },
    {
      href: '/search?themes=beachfront',
      label: t({ en: 'Beachfront', es: 'Frente al Mar' }),
      icon: Search
    }
  ]

  const popularAreas = [
    { name: 'Punta Cana', href: '/search?area=punta-cana' },
    { name: 'Casa de Campo', href: '/search?area=casa-de-campo' },
    { name: 'Cap Cana', href: '/search?area=cap-cana' },
    { name: 'Bavaro', href: '/search?area=bavaro' },
    { name: 'La Romana', href: '/search?area=la-romana' },
    { name: 'Playa Dorada', href: '/search?area=playa-dorada' }
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
    }
  ]

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' }
  ]

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                {t({ en: 'DR Properties', es: 'DR Propiedades' })}
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              {t({
                en: 'Your premier destination for luxury real estate in the Dominican Republic. Find your dream home in paradise.',
                es: 'Tu destino premier para bienes raíces de lujo en República Dominicana. Encuentra la casa de tus sueños en el paraíso.'
              })}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              <a href="tel:+18095551234" className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (809) 555-1234</span>
              </a>
              <a href="mailto:info@drproperties.com" className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@drproperties.com</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span className="text-sm">
                  {t({
                    en: 'Santo Domingo, Dominican Republic',
                    es: 'Santo Domingo, República Dominicana'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t({ en: 'Quick Links', es: 'Enlaces Rápidos' })}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <link.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Areas */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t({ en: 'Popular Areas', es: 'Áreas Populares' })}
            </h3>
            <ul className="space-y-3">
              {popularAreas.map((area) => (
                <li key={area.href}>
                  <Link 
                    href={area.href}
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm">{area.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t({ en: 'Stay Connected', es: 'Mantente Conectado' })}
            </h3>
            
            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm mb-3">
                {t({
                  en: 'Subscribe to our newsletter for exclusive properties and updates',
                  es: 'Suscríbete a nuestro boletín para propiedades exclusivas y actualizaciones'
                })}
              </p>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder={t({ en: 'Your email', es: 'Tu correo' })}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {t({ en: 'Subscribe', es: 'Suscribir' })}
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm mb-3">
                {t({ en: 'Follow us', es: 'Síguenos' })}
              </p>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-xs text-slate-400">
                  {t({ en: 'Verified', es: 'Verificado' })}
                </p>
                <p className="text-sm font-medium text-white">
                  {t({ en: 'Properties', es: 'Propiedades' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-xs text-slate-400">
                  {t({ en: '24/7', es: '24/7' })}
                </p>
                <p className="text-sm font-medium text-white">
                  {t({ en: 'Support', es: 'Soporte' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-xs text-slate-400">
                  {t({ en: 'Legal', es: 'Legal' })}
                </p>
                <p className="text-sm font-medium text-white">
                  {t({ en: 'Assistance', es: 'Asistencia' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-xs text-slate-400">
                  {t({ en: 'Best Price', es: 'Mejor Precio' })}
                </p>
                <p className="text-sm font-medium text-white">
                  {t({ en: 'Guarantee', es: 'Garantía' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-400">
              © {currentYear} {t({ en: 'DR Properties. All rights reserved.', es: 'DR Propiedades. Todos los derechos reservados.' })}
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <span className="text-slate-600">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}