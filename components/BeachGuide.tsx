'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

export interface BeachVenue {
  _id: string
  slug?: string
  name_en?: string
  name_es?: string
  summary_en?: string
  summary_es?: string
  venueType?: string
}
export interface BeachActivity {
  _id: string
  name_en?: string
  name_es?: string
  summary_en?: string
  summary_es?: string
}
export interface BeachShop {
  _id: string
  name: string
  summary_en?: string
  summary_es?: string
}

/**
 * The Beaches guide: Minitas — the resort's own beach — built from the
 * restaurants, activities and shops already in Studio, then the beaches
 * guests head to beyond the resort.
 */
export function BeachGuide({
  venues,
  activities,
  shops,
}: {
  venues: BeachVenue[]
  activities: BeachActivity[]
  shops: BeachShop[]
}) {
  const { locale, t } = useLocale()
  const pick = (a: any, f: string) => (locale === 'es' ? a?.[`${f}_es`] : a?.[`${f}_en`]) || a?.[`${f}_en`]

  const columns = [
    {
      key: 'eat',
      title: t({ en: 'Eat & drink', es: 'Comer y beber' }),
      items: venues.map((v) => ({
        id: v._id,
        name: pick(v, 'name'),
        body: pick(v, 'summary'),
        href: v.slug ? `/restaurants/${v.slug}` : undefined,
      })),
    },
    {
      key: 'water',
      title: t({ en: 'On the water', es: 'En el agua' }),
      items: activities.map((a) => ({ id: a._id, name: pick(a, 'name'), body: pick(a, 'summary'), href: undefined })),
    },
    {
      key: 'shops',
      title: t({ en: 'Shops', es: 'Tiendas' }),
      items: shops.map((s) => ({ id: s._id, name: s.name, body: pick(s, 'summary'), href: undefined })),
    },
  ].filter((c) => c.items.length > 0)

  const beyond = [
    {
      name: 'Bayahibe',
      body: t({
        en: 'A fishing village a short drive east, with calm, clear water and the boats out to the islands.',
        es: 'Un pueblo de pescadores a poca distancia al este, con agua tranquila y cristalina y los barcos hacia las islas.',
      }),
    },
    {
      name: 'Dominicus',
      body: t({
        en: 'A long stretch of white sand right next to Bayahibe.',
        es: 'Una larga playa de arena blanca junto a Bayahibe.',
      }),
    },
    {
      name: t({ en: 'Catalina Island', es: 'Isla Catalina' }),
      body: t({
        en: 'A short boat ride away — reefs for snorkelling and a quiet beach.',
        es: 'A un corto paseo en barco — arrecifes para hacer snorkel y una playa tranquila.',
      }),
    },
    {
      name: t({ en: 'Saona Island', es: 'Isla Saona' }),
      body: t({
        en: 'A day by boat to the national park’s palm-lined beaches and natural pools.',
        es: 'Un día en barco a las playas de palmeras y piscinas naturales del parque nacional.',
      }),
    },
  ]

  return (
    <>
      {/* Minitas — the resort's beach */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-line pb-6">
          <div className="lg:col-span-5">
            <span className="eyebrow">{t({ en: 'The resort’s beach', es: 'La playa del resort' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">Minitas</h2>
          </div>
          <p className="lg:col-span-7 text-body-strong font-light leading-relaxed">
            {t({
              en: 'Casa de Campo’s own beach: a calm, sheltered cove with loungers and umbrellas, the beach club for long lunches, cocktails at the bar and water sports right off the sand.',
              es: 'La playa propia de Casa de Campo: una cala tranquila y protegida con tumbonas y sombrillas, el club de playa para largos almuerzos, cócteles en el bar y deportes acuáticos desde la arena.',
            })}
          </p>
        </div>

        {columns.length > 0 && (
          <div className={`mt-10 grid grid-cols-1 gap-x-10 gap-y-12 ${columns.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {columns.map((c) => (
              <div key={c.key}>
                <h3 className="font-title text-2xl text-ink">{c.title}</h3>
                <ul className="mt-4 border-t border-line">
                  {c.items.map((it) => (
                    <li key={it.id} className="py-4 border-b border-line">
                      {it.href ? (
                        <Link
                          href={it.href}
                          className="font-title text-lg text-ink leading-tight decoration-1 underline-offset-4 hover:underline"
                        >
                          {it.name}
                        </Link>
                      ) : (
                        <p className="font-title text-lg text-ink leading-tight">{it.name}</p>
                      )}
                      {it.body && <p className="mt-1 text-sm text-muted font-light leading-relaxed">{it.body}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Beyond Minitas */}
      <section className="border-t border-line bg-sand/40">
        <div className="container mx-auto px-4 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="eyebrow">{t({ en: 'Beyond the resort', es: 'Más allá del resort' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t({ en: 'Beyond Minitas', es: 'Más allá de Minitas' })}
            </h2>
            <p className="mt-5 text-body-strong font-light leading-relaxed measure-lede">
              {t({
                en: 'Some of the Caribbean’s most beautiful beaches are a short drive or boat ride away. Boat days and transport can be arranged for you.',
                es: 'Algunas de las playas más bonitas del Caribe están a poca distancia en carro o en barco. Podemos organizar días en barco y transporte.',
              })}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-surface text-xs uppercase tracking-[0.16em] rounded-[2px] hover:bg-brand transition-colors"
            >
              {t({ en: 'Plan a beach day', es: 'Planear un día de playa' })}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <ul className="lg:col-span-7 border-t border-line">
            {beyond.map((b) => (
              <li key={b.name} className="py-6 border-b border-line">
                <p className="font-title text-2xl text-ink leading-tight">{b.name}</p>
                <p className="mt-1.5 text-muted font-light leading-relaxed">{b.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
