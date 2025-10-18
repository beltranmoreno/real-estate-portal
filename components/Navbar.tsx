'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Globe, Phone, ArrowRight, Search, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import MegaMenu from './MegaMenu'
import MobileNavDrawer from './MobileNavDrawer'
import FavoritesDrawer from './FavoritesDrawer'
import Image from 'next/image'

const LOGO_URL = '/Logo_LCS_Real_Estate.png'

export default function Navbar() {
  const { locale, setLocale, t } = useLocale()
  const { favoritesCount } = useFavorites()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showFavorites, setShowFavorites] = useState(false)

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
      "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50 transition-transform duration-300",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      {/* Main Navigation */} 
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={LOGO_URL}
              alt="Leticia Coudray - Real Estate & Services"
              width={256}
              height={256}
              className="w-auto h-16"
              priority
            />
          </Link>

          {/* Desktop Mega Menu */}
          <MegaMenu locale={locale} />

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Favorites Button */}
            <button
              onClick={() => setShowFavorites(true)}
              className="cursor-pointer h-8 flex items-center gap-2 bg-stone-100/60 backdrop-blur-sm rounded-lg p-2 border border-stone-200/50 hover:bg-stone-200/60 transition-all duration-200 relative"
              title={t({ en: 'My Favorites', es: 'Mis Favoritos' })}
            >
              <Heart className="w-4 h-4 text-stone-600" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
              className="cursor-pointer h-8 flex items-center gap-2 bg-stone-100/60 backdrop-blur-sm rounded-lg p-2 border border-stone-200/50 hover:bg-stone-200/60 transition-all duration-200"
              title={`Switch to ${locale === 'en' ? 'Español' : 'English'}`}
            >
              <Globe className="w-4 h-4 text-stone-600" />
              <span className="text-xs font-medium text-stone-700 uppercase">
                {locale}
              </span>
            </button>

            {/* CTA Button */}
            <Link
              href="/search"
              className="text-xs font-medium text-stone-700 uppercase px-5 py-1 h-8 bg-stone-100/60 text-slate-800 font-light rounded-lg border border-stone-200/50 hover:bg-stone-200/60 transition-all duration-300 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t({ en: 'Search', es: 'Buscar' })}
            </Link>
          </div>

          {/* Mobile Navigation Drawer */}
          <MobileNavDrawer locale={locale} onLocaleChange={setLocale} />
        </div>
      </div>

      {/* Favorites Drawer */}
      <FavoritesDrawer isOpen={showFavorites} onClose={() => setShowFavorites(false)} />
    </header>
  )
}