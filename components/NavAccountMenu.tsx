'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

interface Booking {
  id: string
  propertyTitle: string
  checkIn: string
  checkOut: string
  status: string
}

/**
 * Signed-in account control for the public header. Shows a user icon that
 * opens a menu listing the guest's bookings (fetched on first open) plus
 * links into the portal and a sign-out.
 */
export function NavAccountMenu() {
  const { locale, t } = useLocale()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fetch bookings the first time the menu opens.
  useEffect(() => {
    if (!open || bookings !== null || loading) return
    setLoading(true)
    fetch('/api/portal/me/bookings')
      .then((r) => (r.ok ? r.json() : { bookings: [] }))
      .then((d) => setBookings(d.bookings ?? []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [open, bookings, loading])

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
        className="cursor-pointer h-8 flex items-center gap-1.5 px-2 bg-stone-100/60 backdrop-blur-sm rounded-none border border-stone-200/50 hover:bg-stone-200/60 transition-all duration-200"
        title={t({ en: 'Your account', es: 'Tu cuenta' })}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="w-4 h-4 text-stone-600" />
        <ChevronDown
          className={`w-3 h-3 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-stone-200 shadow-xl z-[60]">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-light">
              {t({ en: 'Your stays', es: 'Tus estadías' })}
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-4 text-sm font-light text-stone-500">
                {t({ en: 'Loading…', es: 'Cargando…' })}
              </p>
            ) : bookings && bookings.length > 0 ? (
              <ul className="divide-y divide-stone-100">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={`/portal/stays/${b.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 hover:bg-stone-50 transition-colors"
                    >
                      <p className="text-sm font-light text-stone-900 truncate">
                        {b.propertyTitle}
                      </p>
                      <p className="text-xs text-stone-500 font-light mt-0.5">
                        {fmtRange(b.checkIn, b.checkOut)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-4 text-sm font-light text-stone-500">
                {t({ en: 'No bookings yet.', es: 'Aún no tienes reservas.' })}
              </p>
            )}
          </div>

          <div className="border-t border-stone-100">
            <Link
              href="/portal/stays"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-light text-stone-700 hover:bg-stone-50 transition-colors"
            >
              {t({ en: 'Go to portal →', es: 'Ir al portal →' })}
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut()
                window.location.href = '/'
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-light text-stone-700 hover:bg-stone-50 transition-colors border-t border-stone-100"
            >
              <LogOut className="w-4 h-4 text-stone-500" />
              {t({ en: 'Sign out', es: 'Cerrar sesión' })}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
