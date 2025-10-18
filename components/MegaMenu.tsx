'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Home, Search, MapPin, Phone, Car, Utensils, Trophy, Users, Calendar, Briefcase, Star, Info, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MegaMenuProps {
  locale?: 'en' | 'es'
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
        description: { en: '24/7 personal assistance', es: 'Asistencia personal 24/7' },
        href: '/services/concierge',
        icon: Users,
        badge: { en: 'Coming Soon', es: 'Próximamente' }
      },
      {
        title: { en: 'Golf Cart Rentals', es: 'Alquiler de Carritos de Golf' },
        description: { en: 'Convenient island transportation', es: 'Transporte conveniente en la isla' },
        href: '/golf-cart-rental',
        icon: Car,
        badge: { en: 'New', es: 'Nuevo' }
      }
    ],
    categories: [
      { label: { en: 'Airport Transfers', es: 'Traslados al Aeropuerto' }, href: '/services/transfers' },
      { label: { en: 'Private Chef', es: 'Chef Privado' }, href: '/services/chef' },
      { label: { en: 'Yacht Charters', es: 'Alquiler de Yates' }, href: '/services/yacht' },
      { label: { en: 'Event Planning', es: 'Planificación de Eventos' }, href: '/services/events' },
      { label: { en: 'Property Management', es: 'Gestión de Propiedades' }, href: '/services/management' }
    ]
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
      { label: { en: 'Beaches', es: 'Playas' }, href: '/explore/beaches' },
      { label: { en: 'Activities', es: 'Actividades' }, href: '/explore/activities' },
      { label: { en: 'Nightlife', es: 'Vida Nocturna' }, href: '/explore/nightlife' },
      { label: { en: 'Shopping', es: 'Compras' }, href: '/explore/shopping' },
      { label: { en: 'Local Tips', es: 'Consejos Locales' }, href: '/explore/tips' }
    ]
  }
}

export default function MegaMenu({ locale = 'en' }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const pathname = usePathname()

  const t = (text: { en: string; es: string }) => text[locale]

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {Object.entries(menuStructure).map(([key, menu]) => {
        const Icon = menu.icon
        const isActive = pathname.startsWith(`/${key}`) || pathname.startsWith(`/search`) && key === 'properties'
        
        return (
          <div
            key={key}
            className="relative"
            onMouseEnter={() => setActiveMenu(key)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-light transition-all duration-200",
                isActive 
                  ? "bg-stone-100/60 text-stone-900" 
                  : "text-stone-700 hover:text-stone-900 hover:bg-stone-100/40",
                activeMenu === key && "bg-stone-100/60 text-stone-900"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{t(menu.title)}</span>
              <ChevronDown className={cn(
                "w-3 h-3 transition-transform duration-200",
                activeMenu === key && "rotate-180"
              )} />
            </button>

            {/* Mega Menu Dropdown */}
            {activeMenu === key && (
              <div className="absolute top-full left-0 mt-0 w-[600px] bg-white backdrop-blur-sm border border-stone-200/50 rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200 origin-top">
                <div className="p-6">
                {/* Featured Section */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {menu.featured.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="group relative p-4 rounded-xl bg-gradient-to-br from-stone-50 to-white border border-stone-200/50 hover:border-stone-300 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-stone-100 text-stone-600 group-hover:bg-stone-200 transition-colors">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-stone-900 group-hover:text-stone-800 transition-colors">
                              {t(item.title)}
                            </h3>
                            {'badge' in item && item.badge && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-stone-200 text-stone-700 font-light">
                                {t(item.badge)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-600 mt-1 font-light">
                            {t(item.description)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Categories Grid */}
                <div className="border-t border-stone-200/50 pt-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {menu.categories.map((category, index) => (
                      <Link
                        key={index}
                        href={category.href}
                        className="flex items-center gap-2 py-2 text-sm text-stone-600 hover:text-stone-900 transition-colors group font-light"
                      >
                        <div className="w-1 h-1 rounded-full bg-stone-400 group-hover:bg-stone-600 transition-colors" />
                        {t(category.label)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom CTA Bar */}
              <div className="px-6 py-3 bg-gradient-to-r from-stone-50 to-white border-t border-stone-200/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-500 font-light">
                    {t({ en: 'Need help choosing?', es: '¿Necesitas ayuda para elegir?' })}
                  </p>
                  <Link
                    href="/contact"
                    className="text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors flex items-center gap-1"
                  >
                    {t({ en: 'Contact an Expert', es: 'Contacta a un Experto' })}
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
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/about"
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm font-light transition-all duration-200",
            pathname === '/about' 
              ? "bg-stone-100/60 text-stone-900" 
              : "text-stone-700 hover:text-stone-900 hover:bg-stone-100/40"
          )}
        >
          <Info className="w-4 h-4 inline-block mr-2" />
          {t({ en: 'About', es: 'Acerca de' })}
        </Link>
        
        <Link
          href="/contact"
          className={cn(
            "px-4 py-2.5 rounded-lg text-sm font-light transition-all duration-200",
            pathname === '/contact' 
              ? "bg-stone-100/60 text-stone-900" 
              : "text-stone-700 hover:text-stone-900 hover:bg-stone-100/40"
          )}
        >
          <Phone className="w-4 h-4 inline-block mr-2" />
          {t({ en: 'Contact', es: 'Contacto' })}
        </Link>
      </div>
    </nav>
  )
}