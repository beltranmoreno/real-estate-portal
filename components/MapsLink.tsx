'use client'

import { MapPin } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

/** "Open in Google Maps", for a place's Google Maps link from Studio. */
export function MapsLink({ href, className }: { href: string; className?: string }) {
  const { t } = useLocale()
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-light text-body-strong underline decoration-line underline-offset-4 hover:text-brand hover:decoration-brand transition-colors',
        className
      )}
    >
      <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {t({ en: 'Open in Google Maps', es: 'Abrir en Google Maps' })}
    </a>
  )
}
