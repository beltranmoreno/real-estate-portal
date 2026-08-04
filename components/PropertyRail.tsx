'use client'

import React from 'react'
import Link from 'next/link'
import PropertyCard from './PropertyCard'
import { SectionHeader } from '@/components/ui/section-header'
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
    <section className={cn("py-14 lg:py-20", className)}>
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={subtitle ? t(title) : undefined}
          title={subtitle ? t(subtitle) : t(title)}
          action={
            viewAllLink ? (
              <Link
                href={viewAllLink}
                className="group inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-brand border-b border-brand-line pb-1 hover:border-brand transition-colors"
              >
                {t({ en: 'View all', es: 'Ver todos' })}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : null
          }
        />

        {/* Properties Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-10">
          {properties.slice(0, 4).map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              locale={locale}
              variant="rail"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
