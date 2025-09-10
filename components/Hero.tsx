'use client'

import React, { useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import { cn } from '@/lib/utils'

interface HeroProps {
  locale?: 'es' | 'en'
  className?: string
}

export default function Hero({ locale = 'en', className }: HeroProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const headlines = {
    es: {
      title: 'Propiedades de Lujo',
      subtitle: 'en el Caribe',
      description: 'Descubre residencias exclusivas en las ubicaciones más privilegiadas de República Dominicana',
      cta: 'Leticia Coudray Real Estate'
    },
    en: {
      title: 'Luxury Properties',
      subtitle: 'in the Caribbean',
      description: 'Discover exclusive residences in the most beautiful locations of Dominican Republic',
      cta: 'Leticia Coudray Real Estate'
    }
  }

  const content = headlines[locale]

  return (
    <section className={cn("relative min-h-[100vh] overflow-hidden", className)}>
      {/* Luxury Background with geometric patterns */}
      <div className="absolute inset-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        
        {/* Elegant geometric overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M50 5l15 15-15 15-15-15z' opacity='0.3'/%3E%3Cpath d='M50 35l15 15-15 15-15-15z' opacity='0.2'/%3E%3Cpath d='M50 65l15 15-15 15-15-15z' opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        
        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20" />
        
        {/* Elegant light beam effect */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-white/10 via-white/3 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-[100vh]">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            {/* Luxury Typography */}
            <div className={cn(
              "my-12 transform transition-all duration-1000 ease-out",
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              {/* Elegant subtitle first */}
              <div className="text-sm lg:text-base tracking-[0.2em] text-slate-300 uppercase font-light mb-6">
                {content.cta}
              </div>
              
              {/* Main headline with luxury spacing */}
              <h1 className="text-5xl lg:text-8xl font-light text-white mb-4 tracking-tight leading-[0.9]">
                {content.title}
              </h1>
              
              {/* Elegant subtitle */}
              <h2 className="text-3xl lg:text-5xl font-extralight text-slate-200 mb-8 tracking-wide">
                {content.subtitle}
              </h2>
              
              {/* Refined description */}
              <p className="text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
                {content.description}
              </p>
            </div>

            {/* Luxury Search Bar */}
            <div className={cn(
              "transform transition-all duration-1000 ease-out delay-300",
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <SearchBar variant="hero" locale={locale} />
            </div>
          </div>
        </div>

        {/* Minimal Stats - Bottom positioned */}
        <div className={cn(
          "py-16 transform transition-all duration-1000 ease-out delay-500",
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center gap-16 lg:gap-24">
              {[
                { value: '100+', label: locale === 'es' ? 'Propiedades Exclusivas' : 'Exclusive Properties' },
                { value: '15+', label: locale === 'es' ? 'Ubicaciones Premium' : 'Premium Locations' },
                { value: '24/7', label: locale === 'es' ? 'Servicio Personal' : 'Personal Service' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-light text-white mb-1 tracking-wide">
                    {stat.value}
                  </div>
                  <div className="text-xs lg:text-sm text-slate-400 font-light tracking-wider uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal geometric bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  )
}