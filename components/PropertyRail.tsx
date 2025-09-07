'use client'

import React from 'react'
import Link from 'next/link'
import PropertyCard from './PropertyCard'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

interface PropertyRailProps {
  title: { en: string; es: string }
  subtitle?: { en: string; es: string }
  properties: any[]
  viewAllLink?: string
  className?: string
}

export default function PropertyRail({
  title,
  subtitle,
  properties,
  viewAllLink,
  className
}: PropertyRailProps) {
  const { locale, t } = useLocale()

  if (!properties || properties.length === 0) {
    return null
  }

  return (
    <section className={cn("py-12 lg:py-16", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              {t(title)}
            </h2>
            {subtitle && (
              <p className="text-lg text-slate-600">
                {t(subtitle)}
              </p>
            )}
          </div>
          
          {viewAllLink && (
            <Link href={viewAllLink}>
              <Button variant="outline" className="group">
                {t({ en: 'View All', es: 'Ver Todos' })}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.slice(0, 4).map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  )
}