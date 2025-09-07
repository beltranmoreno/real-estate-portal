'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import LanguageSwitcher from './LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { Menu, X, Home, Search, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { t } = useLocale()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    {
      label: { en: 'Home', es: 'Inicio' },
      href: '/',
      icon: Home
    },
    {
      label: { en: 'Search', es: 'Buscar' },
      href: '/search',
      icon: Search
    },
    {
      label: { en: 'Contact', es: 'Contacto' },
      href: '/contact',
      icon: Phone
    }
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg" />
            <span className="text-xl font-bold text-slate-900">
              Caribbean Estates
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {t(item.label)}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="minimal" />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isMenuOpen ? "max-h-64 py-4" : "max-h-0"
        )}>
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <item.icon className="w-5 h-5 text-slate-600" />
                <span className="text-slate-900">{t(item.label)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}