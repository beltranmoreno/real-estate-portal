'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useLocale } from '@/contexts/LocaleContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { Globe, Search, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavOverlayState } from '@/contexts/NavOverlayContext'
import MegaMenu from './MegaMenu'
import MobileNavDrawer from './MobileNavDrawer'
import FavoritesDrawer from './FavoritesDrawer'
import { NavAccountMenu } from './NavAccountMenu'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

const LOGO_URL = '/Logo_LCS_Real_Estate.png'

/** A resort guide in The Resort menu (from Studio, via SiteShell). */
export interface ResortNavGuide {
  slug: string
  label: { en?: string | null; es?: string | null }
}

export default function Navbar({ resortGuides = [] }: { resortGuides?: ResortNavGuide[] }) {
  const { locale, setLocale, t } = useLocale()
  const { favoritesCount } = useFavorites()
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  // Over a page hero the bar is fixed and clear until scrolled past. Pages opt
  // in from their hero (useNavOverlay); the styling is CSS (`nav-overlay:` /
  // `nav-clear:` variants), so it's right from the server HTML on.
  const { pastHero } = useNavOverlayState()
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
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

  // Hide the bar while scrolling down, bring it back on the way up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current && y > 100) setIsVisible(false)
      else if (y < lastScrollY.current || y <= 100) setIsVisible(true)
      lastScrollY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  // Frosted chips adapt to the three nav states: white over the hero, flipping
  // to ink when the bar reveals its solid surface (on hover or once scrolled).
  const chipCls = cn(
    "cursor-pointer h-8 flex items-center gap-2 rounded-[2px] px-2 transition-colors duration-200",
    "text-body-strong hover:text-ink",
    "nav-clear:text-white/90 nav-clear:hover:text-white nav-clear:group-hover/nav:text-body-strong nav-clear:group-hover/nav:hover:text-ink"
  )
  const linkCls = cn(
    "cursor-pointer h-8 flex items-center gap-1.5 px-3 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200",
    "text-body-strong hover:text-ink",
    "nav-clear:text-white/90 nav-clear:hover:text-white nav-clear:group-hover/nav:text-body-strong nav-clear:group-hover/nav:hover:text-ink"
  )
  return (
    <header
      data-site-nav
      data-past-hero={pastHero ? '' : undefined}
      className={cn(
        "top-0 left-0 right-0 z-50 transition-all duration-200 group/nav",
        "sticky nav-overlay:fixed bg-canvas border-b border-line",
        "nav-clear:bg-transparent nav-clear:border-white/20 nav-clear:hover:bg-canvas nav-clear:hover:border-line",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      {/* Main Navigation */} 
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src={LOGO_URL}
              alt="Leticia Coudray - Real Estate & Services"
              width={743}
              height={200}
              className={cn(
                "w-auto h-16 transition-[filter] duration-200",
                // The mark is dark artwork on transparency: knock it out to
                // white over the hero, back to ink once the bar goes solid.
                "nav-clear:brightness-0 nav-clear:invert nav-clear:group-hover/nav:brightness-100 nav-clear:group-hover/nav:invert-0"
              )}
              priority
            />
          </Link>

          {/* Desktop Mega Menu */}
          <MegaMenu locale={locale} resortGuides={resortGuides} />

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

              {/* Tooltip — hidden with the bar so it doesn't hang over the page. */}
              {showTooltip && isVisible && (
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
              <NavAccountMenu />
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
          <MobileNavDrawer locale={locale} onLocaleChange={setLocale} resortGuides={resortGuides} />
        </div>
      </div>

      {/* Favorites Drawer */}
      <FavoritesDrawer isOpen={showFavorites} onClose={() => setShowFavorites(false)} />
    </header>
  )
}