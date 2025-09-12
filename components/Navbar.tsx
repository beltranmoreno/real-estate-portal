'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { Globe, Phone, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import MegaMenu from './MegaMenu'
import MobileNavDrawer from './MobileNavDrawer'

export default function Navbar() {
  const { locale, setLocale, t } = useLocale()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide navbar
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
        // Scrolling up or at top - show navbar
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    // Add scroll listener
    window.addEventListener('scroll', controlNavbar)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlNavbar)
    }
  }, [lastScrollY])

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-stone-200/50 transition-transform duration-300",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      {/* Top Bar - Announcement/Info Bar
      <div className="hidden lg:block bg-stone-50/80 backdrop-blur border-b border-stone-200/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-6 text-xs">
              <span className="text-stone-600">
                {t({ en: 'Limited Summer Availability', es: 'Disponibilidad Limitada de Verano' })}
              </span>
              <Link href="/contact" className="text-stone-800 hover:text-stone-900 transition-colors flex items-center gap-1 font-medium">
                {t({ en: 'Book Now', es: 'Reserva Ahora' })}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-center gap-4 text-xs text-stone-600">
              <a href="tel:+18095551234" className="hover:text-stone-800 transition-colors flex items-center gap-1">
                <Phone className="w-3 h-3" />
                +1 (809) 555-1234
              </a>
              <span className="text-stone-400">|</span>
              <span>{t({ en: '24/7 Concierge Available', es: 'Conserjería 24/7 Disponible' })}</span>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div>
              <span className="text-xl font-light text-stone-900 tracking-wide">
                Leticia Coudray
              </span>
              <p className="text-xs text-stone-600 hidden xl:block font-light tracking-wider">
                {t({ en: 'Real Estate & Services', es: 'Inmobiliaria y Servicios' })}
              </p>
            </div>
          </Link>

          {/* Desktop Mega Menu */}
          <MegaMenu locale={locale} />

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-stone-100/60 backdrop-blur-sm rounded-lg p-1 border border-stone-200/50">
              <Globe className="w-4 h-4 text-stone-500 ml-2" />
              <button
                onClick={() => setLocale('en')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                  locale === 'en' 
                    ? "bg-white text-stone-800 shadow-sm" 
                    : "text-stone-600 hover:text-stone-800"
                )}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('es')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                  locale === 'es' 
                    ? "bg-white text-stone-800 shadow-sm" 
                    : "text-stone-600 hover:text-stone-800"
                )}
              >
                ES
              </button>
            </div>

            {/* CTA Button */}
            <Link
              href="/search"
              className="px-5 py-2.5 bg-slate-800 text-white font-light rounded-lg hover:bg-slate-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 tracking-wide"
            >
              {t({ en: 'Book Now', es: 'Reservar' })}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Navigation Drawer */}
          <MobileNavDrawer locale={locale} onLocaleChange={setLocale} />
        </div>
      </div>
    </header>
  )
}