'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { useAuth } from '@clerk/nextjs'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'

interface Booking {
  id: string
  propertyTitle: string
  checkIn: string
  checkOut: string
  status: string
}

/**
 * Signed-in account control for the public header. Shows a user icon that
 * opens a menu listing the guest's bookings. SWR fetches on mount (before the
 * menu is opened) and caches, so it never opens into a loading state.
 */
export function NavAccountMenu({ onDark = false }: { onDark?: boolean }) {
  const { locale, t } = useLocale()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useSWR<{ bookings: Booking[] }>('/api/portal/me/bookings')
  const bookings = data?.bookings ?? null

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const fmtRange = (a: string, b: string) => {
    const opts: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }
    const loc = locale === 'es' ? 'es-ES' : 'en-US'
    return `${new Date(a).toLocaleDateString(loc, opts)} – ${new Date(b).toLocaleDateString(loc, { ...opts, year: 'numeric' })}`
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'cursor-pointer h-8 flex items-center gap-1.5 px-2 rounded-[2px] transition-colors duration-200',
          onDark
            ? 'text-white/90 hover:text-white group-hover/nav:text-body-strong group-hover/nav:hover:text-ink'
            : 'text-body-strong hover:text-ink'
        )}
        title={t({ en: 'Your account', es: 'Tu cuenta' })}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="w-4 h-4 text-current" />
        <ChevronDown className={cn('w-3 h-3 text-current transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-line shadow-[var(--shadow-float)] z-[60]">
          <div className="px-4 py-3 border-b border-line-soft">
            <p className="eyebrow">{t({ en: 'Your stays', es: 'Tus estadías' })}</p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-4 text-sm font-light text-muted-2">
                {t({ en: 'Loading…', es: 'Cargando…' })}
              </p>
            ) : bookings && bookings.length > 0 ? (
              <ul className="divide-y divide-line-soft">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/portal/stays/${b.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 hover:bg-sand/50 transition-colors"
                    >
                      <p className="text-sm font-light text-ink truncate">{b.propertyTitle}</p>
                      <p className="text-xs text-muted-2 font-light mt-0.5">
                        {fmtRange(b.checkIn, b.checkOut)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm font-light text-muted-2">
                {t({ en: 'No bookings yet.', es: 'Aún no tienes reservas.' })}
              </p>
            )}
          </div>

          <div className="border-t border-line-soft">
            <Link
              href="/portal/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-light text-body-strong hover:bg-sand/50 transition-colors"
            >
              {t({ en: 'Your details', es: 'Tus datos' })}
            </Link>
            <Link
              href="/portal/stays"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-light text-body-strong hover:bg-sand/50 transition-colors border-t border-line-soft"
            >
              {t({ en: 'Go to portal →', es: 'Ir al portal →' })}
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut()
                window.location.href = '/'
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-light text-body-strong hover:bg-sand/50 transition-colors border-t border-line-soft"
            >
              <LogOut className="w-4 h-4 text-muted-2" />
              {t({ en: 'Sign out', es: 'Cerrar sesión' })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
