'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { resortMenuItems } from '@/lib/navConfig'
import type { ResortNavGuide } from './Navbar'
import { usePathname } from 'next/navigation'
import {
  Phone, ChevronDown, Globe, ArrowRight, Heart, User,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

interface MobileNavDrawerProps {
  locale?: 'en' | 'es'
  onLocaleChange?: (locale: 'en' | 'es') => void
  /** Resort guides from Studio, listed under The Resort. */
  resortGuides?: ResortNavGuide[]
}

// Flat nav (mirrors the desktop header): three direct links + one grouped
// "The Resort" dropdown.
const NAV_LINKS: { label: { en: string; es: string }; href: string }[] = [
  { label: { en: 'Properties', es: 'Propiedades' }, href: '/search' },
  { label: { en: 'Concierge', es: 'Conserjería' }, href: '/services/concierge' },
  { label: { en: 'About', es: 'Nosotros' }, href: '/about' },
]


export default function MobileNavDrawer({ locale = 'en', onLocaleChange, resortGuides = [] }: MobileNavDrawerProps) {
  const RESORT_ITEMS = resortMenuItems(resortGuides)
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

  // Entries rise in one after another when the menu opens (instantly hidden
  // when it closes). Reduced-motion users get no movement (globals.css).
  const enter = (i: number) => ({
    className: cn(
      'transition-[opacity,translate] ease-out',
      isOpen ? 'opacity-100 translate-y-0 duration-500' : 'opacity-0 translate-y-3 duration-0'
    ),
    style: { transitionDelay: isOpen ? `${80 + i * 45}ms` : '0ms' },
  })

  return (
    <>
      {/* Menu Toggle Button — two bars that animate into an X on open. */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "lg:hidden p-2 relative z-[60] transition-colors",
          // White while the navbar is clear over a hero (dark again once open)
          isOpen ? "text-body-strong" : "text-body-strong nav-clear:text-white"
        )}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <MenuIcon open={isOpen} />
      </button>

      {/* Full-screen menu, in a portal so it covers the whole page */}
      {mounted && createPortal(
        <div
          className={cn(
            "fixed inset-0 z-[60] lg:hidden bg-canvas flex flex-col transition-[opacity,visibility] duration-300",
            isOpen ? "opacity-100 visible" : "opacity-0 invisible"
          )}
          role="dialog"
          aria-modal="true"
          aria-label={t({ en: 'Menu', es: 'Menú' })}
        >
          {/* Top row — same height and logo position as the navbar */}
          <div className="border-b border-line">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
              <Link href="/" onClick={closeDrawer} className="flex items-center">
                <Image
                  src="/Logo_LCS_Real_Estate.png"
                  alt="Leticia Coudray - Real Estate & Services"
                  width={743}
                  height={200}
                  className="w-auto h-16"
                />
              </Link>
              {/* Sits exactly over the navbar's toggle: its two lines turn into
                  an X as the menu fades in, and back as it closes. */}
              <button
                onClick={closeDrawer}
                aria-label={t({ en: 'Close menu', es: 'Cerrar menú' })}
                className="p-2 text-body-strong hover:text-ink transition-colors"
              >
                <MenuIcon open={isOpen} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <nav className="container mx-auto px-4 pt-4 pb-10">
              {/* Main links — serif, one per row */}
              <ul>
                {[NAV_LINKS[0]].map((l) => (
                  <li key={l.href} {...enter(0)}>
                    <MenuLink href={l.href} active={pathname?.startsWith(l.href)} onClick={closeDrawer}>
                      {t(l.label)}
                    </MenuLink>
                  </li>
                ))}
                <li className={enter(1).className} style={enter(1).style}>
                  <button
                    onClick={() => toggleSection('resort')}
                    aria-expanded={expandedSection === 'resort'}
                    className="w-full flex items-center justify-between py-5 font-title text-[28px] leading-none text-ink"
                  >
                    {t({ en: 'The Resort', es: 'El Resort' })}
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 text-muted-2 transition-transform duration-200",
                        expandedSection === 'resort' && "rotate-180"
                      )}
                      strokeWidth={1.25}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300",
                      expandedSection === 'resort' ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <ul className="overflow-hidden">
                      {RESORT_ITEMS.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={closeDrawer}
                            className={cn(
                              "block py-2.5 text-[15px] font-light transition-colors",
                              pathname === item.href ? "text-ink" : "text-muted hover:text-ink"
                            )}
                          >
                            {t(item.label)}
                          </Link>
                        </li>
                      ))}
                      <li className="h-4" aria-hidden />
                    </ul>
                  </div>
                </li>
                {NAV_LINKS.slice(1).map((l, i) => (
                  <li key={l.href} className={enter(2 + i).className} style={enter(2 + i).style}>
                    <MenuLink href={l.href} active={pathname?.startsWith(l.href)} onClick={closeDrawer}>
                      {t(l.label)}
                    </MenuLink>
                  </li>
                ))}
              </ul>

              {/* Secondary links */}
              <ul className="mt-8 space-y-1">
                <li {...enter(4)}>
                  <SmallLink href="/favorites" onClick={closeDrawer} icon={Heart}>
                    {t({ en: 'Favorites', es: 'Favoritos' })}
                    {favoritesCount > 0 && (
                      <span className="ml-2 text-xs text-muted-2">({favoritesCount})</span>
                    )}
                  </SmallLink>
                </li>
                <li {...enter(5)}>
                  <SmallLink href="/about#contact" onClick={closeDrawer} icon={Phone}>
                    {t({ en: 'Contact', es: 'Contacto' })}
                  </SmallLink>
                </li>
                <li {...enter(6)}>
                  <SmallLink href={isSignedIn ? '/portal/stays' : '/portal/sign-in'} onClick={closeDrawer} icon={User}>
                    {isSignedIn
                      ? t({ en: 'Your stays', es: 'Tus estadías' })
                      : t({ en: 'Guest portal', es: 'Portal de huéspedes' })}
                  </SmallLink>
                </li>
              </ul>
            </nav>
          </div>

          {/* Footer — language + main action */}
          <div className="border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)]">
            <div className="container mx-auto px-4 py-4 flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs tracking-[0.14em]" aria-label={t({ en: 'Language', es: 'Idioma' })}>
                <Globe className="w-3.5 h-3.5 text-muted-2 mr-1" strokeWidth={1.5} />
                {(['en', 'es'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => onLocaleChange?.(l)}
                    aria-pressed={locale === l}
                    className={cn(
                      "px-2 py-2 uppercase transition-colors",
                      locale === l ? "text-ink underline underline-offset-4" : "text-muted-2 hover:text-ink"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Link
                href="/search"
                onClick={closeDrawer}
                className="ml-auto inline-flex items-center gap-2 bg-ink text-white px-5 py-3 text-xs uppercase tracking-[0.14em] hover:bg-brand transition-colors"
              >
                {t({ en: 'Discover properties', es: 'Descubre propiedades' })}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

/** A main menu row: large serif name. */
function MenuLink({ href, active, onClick, children }: { href: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        "flex items-center justify-between py-5 font-title text-[28px] leading-none transition-colors",
        active ? "text-brand" : "text-ink hover:text-brand"
      )}
    >
      {children}
    </Link>
  )
}

/** A quieter row under the main links. */
function SmallLink({ href, onClick, icon: Icon, children }: { href: string; onClick: () => void; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 py-2.5 text-[15px] font-light text-body-strong hover:text-ink transition-colors">
      <Icon className="w-4 h-4 text-muted-2" strokeWidth={1.5} />
      {children}
    </Link>
  )
}

/** Two lines that rotate into an X when `open`. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block w-6 h-4" aria-hidden="true">
      <span
        className={cn(
          "absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-300 ease-out",
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"
        )}
      />
      <span
        className={cn(
          "absolute left-0 block h-[1.5px] w-6 bg-current transition-all duration-300 ease-out",
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1"
        )}
      />
    </span>
  )
}
