'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

export interface CollectionCardData {
  _id: string
  slug: string
  title_en?: string
  title_es?: string
  description_en?: string
  description_es?: string
  collectionType?: string
  coverImage?: any
  propertyCount?: number
}

const TYPE_LABELS: Record<string, { en: string; es: string }> = {
  wedding: { en: 'Wedding', es: 'Boda' },
  corporate: { en: 'Corporate', es: 'Corporativo' },
  'family-reunion': { en: 'Family reunion', es: 'Reunión familiar' },
  group: { en: 'Group travel', es: 'Viaje en grupo' },
  seasonal: { en: 'Seasonal', es: 'Temporada' },
  curated: { en: 'Curated selection', es: 'Selección curada' },
  offer: { en: 'Special offer', es: 'Oferta especial' },
}

interface CollectionCardProps {
  collection: CollectionCardData
  /** Position in a sequence. When set, the eyebrow reads "No. 01" instead of the type. */
  index?: number
  /** `lead` fills a double-size grid cell: taller image, larger title, full description. */
  variant?: 'default' | 'lead'
  className?: string
}

/**
 * Homepage / discovery card for a public collection. Image is the card;
 * title, optional description and residence count sit on the page ground
 * beneath it. Links to the public collection page.
 */
export default function CollectionCard({
  collection,
  index,
  variant = 'default',
  className,
}: CollectionCardProps) {
  const { locale, t } = useLocale()
  const isLead = variant === 'lead'

  const title = (locale === 'es' ? collection.title_es : collection.title_en) || ''
  const description = locale === 'es' ? collection.description_es : collection.description_en
  const count = collection.propertyCount ?? 0
  const eyebrow =
    typeof index === 'number'
      ? `No. ${String(index + 1).padStart(2, '0')}`
      : t(
          (collection.collectionType && TYPE_LABELS[collection.collectionType]) ||
            { en: 'Collection', es: 'Colección' }
        )

  return (
    <Link
      href={`/collection/${collection.slug}`}
      className={cn('group block', isLead && 'flex flex-col', className)}
    >
      <div
        className={cn(
          'relative bg-sand overflow-hidden',
          isLead ? 'aspect-[4/3] md:aspect-[16/10] lg:aspect-auto lg:flex-1 lg:min-h-[420px]' : 'aspect-[4/3]'
        )}
      >
        {collection.coverImage && (
          <Image
            src={
              isLead
                ? urlFor(collection.coverImage).width(1600).height(1100).url()
                : urlFor(collection.coverImage).width(800).height(600).url()
            }
            alt={title}
            fill
            className="object-cover"
            sizes={
              isLead
                ? '(max-width: 768px) 100vw, 66vw'
                : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
          />
        )}
      </div>

      <div className="mt-4">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h3
          className={cn(
            'font-title text-ink leading-tight decoration-1 underline-offset-4 group-hover:underline',
            isLead ? 'text-2xl lg:text-3xl' : 'text-xl'
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'mt-2 text-muted font-light leading-relaxed',
              isLead ? 'text-base max-w-xl' : 'text-sm line-clamp-2'
            )}
          >
            {description}
          </p>
        )}
        <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-2 font-light">
          {count}{' '}
          {count === 1
            ? t({ en: 'residence', es: 'residencia' })
            : t({ en: 'residences', es: 'residencias' })}
        </p>
      </div>
    </Link>
  )
}
