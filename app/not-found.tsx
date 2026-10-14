'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'

export default function NotFound() {
  const { t } = useLocale()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <div className="max-w-lg w-full text-center">
        <p className="eyebrow">404</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink mt-4 mb-5">
          {t({ en: 'Page not found', es: 'Página no encontrada' })}
        </h1>
        <p className="text-muted font-light leading-relaxed measure-lede mx-auto">
          {t({
            en: 'The page you were looking for has moved on. Let us point you back toward the coast.',
            es: 'La página que buscabas ya no está aquí. Déjanos llevarte de vuelta a la costa.',
          })}
        </p>
        <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">{t({ en: 'Go home', es: 'Volver al inicio' })}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">{t({ en: 'Browse residences', es: 'Ver residencias' })}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
