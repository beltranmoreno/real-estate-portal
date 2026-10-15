'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

export interface HighlightActivity {
  _id: string
  name_en?: string
  name_es?: string
  category?: string
}

const CATEGORIES: { value: string; en: string; es: string }[] = [
  { value: 'sports', en: 'Sports', es: 'Deportes' },
  { value: 'water', en: 'On the water', es: 'En el agua' },
  { value: 'land', en: 'On land', es: 'En tierra' },
  { value: 'excursion', en: 'Excursions', es: 'Excursiones' },
  { value: 'shopping', en: 'Shopping', es: 'Compras' },
  { value: 'family', en: 'For families', es: 'Para familias' },
]

const PER_CATEGORY = 4

/**
 * Homepage teaser for the Activities guide: a few activities per category,
 * each column linking to its section of /info/activities.
 */
export function ActivitiesHighlights({ activities }: { activities: HighlightActivity[] }) {
  const { locale, t } = useLocale()
  const name = (a: HighlightActivity) => (locale === 'es' ? a.name_es : a.name_en) || a.name_en

  const groups = CATEGORIES.map((c) => ({
    ...c,
    items: activities.filter((a) => a.category === c.value),
  })).filter((g) => g.items.length > 0)

  if (groups.length === 0) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-line pb-8">
          <div className="lg:col-span-5">
            <span className="eyebrow">{t({ en: 'Things to do', es: 'Qué hacer' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t({ en: 'Days worth filling.', es: 'Días que vale la pena llenar.' })}
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-body-strong font-light leading-relaxed">
              {t({
                en: 'Three Pete Dye courses, the shooting center, tennis and padel, boats from La Marina and days out to the islands — with shopping in between.',
                es: 'Tres campos de Pete Dye, el centro de tiro, tenis y pádel, barcos desde La Marina y excursiones a las islas — con compras entre medio.',
              })}
            </p>
            <Link
              href="/info/activities"
              className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink border-b border-line pb-1 hover:border-ink transition-colors"
            >
              {t({ en: 'All activities', es: 'Todas las actividades' })}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10">
          {groups.slice(0, 5).map((g) => (
            <Link key={g.value} href={`/info/activities#${g.value}`} className="group block">
              <h3 className="font-title text-xl text-ink decoration-1 underline-offset-4 group-hover:underline">
                {t({ en: g.en, es: g.es })}
              </h3>
              <ul className="mt-3 border-t border-line">
                {g.items.slice(0, PER_CATEGORY).map((a) => (
                  <li key={a._id} className="py-2.5 border-b border-line text-sm text-muted font-light">
                    {name(a)}
                  </li>
                ))}
                {g.items.length > PER_CATEGORY && (
                  <li className="py-2.5 text-xs uppercase tracking-[0.14em] text-muted-2">
                    + {g.items.length - PER_CATEGORY} {t({ en: 'more', es: 'más' })}
                  </li>
                )}
              </ul>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
