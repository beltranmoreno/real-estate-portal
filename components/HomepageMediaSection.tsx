'use client'

import MediaSwiper from '@/components/MediaSwiper'
import { SectionHeader } from '@/components/ui/section-header'
import { useLocale } from '@/contexts/LocaleContext'

export interface HomepageMediaImage {
  _id: string
  image: any
  location?: { name_en?: string; name_es?: string } | null
}

/**
 * Homepage photo carousel fed by Featured Media docs (fetched server-side in
 * the homepage). Renders nothing when there are no photos.
 */
export default function HomepageMediaSection({ images }: { images: HomepageMediaImage[] }) {
  const { locale, t } = useLocale()

  if (!images || images.length === 0) {
    return null
  }

  const slides = images.map((item) => {
    const location =
      (locale === 'es' ? item.location?.name_es : item.location?.name_en) ||
      item.location?.name_en ||
      undefined
    return {
      _id: item._id,
      image: item.image,
      alt: item.image?.alt || location,
      location,
    }
  })

  return (
    <section className="py-16 lg:py-24 bg-canvas">
      <div className="container mx-auto px-4 mb-10">
        <SectionHeader
          eyebrow={t({ en: 'Casa de Campo', es: 'Casa de Campo' })}
          title={t({ en: 'Life at the resort', es: 'La vida en el resort' })}
        />
      </div>
      <MediaSwiper images={slides} aspectRatio="landscape" className="w-full" />
    </section>
  )
}
