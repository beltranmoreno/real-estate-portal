'use client'

import React from 'react'
import SearchBar from './SearchBar'
import { cn } from '@/lib/utils'

interface HeroProps {
  locale?: 'es' | 'en'
  className?: string
}

export default function Hero({ locale = 'en', className }: HeroProps) {
  const headlines = {
    es: {
      title: 'Encuentra tu hogar perfecto en el Caribe',
      subtitle: 'Propiedades exclusivas en las mejores ubicaciones de República Dominicana',
      cta: 'Descubre propiedades increíbles para tus próximas vacaciones o inversión'
    },
    en: {
      title: 'Find Your Perfect Caribbean Home',
      subtitle: 'Exclusive properties in the best locations of Dominican Republic',
      cta: 'Discover amazing properties for your next vacation or investment'
    }
  }

  const content = headlines[locale]

  return (
    <section className={cn("relative min-h-[600px] lg:min-h-[700px]", className)}>
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Pattern overlay for texture */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-28">
        <div className="text-center text-white mb-12 lg:mb-16">
          {/* Main headline */}
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            {content.title}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl lg:text-2xl font-light mb-4 text-blue-50 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
          
          {/* CTA text */}
          <p className="text-base lg:text-lg text-blue-100 max-w-2xl mx-auto">
            {content.cta}
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar variant="hero" locale={locale} />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          {[
            { value: '500+', label: locale === 'es' ? 'Propiedades' : 'Properties' },
            { value: '15+', label: locale === 'es' ? 'Ubicaciones' : 'Locations' },
            { value: '98%', label: locale === 'es' ? 'Satisfacción' : 'Satisfaction' },
            { value: '24/7', label: locale === 'es' ? 'Soporte' : 'Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="text-3xl lg:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm lg:text-base text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 lg:h-20 fill-white"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path d="M0,50 C360,100 1080,0 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </section>
  )
}