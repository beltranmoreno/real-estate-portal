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
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-b border-slate-700/50 shadow-xl transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg shadow-lg" />
            <span className="text-xl font-bold text-white">
              Leticia Coudray Real Estate
            </span>
          </Link>

          

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50"
              >
                <item.icon className="w-4 h-4" />
                {t(item.label)}
              </Link>
            ))}
          </div>
            <LanguageSwitcher variant="minimal" />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-300 hover:text-white"
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <item.icon className="w-5 h-5 text-slate-300" />
                <span className="text-white">{t(item.label)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}