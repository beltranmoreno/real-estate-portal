'use client'

import { ArrowUpRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

export interface ShopItem {
  _id: string
  name: string
  location?: string
  category?: string
  summary_en?: string
  summary_es?: string
  hours?: string
  website?: string
}

const LOCATIONS: { value: string; en: string; es: string }[] = [
  { value: 'marina', en: 'La Marina', es: 'La Marina' },
  { value: 'altos-de-chavon', en: 'Altos de Chavón', es: 'Altos de Chavón' },
  { value: 'hotel', en: 'At the hotel', es: 'En el hotel' },
  { value: 'beach', en: 'Minitas Beach', es: 'Playa Minitas' },
  { value: 'golf', en: 'Golf courses', es: 'Campos de golf' },
  { value: 'sports', en: 'Sports facilities', es: 'Instalaciones deportivas' },
]

const CATEGORY: Record<string, { en: string; es: string }> = {
  fashion: { en: 'Fashion', es: 'Moda' },
  resortwear: { en: 'Swim & resortwear', es: 'Baño y resort' },
  jewelry: { en: 'Jewelry', es: 'Joyería' },
  art: { en: 'Art & crafts', es: 'Arte y artesanía' },
  home: { en: 'Home & linens', es: 'Hogar y lencería' },
  gifts: { en: 'Gifts & souvenirs', es: 'Regalos y recuerdos' },
  cigars: { en: 'Cigars', es: 'Cigarros' },
  wine: { en: 'Wine & spirits', es: 'Vinos y licores' },
  groceries: { en: 'Groceries & market', es: 'Supermercado' },
  sports: { en: 'Sports & pro shop', es: 'Deportes' },
  other: { en: 'Shop', es: 'Tienda' },
}

/**
 * Shops in the resort (Local Guide → Shops), grouped by location — a compact,
 * three-column directory under the activities on the Activities guide.
 */
export function ShopsList({ shops }: { shops: ShopItem[] }) {
  const { locale, t } = useLocale()

  const groups = [...LOCATIONS, { value: '__other', en: 'Elsewhere', es: 'Otros' }]
    .map((l) => ({
      ...l,
      items: shops.filter((s) =>
        l.value === '__other' ? !LOCATIONS.some((k) => k.value === s.location) : s.location === l.value
      ),
    }))
    .filter((g) => g.items.length > 0)

  if (groups.length === 0) return null

  return (
    <section id="shopping" className="border-t border-line bg-sand/40 scroll-mt-24">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-line pb-6">
          <div className="lg:col-span-5">
            <span className="eyebrow">{t({ en: 'Shopping', es: 'Compras' })}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
              {t({ en: 'Shops in the resort', es: 'Tiendas en el resort' })}
            </h2>
          </div>
          <p className="lg:col-span-7 text-body-strong font-light leading-relaxed">
            {t({
              en: 'La Marina is the heart of it: Saint-Tropez swimwear and resortwear, Italian fashion, art galleries, wine shops and a full supermarket. Up in Altos de Chavón you’ll find fine jewelry, amber and larimar, handmade espadrilles and linens, and local crafts. The hotel has hand-rolled Dominican cigars and resort boutiques, and the pro shops cover golf, tennis and shooting.',
              es: 'La Marina es el corazón: trajes de baño y ropa de resort de Saint-Tropez, moda italiana, galerías de arte, tiendas de vinos y un supermercado completo. En Altos de Chavón encontrarás alta joyería, ámbar y larimar, alpargatas y lencería hechas a mano, y artesanía local. El hotel tiene cigarros dominicanos enrollados a mano y boutiques de resort, y las pro shops cubren golf, tenis y tiro.',
            })}
          </p>
        </div>

        <div className="mt-12 space-y-14">
          {groups.map((g) => (
            <div key={g.value} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
              <h3 className="lg:col-span-3 font-title text-2xl text-ink">{t({ en: g.en, es: g.es })}</h3>
              <ul className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 border-t border-line">
                {g.items.map((s) => {
                  const summary = (locale === 'es' ? s.summary_es : s.summary_en) || s.summary_en
                  const cat = s.category ? CATEGORY[s.category] : null
                  return (
                    <li key={s._id} className="py-5 border-b border-line">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-title text-lg text-ink leading-tight">{s.name}</p>
                        {s.website && (
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-0.5 text-muted-2 hover:text-ink transition-colors"
                            aria-label={`${s.name} — ${t({ en: 'website', es: 'sitio web' })}`}
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {cat && <p className="mt-1 eyebrow !tracking-[0.16em]">{t(cat)}</p>}
                      {summary && <p className="mt-1.5 text-sm text-muted font-light leading-relaxed">{summary}</p>}
                      {s.hours && <p className="mt-1.5 text-xs text-muted-2 font-light">{s.hours}</p>}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
