'use client'

import React from 'react'
import PropertyCard from './PropertyCard'

interface SimilarPropertiesProps {
  /** Already ranked and de-duplicated on the server (see getSimilarProperties). */
  properties: any[]
  /** Lead "both" listings with their sale side when the current house is for sale. */
  mode?: 'rental' | 'sale'
  locale?: 'en' | 'es'
}

/** "Similar houses" at the bottom of a property page: a grid of up to six. */
export default function SimilarProperties({ properties, mode = 'rental', locale = 'en' }: SimilarPropertiesProps) {
  const t = (text: { en: string; es: string }) => text[locale]

  if (properties.length === 0) return null

  return (
    <section className="py-8">
      <div className="flex flex-col gap-2 mb-8 border-b border-line pb-4">
        <span className="eyebrow">{t({ en: 'You might also like', es: 'También te puede gustar' })}</span>
        <h2 className="font-title text-2xl lg:text-3xl text-ink">{t({ en: 'Similar houses', es: 'Casas similares' })}</h2>
      </div>

      {/* 2 columns on mobile, 3 on desktop — 2 rows of 3 at most. */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6">
        {properties.slice(0, 6).map((property) => (
          <PropertyCard key={property._id} property={property} locale={locale} variant="rail" mode={mode} />
        ))}
      </div>
    </section>
  )
}
