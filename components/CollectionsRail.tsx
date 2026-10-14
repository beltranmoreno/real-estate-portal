'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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
 * Homepage editorial section for curated, publicly-discoverable collections:
 * the "why book through Leticia" argument. An intro block, then a grid where
 * the first collection leads at double size. Renders nothing when there are no
 * public collections, so the homepage stays clean until Leticia publishes one.
 */
export default function CollectionsRail({
  collections,
  title,
  subtitle,
  className,
}: CollectionsRailProps) {
  const { t } = useLocale()

  if (!collections || collections.length === 0) return null

  const [lead, ...rest] = collections

  return (
    <section id="collections" className={cn('py-16 lg:py-24 scroll-mt-16', className)}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end border-b border-line pb-8">
          <div className="lg:col-span-5">
            <span className="eyebrow">
              {t(subtitle ?? { en: 'Only through Leticia', es: 'Solo con Leticia' })}
            </span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t(title ?? { en: 'Edited, not listed.', es: 'Seleccionadas, no listadas.' })}
            </h2>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-body-strong font-light leading-relaxed">
              {t({
                en: 'Booking sites show you everything. These are Leticia’s shortlists, the ones a friend gets when they ask where to stay: homes Leticia knows personally, grouped by the kind of trip they do best.',
                es: 'Los portales de reservas te muestran todo. Estas son las listas que Leticia envía cuando un amigo le pregunta dónde quedarse: casas que conoce personalmente, agrupadas según el tipo de viaje que mejor hacen.',
              })}
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 text-sm text-ink underline decoration-line underline-offset-4 hover:decoration-ink transition-colors"
            >
              {t({
                en: 'Planning a wedding or group trip? Ask for a private collection',
                es: '¿Planeas una boda o un viaje en grupo? Pide una colección privada',
              })}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
          <CollectionCard
            collection={lead}
            index={0}
            variant="lead"
            className="md:col-span-2 lg:row-span-2"
          />
          {rest.map((collection, i) => (
            <CollectionCard key={collection._id} collection={collection} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  )
}
