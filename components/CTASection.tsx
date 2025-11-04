'use client'

import React from 'react'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { Button } from '@/components/ui/button'

interface CTASectionProps {
  title?: {
    en: string
    es: string
  }
  description?: {
    en: string
    es: string
  }
  primaryButton?: {
    text: { en: string; es: string }
    href: string
  }
  secondaryButton?: {
    text: { en: string; es: string }
    href: string
  }
  className?: string
}

export default function CTASection({
  title = {
    en: 'Ready to Find Your Dream Property?',
    es: '¿Listo para Encontrar la Propiedad de tus Sueños?'
  },
  description = {
    en: 'Let us help you discover the perfect home in the Caribbean',
    es: 'Déjanos ayudarte a descubrir el hogar perfecto en el Caribe'
  },
  primaryButton = {
    text: { en: 'Browse All Properties', es: 'Ver Todas las Propiedades' },
    href: '/search'
  },
  secondaryButton = {
    text: { en: 'Get in Touch', es: 'Ponte en Contacto' },
    href: '/contact'
  },
  className = ''
}: CTASectionProps) {
  const { locale, t } = useLocale()

  return (
    <section className={`py-20 bg-gradient-to-br from-blue-900/80 to-cyan-900/80 ${className}`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-light mb-4 text-white">
          {locale === 'es' ? title.es : title.en}
        </h2>
        <p className="text-xl mb-8 text-blue-50 max-w-2xl mx-auto">
          {locale === 'es' ? description.es : description.en}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={primaryButton.href}>
            <Button size="lg" variant="default">
              {locale === 'es' ? primaryButton.text.es : primaryButton.text.en}
            </Button>
          </Link>
          <Link href={secondaryButton.href}>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
              {locale === 'es' ? secondaryButton.text.es : secondaryButton.text.en}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
