'use client'

import React, { useEffect, useState } from 'react'
import SearchBar from './SearchBarWrapper'
import { cn } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'

interface HeroProps {
  className?: string
}

export default function Hero({ className }: HeroProps) {
  const { locale } = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const headlines = {
    es: {
      title: 'Descubre tu estancia',
      subtitle: 'Vive la experiencia Casa de Campo'
    },
    en: {
      title: 'Discover Your Stay',
      subtitle: 'Exclusive villas and services in Casa de Campo'
    }
  }

  const content = headlines[locale]

  return (
    <section className={cn("relative h-auto max-h-[700px] overflow-hidden", className)}>
      {/* Luxury Off-White Background */}
      <div className="absolute inset-0">
        {/* Primary off-white gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-stone-100" />

        {/* Elegant radial gradients for depth */}
        <div className="absolute inset-0">
          {/* Main radial gradient from center */}
          <div className="absolute inset-0 bg-gradient-radial from-white/60 via-transparent to-transparent opacity-70"
            style={{
              background: 'radial-gradient(ellipse 800px 600px at center 30%, rgba(255,255,255,0.4) 0%, transparent 50%)'
            }} />

          {/* Secondary radial gradient from top-right */}
          <div className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse 600px 400px at 80% 20%, rgba(245,245,244,0.6) 0%, transparent 40%)'
            }} />

          {/* Tertiary subtle gradient from bottom-left */}
          <div className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(ellipse 500px 300px at 20% 80%, rgba(250,250,249,0.8) 0%, transparent 35%)'
            }} />
        </div>

        {/* Refined texture overlay */}
        <div className="absolute inset-0 opacity-[0.012]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='luxury-pattern' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cg fill='none' stroke='%23000000' stroke-width='0.3' opacity='0.08'%3E%3Cpath d='M20 5l12 12-12 12-12-12z'/%3E%3Cpath d='M20 25l8 8-8 8-8-8z'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23luxury-pattern)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Subtle paper-like texture */}
        <div className="absolute inset-0 opacity-[0.008]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`
          }} />

        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/15 backdrop-blur-[0.5px]" />

        {/* Refined accent lines */}
        <div className="absolute top-0 left-1/4 w-[0.5px] h-full bg-gradient-to-b from-stone-300/30 via-stone-200/8 to-transparent" />
        <div className="absolute top-0 right-1/3 w-[0.5px] h-full bg-gradient-to-b from-stone-300/20 via-stone-200/5 to-transparent" />

        {/* Subtle light reflection effect */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/30 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="container mx-auto px-4 text-center">
            {/* Luxury Typography */}
            {/* <div className={cn(
              "mb-12 mt-24 transform transition-all duration-1000 ease-out",
              mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            )}>
              <h1 className="text-4xl lg:text-6xl font-extralight text-stone-800 tracking-tight leading-tight max-w-4xl mx-auto">
                {content.title}
              </h1>
              {content.subtitle && (
                <p className="text-md md:text-lg text-stone-600 leading-relaxed max-w-4xl mx-auto font-light">
                  {content.subtitle}
                </p>
              )}
            </div> */}

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
          "py-8 transform transition-all duration-1000 ease-out delay-500",
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        )}>
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center gap-16 lg:gap-24">
              {[
                { value: '25+', label: locale === 'es' ? 'Propiedades Exclusivas' : 'Exclusive Properties' },
                { value: '500+', label: locale === 'es' ? 'Clientes Satisfechos' : 'Happy Clients' },
                { value: '24/7', label: locale === 'es' ? 'Servicio Personal' : 'Personal Service' },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl lg:text-3xl font-light text-stone-800 mb-1 tracking-wide">
                    {stat.value}
                  </div>
                  <div className="text-xs lg:text-sm text-stone-500 font-light tracking-wider uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal geometric bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-300/40 to-transparent" />
    </section>
  )
}