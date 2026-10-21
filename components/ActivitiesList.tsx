'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'

export interface ActivityItem {
  _id: string
  name_en?: string
  name_es?: string
  category?: string
  summary_en?: string
  summary_es?: string
  image?: any
  where?: { name_en?: string; name_es?: string } | null
}

const CATEGORIES: { value: string; en: string; es: string }[] = [
  { value: 'sports', en: 'Sports', es: 'Deportes' },
  { value: 'water', en: 'On the water', es: 'En el agua' },
  { value: 'land', en: 'On land', es: 'En tierra' },
  { value: 'excursion', en: 'Excursions', es: 'Excursiones' },
  { value: 'shopping', en: 'Shopping', es: 'Compras' },
  { value: 'family', en: 'For families', es: 'Para familias' },
]

/**
 * Activities from Studio (Local Guide → Activities), grouped by category as
 * hairline-ruled lists. Each entry: optional photo, name, where it happens,
 * and a one-line description.
 */
export function ActivitiesList({ activities }: { activities: ActivityItem[] }) {
  const { locale, t } = useLocale()
  const pick = (a: any, f: string) => (locale === 'es' ? a?.[`${f}_es`] : a?.[`${f}_en`]) || a?.[`${f}_en`]

  const groups = [
    ...CATEGORIES,
    { value: '__other', en: 'More', es: 'Más' },
  ]
    .map((c) => ({
      ...c,
      items: activities.filter((a) =>
        c.value === '__other' ? !CATEGORIES.some((k) => k.value === a.category) : a.category === c.value
      ),
    }))
    .filter((g) => g.items.length > 0)

  if (groups.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-16 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <span className="eyebrow">{t({ en: 'Things to do', es: 'Qué hacer' })}</span>
          <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
            {t({ en: 'Activities in Casa de Campo', es: 'Actividades en Casa de Campo' })}
          </h2>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink border-b border-line pb-1 hover:border-ink transition-colors"
        >
          {t({ en: 'Ask us to arrange one', es: 'Pídenos que lo organicemos' })}
          <ArrowRight className="w-3.5 h-3.5" aria-hidden />
        </Link>
      </div>

      <div className="mt-12 space-y-14">
        {groups.map((g) => (
          <div key={g.value} id={g.value} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 scroll-mt-28">
            <h3 className="lg:col-span-3 font-title text-2xl text-ink">{t({ en: g.en, es: g.es })}</h3>
            <ul className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-x-10 border-t border-line">
              {g.items.map((a) => {
                const where = pick(a.where, 'name')
                const summary = pick(a, 'summary')
                return (
                  <li key={a._id} className="py-6 border-b border-line">
                    {a.image?.asset && (
                      <div className="relative aspect-[3/2] w-full overflow-hidden bg-sand mb-4">
                        <Image
                          src={urlFor(a.image).width(900).height(600).fit('crop').url()}
                          alt={a.image?.alt || pick(a, 'name') || ''}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <p className="font-title text-xl text-ink leading-tight">{pick(a, 'name')}</p>
                    {where && <p className="mt-1 eyebrow !tracking-[0.16em]">{where}</p>}
                    {summary && (
                      <p className="mt-2 text-sm text-muted font-light leading-relaxed">{summary}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
