'use client'

import { SectionHeader } from '@/components/ui/section-header'
import CollectionCard, { type CollectionCardData } from './CollectionCard'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

interface CollectionsRailProps {
  collections: CollectionCardData[]
  title?: { en: string; es: string }
  subtitle?: { en: string; es: string }
  className?: string
}

/**
 * Homepage section showing curated, publicly-discoverable collections. Renders
 * nothing when there are no public collections, so the homepage stays clean
 * until Leticia publishes one.
 */
export default function CollectionsRail({
  collections,
  title,
  subtitle,
  className,
}: CollectionsRailProps) {
  const { t } = useLocale()

  if (!collections || collections.length === 0) return null

  return (
    <section className={cn('py-14 lg:py-20', className)}>
      <div className="container mx-auto px-4">
        <SectionHeader
          eyebrow={t(subtitle ?? { en: 'Curated', es: 'Curadas' })}
          title={t(title ?? { en: 'Collections', es: 'Colecciones' })}
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
          {collections.map((collection) => (
            <CollectionCard key={collection._id} collection={collection} />
          ))}
        </div>
      </div>
    </section>
  )
}
