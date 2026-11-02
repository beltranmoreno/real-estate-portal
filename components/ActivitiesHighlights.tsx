'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import type { ActivityGroup } from '@/lib/activities'

const PER_GROUP = 4

/**
 * Homepage teaser for the Activities guide: a few activities per Activity
 * group, each column linking to its section of /info/activities.
 */
export function ActivitiesHighlights({ groups }: { groups: ActivityGroup[] }) {
  const { locale, t } = useLocale()
  const name = (a: { name_en?: string; name_es?: string }) => (locale === 'es' ? a.name_es : a.name_en) || a.name_en || a.name_es

  if (groups.length === 0) return null

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-line pb-8">
          <div className="lg:col-span-5">
            <span className="eyebrow">{t({ en: 'Things to do', es: 'Qué hacer' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t({ en: 'Days well spent.', es: 'Días bien aprovechados.' })}
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-body-strong font-light leading-relaxed">
              {t({
                en: 'From Pete Dye golf courses to tennis, padel and the shooting center, there’s plenty to explore. Set out by boat from La Marina, discover nearby islands, or take time to browse the shops.',
                es: 'Desde los campos de golf de Pete Dye hasta el tenis, el pádel y el centro de tiro, hay mucho por descubrir. Sal en barco desde La Marina, conoce las islas cercanas o tómate tu tiempo para recorrer las tiendas.',
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

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10">
          {groups.map((g) => (
            <Link key={g._id} href={`/info/activities#${g.slug}`} className="group block">
              <h3 className="font-title text-xl text-ink decoration-1 underline-offset-4 group-hover:underline">
                {name(g)}
              </h3>
              <ul className="mt-3 border-t border-line">
                {g.activities.slice(0, PER_GROUP).map((a) => (
                  <li key={a._id} className="py-2.5 border-b border-line text-sm text-muted font-light">
                    {name(a)}
                  </li>
                ))}
                {g.activities.length > PER_GROUP && (
                  <li className="py-2.5 text-xs uppercase tracking-[0.14em] text-muted-2">
                    + {g.activities.length - PER_GROUP} {t({ en: 'more', es: 'más' })}
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
