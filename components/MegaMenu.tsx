'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Home, Search, MapPin, Utensils, Trophy, Users, Calendar, Briefcase, Star, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MegaMenuProps {
  locale?: 'en' | 'es'
  /** True while the navbar is transparent over the hero — items go white. */
  onDark?: boolean
}

const menuStructure = {
  properties: {
    title: { en: 'Properties', es: 'Propiedades' },
    icon: Home,
    featured: [
      {
        title: { en: 'Browse All Properties', es: 'Ver Todas las Propiedades' },
        description: { en: 'Explore our full collection', es: 'Explora nuestra colección completa' },
        href: '/search',
        icon: Search
      },
      {
        title: { en: 'Featured Properties', es: 'Propiedades Destacadas' },
        description: { en: 'Hand-picked luxury selections', es: 'Selecciones de lujo elegidas' },
        href: '/search?featured=true',
        icon: Star
      }
    ],
    categories: [
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
    featured: [
      {
        title: { en: 'Concierge Services', es: 'Servicios de Conserjería' },
        description: { en: 'Optional add-ons for renters', es: 'Servicios opcionales para huéspedes' },
        href: '/services/concierge',
        icon: Users,
      }
    ],
    categories: []
  },
  explore: {
    title: { en: 'Explore', es: 'Explorar' },
    icon: MapPin,
    featured: [
      {
        title: { en: 'Restaurant Guide', es: 'Guía de Restaurantes' },
        description: { en: 'Best dining experiences', es: 'Las mejores experiencias gastronómicas' },
        href: '/restaurants',
        icon: Utensils
      },
      {
        title: { en: 'Golf Courses', es: 'Campos de Golf' },
        description: { en: 'Championship courses nearby', es: 'Campos de campeonato cercanos' },
        href: '/courses',
        icon: Trophy
      }
    ],
    categories: [
      { label: { en: 'Beaches', es: 'Playas' }, href: '/info/beaches' },
      { label: { en: 'Activities', es: 'Actividades' }, href: '/info/activities' },
      { label: { en: 'Nightlife', es: 'Vida Nocturna' }, href: '/info/nightlife' },
      { label: { en: 'Shopping', es: 'Compras' }, href: '/explore/shopping' },
      { label: { en: 'Local Tips', es: 'Consejos Locales' }, href: '/info/local-tips' }
    ]
  }
}

export default function MegaMenu({ locale = 'en', onDark = false }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const pathname = usePathname()

  const t = (text: { en: string; es: string }) => text[locale]

  // Nav item styling across the three navbar states.
  const navItem = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 px-3 py-2 text-xs font-light uppercase tracking-[0.14em] transition-colors duration-200 border-b border-transparent",
      onDark
        ? "text-white/85 hover:text-white group-hover/nav:text-body-strong group-hover/nav:hover:text-ink"
        : "text-body-strong hover:text-ink",
      active && !onDark && "text-ink border-brand",
      active && onDark && "group-hover/nav:border-brand"
    )

  return (
    <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
      {Object.entries(menuStructure).map(([key, menu]) => {
        const isActive = pathname.startsWith(`/${key}`) || pathname.startsWith(`/search`) && key === 'properties'
        
        return (
          <div
            key={key}
            className="relative"
            onMouseEnter={() => setActiveMenu(key)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className={navItem(isActive || activeMenu === key)}>
              <span>{t(menu.title)}</span>
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform duration-200",
                activeMenu === key && "rotate-180"
              )} />
            </button>

            {/* Mega Menu Dropdown */}
            {activeMenu === key && (
              <div className="absolute top-full left-0 mt-0 w-[600px] bg-surface border border-line rounded-none shadow-[var(--shadow-float)] overflow-hidden animate-in slide-in-from-top-2 duration-200 origin-top">
                <div className="p-6">
                {/* Featured Section */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {menu.featured.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="group relative p-4 rounded-none bg-canvas border border-line hover:border-ink transition-colors duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-none bg-sand text-muted group-hover:text-brand transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-title text-base text-ink transition-colors">
                            {t(item.title)}
                          </h3>
                          <p className="text-sm text-muted mt-1 font-light">
                            {t(item.description)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-faint group-hover:text-brand group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Categories Grid — hidden entirely when a section has
                    no categories, so we don't render an empty divider. */}
                {menu.categories.length > 0 && (
                <div className="border-t border-line pt-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {menu.categories.map((category, index) => (
                      <Link
                        key={index}
                        href={category.href}
                        className="flex items-center gap-2 py-2 text-sm text-muted hover:text-ink transition-colors group font-light"
                      >
                        <div className="w-1 h-1 rounded-full bg-faint group-hover:bg-brand transition-colors" />
                        {t(category.label)}
                      </Link>
                    ))}
                  </div>
                </div>
                )}
              </div>

              {/* Bottom CTA Bar */}
              <div className="px-6 py-3 bg-canvas border-t border-line">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-2 font-light">
                    {t({ en: 'Need help choosing?', es: '¿Necesitas ayuda para elegir?' })}
                  </p>
                  <Link
                    href="/contact"
                    className="text-xs font-medium uppercase tracking-[0.12em] text-brand hover:text-brand-deep transition-colors flex items-center gap-1"
                  >
                    {t({ en: 'Contact us', es: 'Contáctanos' })}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Quick Links */}
      <div className="flex items-center gap-1">
        <Link href="/about" className={navItem(pathname === '/about')}>
          {t({ en: 'About', es: 'Nosotros' })}
        </Link>
        <Link href="/contact" className={navItem(pathname === '/contact')}>
          {t({ en: 'Contact', es: 'Contacto' })}
        </Link>
      </div>
    </nav>
  )
}