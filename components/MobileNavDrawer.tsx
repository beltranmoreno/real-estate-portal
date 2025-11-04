'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Home, Search, MapPin, Phone, Car, Utensils, Trophy,
  Users, Briefcase, Star, ChevronRight, ChevronDown,
  Globe, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavDrawerProps {
  locale?: 'en' | 'es'
  onLocaleChange?: (locale: 'en' | 'es') => void
}

const menuStructure = {
  properties: {
    title: { en: 'Properties', es: 'Propiedades' },
    icon: Home,
    items: [
      { label: { en: 'Browse All', es: 'Ver Todas' }, href: '/search', icon: Search },
      { label: { en: 'Featured', es: 'Destacadas' }, href: '/search?featured=true', icon: Star },
      { label: { en: 'Beachfront', es: 'Frente al Mar' }, href: '/search?theme=beachfront' },
      { label: { en: 'Golf Properties', es: 'Propiedades de Golf' }, href: '/search?theme=golf' },
      { label: { en: 'Family Homes', es: 'Casas Familiares' }, href: '/search?theme=family' },
      { label: { en: 'Luxury Villas', es: 'Villas de Lujo' }, href: '/search?theme=luxury' },
      { label: { en: 'Event Venues', es: 'Lugares para Eventos' }, href: '/search?theme=events' }
    ]
  },
  services: {
    title: { en: 'Services', es: 'Servicios' },
    icon: Briefcase,
    badge: { en: 'New', es: 'Nuevo' },
    items: [
      { label: { en: 'Concierge', es: 'Conserjería' }, href: '/services/concierge', icon: Users },
      { label: { en: 'Golf Cart Rentals', es: 'Carritos de Golf' }, href: '/golf-cart-rental', icon: Car },
      { label: { en: 'Airport Transfers', es: 'Traslados' }, href: '/services/transfers' },
      { label: { en: 'Private Chef', es: 'Chef Privado' }, href: '/info/chef' },
      { label: { en: 'Yacht Charters', es: 'Yates' }, href: '/info/yacht-charters' },
      { label: { en: 'Event Planning', es: 'Eventos' }, href: '/services/events' }
    ]
  },
  explore: {
    title: { en: 'Explore', es: 'Explorar' },
    icon: MapPin,
    items: [
      { label: { en: 'Restaurants', es: 'Restaurantes' }, href: '/restaurants', icon: Utensils },
      { label: { en: 'Golf Courses', es: 'Campos de Golf' }, href: '/courses', icon: Trophy },
      { label: { en: 'Beaches', es: 'Playas' }, href: '/info/beaches' },
      { label: { en: 'Activities', es: 'Actividades' }, href: '/info/activities' },
      { label: { en: 'Nightlife', es: 'Vida Nocturna' }, href: '/info/nightlife' },
      { label: { en: 'Shopping', es: 'Compras' }, href: '/info/shopping' },
      { label: { en: 'Local Tips', es: 'Consejos Locales' }, href: '/info/local-tips' }
    ]
  }
}

export default function MobileNavDrawer({ locale = 'en', onLocaleChange }: MobileNavDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

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
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100/50 transition-colors relative z-[60]"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              "fixed top-0 right-0 h-dvh w-[90%] max-w-xs bg-white/98 backdrop-blur-xl border-l border-stone-200/50 shadow-2xl z-[60] lg:hidden transition-transform duration-300 overflow-hidden flex flex-col",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200/50 flex items-center justify-center">
              <span className="text-stone-800 font-light text-sm">LC</span>
            </div>
            <div>
              <h2 className="text-stone-900 font-medium text-sm">Menu</h2>
              <p className="text-xs text-stone-600">{t({ en: 'Navigate our services', es: 'Navega nuestros servicios' })}</p>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-3 border-b border-stone-200/50">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/search"
                onClick={closeDrawer}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-100 border border-stone-200/50 text-stone-800 hover:bg-stone-200 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-medium">{t({ en: 'Search', es: 'Buscar' })}</span>
              </Link>
              <Link
                href="/contact"
                onClick={closeDrawer}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-xs font-medium">{t({ en: 'Contact', es: 'Contacto' })}</span>
              </Link>
            </div>
          </div>

          {/* Menu Sections */}
          <div className="p-3">
            {Object.entries(menuStructure).map(([key, section]) => {
              const Icon = section.icon
              const isExpanded = expandedSection === key
              
              return (
                <div key={key} className="mb-1">
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-stone-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-stone-100 text-stone-600">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-stone-900 font-medium text-sm">{t(section.title)}</span>
                      {'badge' in section && section.badge && (
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-stone-200 text-stone-700">
                          {t(section.badge)}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-stone-500 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )} />
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-200",
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="pl-8 pr-2 py-1 space-y-0.5">
                      {section.items.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          onClick={closeDrawer}
                          className={cn(
                            "flex items-center justify-between py-2 px-2.5 rounded-lg text-xs transition-colors",
                            pathname === item.href
                              ? "bg-stone-100 text-stone-900"
                              : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {'icon' in item && item.icon && (
                              <item.icon className="w-3.5 h-3.5" />
                            )}
                            <span>{t(item.label)}</span>
                          </div>
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Static Links */}
            <div className="mt-4 pt-3 border-t border-stone-200/50 space-y-1">
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-3 border-t border-stone-200/50 bg-white/98 backdrop-blur-xl">
          {/* Language Switcher */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <Globe className="w-3.5 h-3.5" />
              <span>{t({ en: 'Language', es: 'Idioma' })}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onLocaleChange?.('en')}
                className={cn(
                  "px-2.5 py-1 text-xs rounded transition-colors",
                  locale === 'en' 
                    ? "bg-stone-100 text-stone-900 border border-stone-200" 
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                EN
              </button>
              <button
                onClick={() => onLocaleChange?.('es')}
                className={cn(
                  "px-2.5 py-1 text-xs rounded transition-colors",
                  locale === 'es' 
                    ? "bg-stone-100 text-stone-900 border border-stone-200" 
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                ES
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/search"
            onClick={closeDrawer}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-800 text-white font-light hover:bg-slate-700 transition-all duration-300 text-sm tracking-wide"
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