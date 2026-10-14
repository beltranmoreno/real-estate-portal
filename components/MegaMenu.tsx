'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MegaMenuProps {
  locale?: 'en' | 'es'
  /** True while the navbar is transparent over the hero — items go white. */
  onDark?: boolean
}

// The only grouped item: "The Resort" opens a slim text dropdown of the
// resort's explore pages. Everything else is a direct link.
const RESORT_ITEMS: { label: { en: string; es: string }; href: string }[] = [
  { label: { en: 'Restaurants', es: 'Restaurantes' }, href: '/restaurants' },
  { label: { en: 'Golf Courses', es: 'Campos de Golf' }, href: '/courses' },
  { label: { en: 'Beaches', es: 'Playas' }, href: '/info/beaches' },
  { label: { en: 'Activities', es: 'Actividades' }, href: '/info/activities' },
]

export default function MegaMenu({ locale = 'en', onDark = false }: MegaMenuProps) {
  const [openResort, setOpenResort] = useState(false)
  const pathname = usePathname()

  const t = (text: { en: string; es: string }) => text[locale]

  // Nav item styling across the three navbar states.
  const navItem = (active: boolean) =>
    cn(
      'flex items-center gap-1.5 px-3 py-2 text-xs font-light uppercase tracking-[0.14em] transition-colors duration-200 border-b border-transparent',
      onDark
        ? 'text-white/85 hover:text-white group-hover/nav:text-body-strong group-hover/nav:hover:text-ink'
        : 'text-body-strong hover:text-ink',
      active && !onDark && 'text-ink border-brand',
      active && onDark && 'group-hover/nav:border-brand'
    )

  const residencesActive =
    pathname.startsWith('/search') || pathname.startsWith('/property')
  const resortActive = ['/restaurants', '/courses', '/info'].some((p) =>
    pathname.startsWith(p)
  )

  return (
    <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
      <Link href="/search" className={navItem(residencesActive)}>
        {t({ en: 'Residences', es: 'Residencias' })}
      </Link>

      {/* The Resort — slim dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setOpenResort(true)}
        onMouseLeave={() => setOpenResort(false)}
      >
        <button className={navItem(resortActive || openResort)}>
          <span>{t({ en: 'The Resort', es: 'El Resort' })}</span>
          <ChevronDown
            className={cn('w-3 h-3 transition-transform duration-200', openResort && 'rotate-180')}
          />
        </button>

        {openResort && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-surface border border-line rounded-none shadow-[var(--shadow-float)] py-2 animate-in fade-in slide-in-from-top-1 duration-150">
            {RESORT_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-5 py-2.5 text-sm font-light text-body-strong hover:bg-sand/50 hover:text-ink transition-colors"
              >
                {t(item.label)}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link href="/services/concierge" className={navItem(pathname.startsWith('/services'))}>
        {t({ en: 'Concierge', es: 'Conserjería' })}
      </Link>

      <Link href="/about" className={navItem(pathname === '/about')}>
        {t({ en: 'About', es: 'Nosotros' })}
      </Link>
    </nav>
  )
}
