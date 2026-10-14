'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'

export default function CollectionNotFound() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <p className="eyebrow">404</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink mt-4 mb-5">
          {t({ en: 'Collection not found', es: 'Colección no encontrada' })}
        </h1>
        <p className="text-muted font-light leading-relaxed measure-lede mx-auto">
          {t({
            en: "We couldn't find that collection — it may have been removed, expired, or the link is incorrect.",
            es: 'No encontramos esa colección — puede haber sido removida, haber expirado, o el enlace es incorrecto.',
          })}
        </p>
        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/search">{t({ en: 'Browse residences', es: 'Ver residencias' })}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">{t({ en: 'Back to home', es: 'Volver al inicio' })}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
