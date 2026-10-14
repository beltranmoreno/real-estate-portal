'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

/**
 * Homepage band for buyers: a short pitch plus links to the public sale
 * listings and to a private conversation about unlisted residences. Kept
 * as a band rather than a rail of cards, since the sale inventory is small.
 */
export default function ForSaleBand({ className }: { className?: string }) {
  const { t } = useLocale()

  return (
    <section className={cn('bg-sand/40 py-16 lg:py-20', className)}>
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
        <div className="lg:col-span-7">
          <span className="eyebrow">{t({ en: 'To own', es: 'Para comprar' })}</span>
          <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight measure-display">
            {t({
              en: 'A house of your own in Casa de Campo.',
              es: 'Una casa propia en Casa de Campo.',
            })}
          </h2>
          <p className="mt-5 text-body-strong font-light leading-relaxed measure-lede">
            {t({
              en: 'Some of the best residences change hands without ever being advertised. Leticia shows them privately, alongside the ones listed here.',
              es: 'Algunas de las mejores residencias cambian de dueño sin anunciarse nunca. Leticia las muestra en privado, junto con las que aparecen aquí.',
            })}
          </p>
        </div>

        <div className="lg:col-span-5 lg:justify-self-end flex flex-col sm:flex-row lg:flex-col gap-3">
          <Link
            href="/search?listingType=sale"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-7 py-3.5 bg-ink text-surface text-xs uppercase tracking-[0.16em] rounded-[2px] hover:bg-brand transition-colors"
          >
            {t({ en: 'Residences for sale', es: 'Residencias en venta' })}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-7 py-3.5 border border-control-border text-ink text-xs uppercase tracking-[0.16em] rounded-[2px] hover:border-ink transition-colors"
          >
            {t({ en: 'Ask about private listings', es: 'Pregunta por ventas privadas' })}
          </Link>
        </div>
      </div>
    </section>
  )
}
