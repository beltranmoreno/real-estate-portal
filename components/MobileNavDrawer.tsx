'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X, Search, Phone, Users, ChevronDown,
  Globe, ArrowRight, Heart, User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

interface MobileNavDrawerProps {
  locale?: 'en' | 'es'
  onLocaleChange?: (locale: 'en' | 'es') => void
  /** True while the navbar is transparent over the hero — hamburger goes white. */
  onDark?: boolean
}

// Flat nav (mirrors the desktop header): three direct links + one grouped
// "The Resort" dropdown.
const NAV_LINKS: { label: { en: string; es: string }; href: string }[] = [
  { label: { en: 'Residences', es: 'Residencias' }, href: '/search' },
  { label: { en: 'Concierge', es: 'Conserjería' }, href: '/services/concierge' },
  { label: { en: 'About', es: 'Nosotros' }, href: '/about' },
]

const RESORT_ITEMS: { label: { en: string; es: string }; href: string }[] = [
  { label: { en: 'Restaurants', es: 'Restaurantes' }, href: '/restaurants' },
  { label: { en: 'Golf Courses', es: 'Campos de Golf' }, href: '/courses' },
  { label: { en: 'Beaches', es: 'Playas' }, href: '/info/beaches' },
  { label: { en: 'Activities', es: 'Actividades' }, href: '/info/activities' },
]

export default function MobileNavDrawer({ locale = 'en', onLocaleChange, onDark = false }: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { favoritesCount } = useFavorites()
  const { isSignedIn } = useUser()

  const t = (text: { en: string; es: string }) => text[locale]

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Disable body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const closeDrawer = () => {
    setIsOpen(false)
    setExpandedSection(null)
  }

  return (
    <>
      {/* Menu Toggle Button — two bars that animate into an X on open. */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "lg:hidden p-2 relative z-[60] transition-colors",
          onDark && !isOpen ? "text-white" : "text-body-strong"
        )}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className="relative block w-6 h-4" aria-hidden="true">
          <span
            className={cn(
              "absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-300 ease-out",
              isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-300 ease-out",
              isOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1"
            )}
          />
        </span>
      </button>

      {/* Portal for Backdrop and Drawer */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300"
              onClick={closeDrawer}
            />
          )}

          {/* Drawer */}
          <div
            className={cn(
              "fixed top-0 right-0 h-dvh w-[90%] max-w-xs bg-white/98 backdrop-blur-xl border-l border-line shadow-2xl z-[60] lg:hidden transition-transform duration-300 overflow-hidden flex flex-col",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex flex-col items-start gap-3">
              <h2 className="text-ink font-medium text-sm">Menu</h2>
              <p className="text-xs text-muted">{t({ en: 'Navigate our services', es: 'Navega nuestros servicios' })}</p>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-none text-muted hover:text-ink hover:bg-sand/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-3 border-b border-line">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Link
                href="/search"
                onClick={closeDrawer}
                className="flex items-center gap-2 px-2.5 py-4 rounded-none bg-sand border border-line text-ink hover:bg-line transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-medium">{t({ en: 'Search', es: 'Buscar' })}</span>
              </Link>
              <Link
                href="/about#contact"
                onClick={closeDrawer}
                className="flex items-center gap-2 px-2.5 py-4 rounded-none bg-ink text-white hover:bg-brand transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-xs font-medium">{t({ en: 'Contact', es: 'Contacto' })}</span>
              </Link>
            </div>
            <Link
              href="/favorites"
              onClick={closeDrawer}
              className="flex items-center gap-2 px-2.5 py-4 rounded-none bg-sand border border-line text-ink hover:bg-line transition-colors"
              >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="text-xs font-medium">{t({ en: 'My Favorites', es: 'Mis Favoritos' })}</span>
              </div>
              {favoritesCount > 0 && (
                <span className="bg-ink text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <Link
              href="/about"
              onClick={closeDrawer}
              className="flex items-center gap-2 px-2.5 py-4 mt-2 rounded-none bg-sand border border-line text-ink hover:bg-line transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">{t({ en: 'About', es: 'Nosotros' })}</span>
            </Link>
          </div>

          {/* Menu — flat links + one "The Resort" group */}
          <div className="p-3">
            <Link
              href="/search"
              onClick={closeDrawer}
              className="block py-3 px-2.5 text-sm font-medium text-ink hover:bg-sand/60 rounded-none transition-colors"
            >
              {t({ en: 'Residences', es: 'Residencias' })}
            </Link>

            <button
              onClick={() => toggleSection('resort')}
              className="w-full flex items-center justify-between py-3 px-2.5 rounded-none hover:bg-sand/60 transition-colors"
            >
              <span className="text-sm font-medium text-ink">{t({ en: 'The Resort', es: 'El Resort' })}</span>
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-2 transition-transform duration-200",
                expandedSection === 'resort' && "rotate-180"
              )} />
            </button>
            <div className={cn(
              "overflow-hidden transition-all duration-200",
              expandedSection === 'resort' ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="pl-4 py-1 space-y-0.5">
                {RESORT_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className="block py-2 px-2.5 rounded-none text-sm font-light text-muted hover:text-ink hover:bg-sand/40 transition-colors"
                  >
                    {t(item.label)}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/services/concierge"
              onClick={closeDrawer}
              className="block py-3 px-2.5 text-sm font-medium text-ink hover:bg-sand/60 rounded-none transition-colors"
            >
              {t({ en: 'Concierge', es: 'Conserjería' })}
            </Link>
            <Link
              href="/about"
              onClick={closeDrawer}
              className="block py-3 px-2.5 text-sm font-medium text-ink hover:bg-sand/60 rounded-none transition-colors"
            >
              {t({ en: 'About', es: 'Nosotros' })}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-3 border-t border-line bg-white/98 backdrop-blur-xl">
          {/* Language Switcher */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Globe className="w-3.5 h-3.5" />
              <span>{t({ en: 'Language', es: 'Idioma' })}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onLocaleChange?.('en')}
                className={cn(
                  "px-2.5 py-1 text-xs rounded transition-colors",
                  locale === 'en' 
                    ? "bg-sand text-ink border border-line" 
                    : "text-muted hover:text-ink"
                )}
              >
                EN
              </button>
              <button
                onClick={() => onLocaleChange?.('es')}
                className={cn(
                  "px-2.5 py-1 text-xs rounded transition-colors",
                  locale === 'es' 
                    ? "bg-sand text-ink border border-line" 
                    : "text-muted hover:text-ink"
                )}
              >
                ES
              </button>
            </div>
          </div>

          {/* Guest portal — secondary action for returning guests */}
          <Link
            href={isSignedIn ? '/portal/stays' : '/portal/sign-in'}
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 w-full py-2 mb-2 rounded-none border border-control-border text-ink font-light hover:bg-sand transition-all duration-300 text-sm tracking-wide"
          >
            <User className="w-4 h-4" />
            {isSignedIn
              ? t({ en: 'Your stays', es: 'Tus estadías' })
              : t({ en: 'Guest portal sign in', es: 'Portal de huéspedes' })}
          </Link>

          {/* CTA Button */}
          <Link
            href="/search"
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-none bg-ink text-white font-light hover:bg-brand transition-all duration-300 text-sm tracking-wide"
          >
            {t({ en: 'Find Your Property', es: 'Encuentra tu Propiedad' })}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
        </>,
        document.body
      )}
    </>
  )
}