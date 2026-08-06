'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Globe, Search, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hasImmersiveHero } from '@/lib/navConfig'
import MegaMenu from './MegaMenu'
import MobileNavDrawer from './MobileNavDrawer'
import FavoritesDrawer from './FavoritesDrawer'
import { NavAccountMenu } from './NavAccountMenu'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

const LOGO_URL = '/Logo_LCS_Real_Estate.png'

export default function Navbar() {
  const { locale, setLocale, t } = useLocale()
  const { favoritesCount } = useFavorites()
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  // Pages with a full-bleed hero the bar should overlay are declared centrally
  // in lib/navConfig.ts — add a route there to opt in, no Navbar edits needed.
  const overlayHero = hasImmersiveHero(pathname)
  const [isVisible, setIsVisible] = useState(true)
  const [atTop, setAtTop] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  // Check if tooltip has been shown this session
  useEffect(() => {
    const tooltipShown = sessionStorage.getItem('favoritesTooltipShown')
    if (!tooltipShown) {
      // Show tooltip after 2 seconds
      const timer = setTimeout(() => {
        setShowTooltip(true)
        sessionStorage.setItem('favoritesTooltipShown', 'true')
      }, 2000)

      // Auto-hide after 8 seconds
      const hideTimer = setTimeout(() => {
        setShowTooltip(false)
      }, 10000)

      return () => {
        clearTimeout(timer)
        clearTimeout(hideTimer)
      }
    }
  }, [])

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

      // Stay transparent only while actually over a hero. Pages opt into the
      // overlay via lib/navConfig, but transparency additionally requires a
      // [data-hero] element on screen and measures its real height — so the
      // flip lines up with any hero, and route states that render no hero
      // (e.g. a collection's access-code screen) get a solid bar automatically.
      const heroEl = document.querySelector('[data-hero]') as HTMLElement | null
      setAtTop(heroEl ? currentScrollY < heroEl.offsetHeight - 80 : false)

      setLastScrollY(currentScrollY)
    }

    controlNavbar()
    // Add scroll listener
    window.addEventListener('scroll', controlNavbar)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlNavbar)
    }
  }, [lastScrollY])

  // On pages with a full-bleed hero (home, course detail) the bar overlays the
  // hero and stays transparent until scrolled past; everywhere else it's the
  // usual solid sticky bar.
  const transparent = overlayHero && atTop
  // Frosted chips adapt to the three nav states: white over the hero, flipping
  // to ink when the bar reveals its solid surface (on hover or once scrolled).
  const chipCls = cn(
    "cursor-pointer h-8 flex items-center gap-2 rounded-[2px] px-2 transition-colors duration-200",
    transparent
      ? "text-white/90 hover:text-white group-hover/nav:text-body-strong group-hover/nav:hover:text-ink"
      : "text-body-strong hover:text-ink"
  )
  const linkCls = cn(
    "cursor-pointer h-8 flex items-center gap-1.5 px-3 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200",
    transparent
      ? "text-white/90 hover:text-white group-hover/nav:text-body-strong group-hover/nav:hover:text-ink"
      : "text-body-strong hover:text-ink"
  )
  return (
    <header className={cn(
      "top-0 left-0 right-0 z-50 transition-all duration-200 group/nav",
      overlayHero ? "fixed" : "sticky",
      transparent
        ? "bg-transparent border-b border-white/20 hover:bg-surface/95 hover:backdrop-blur-md hover:border-line"
        : "bg-surface/95 backdrop-blur-md border-b border-line",
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
          <MegaMenu locale={locale} onDark={transparent} />

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Favorites Button with Tooltip */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFavorites(true)
                  setShowTooltip(false)
                }}
                className={cn(chipCls, "relative")}
                title={t({ en: 'My Favorites', es: 'Mis Favoritos' })}
              >
                <Heart className="w-4 h-4 text-current" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-ink text-surface text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-ink text-surface text-xs rounded-[2px] px-4 py-3 shadow-xl min-w-[200px] max-w-[280px] relative">
                    {/* Arrow */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-ink rotate-45"></div>

                    <p className="text-center leading-relaxed">
                      {t({
                        en: 'Add properties to favorites to inquire about a list of houses you\'ve saved',
                        es: 'Agrega propiedades a favoritos para consultar sobre una lista de casas que has guardado'
                      })}
                    </p>

                    {/* Close button */}
                    <button
                      onClick={() => setShowTooltip(false)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-surface rounded-full flex items-center justify-center text-ink hover:bg-sand transition-colors shadow-md"
                      aria-label={t({ en: 'Close', es: 'Cerrar' })}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <Link
              href="/search"
              className={chipCls}
              title={t({ en: 'Search', es: 'Buscar' })}
              aria-label={t({ en: 'Search', es: 'Buscar' })}
            >
              <Search className="w-4 h-4 text-current" />
            </Link>

            {/* Language Switcher */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}
              className={chipCls}
              title={`Switch to ${locale === 'en' ? 'Español' : 'English'}`}
            >
              <Globe className="w-4 h-4 text-current" />
              <span className="text-xs font-medium uppercase tracking-[0.14em]">
                {locale}
              </span>
            </button>

            {/* Guest portal auth — signed-out shows a discreet sign-in link;
                signed-in swaps to an account menu listing the guest's stays. */}
            {isSignedIn ? (
              <NavAccountMenu onDark={transparent} />
            ) : (
              <Link
                href="/portal/sign-in"
                className={linkCls}
                title={t({ en: 'Guest portal sign in', es: 'Portal de huéspedes' })}
              >
                <User className="w-4 h-4 text-current" />
                {t({ en: 'Sign in', es: 'Ingresar' })}
              </Link>
            )}
          </div>

          {/* Mobile Navigation Drawer */}
          <MobileNavDrawer locale={locale} onLocaleChange={setLocale} onDark={transparent} />
        </div>
      </div>

      {/* Favorites Drawer */}
      <FavoritesDrawer isOpen={showFavorites} onClose={() => setShowFavorites(false)} />
    </header>
  )
}