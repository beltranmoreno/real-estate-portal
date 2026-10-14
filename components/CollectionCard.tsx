'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'

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

/**
 * Homepage / discovery card for a public collection. Image is the card;
 * title, optional description and residence count sit on the page ground
 * beneath it. Links to the public collection page.
 */
export default function CollectionCard({ collection }: { collection: CollectionCardData }) {
  const { locale, t } = useLocale()

  const title = (locale === 'es' ? collection.title_es : collection.title_en) || ''
  const description = locale === 'es' ? collection.description_es : collection.description_en
  const count = collection.propertyCount ?? 0
  const typeLabel = t(
    (collection.collectionType && TYPE_LABELS[collection.collectionType]) ||
      { en: 'Collection', es: 'Colección' }
  )

  return (
    <Link href={`/collection/${collection.slug}`} className="group block">
      <div className="relative aspect-[4/3] bg-sand overflow-hidden">
        {collection.coverImage && (
          <Image
            src={urlFor(collection.coverImage).width(800).height(600).url()}
            alt={title}
            fill
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      <div className="mt-4">
        <p className="eyebrow mb-2">{typeLabel}</p>
        <h3 className="font-title text-xl text-ink leading-tight decoration-1 underline-offset-4 group-hover:underline">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-muted font-light leading-relaxed line-clamp-2">
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
