'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

interface Props {
  current: 'en' | 'es'
  /** Style preset — `header` for portal headers, `pill` for compact placement. */
  variant?: 'header' | 'pill'
}

/**
 * EN / ES toggle for the renter portal. Persists to the User row in the
 * DB so the choice carries across sessions and devices, then refreshes
 * the route so the server-rendered page picks up the new locale.
 */
export function PortalLocaleSwitcher({ current, variant = 'header' }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [locale, setLocale] = useState<'en' | 'es'>(current)

  const switchTo = async (next: 'en' | 'es') => {
    if (next === locale || saving) return
    const prev = locale
    setLocale(next)
    setSaving(true)
    try {
      const res = await fetch('/api/portal/me/locale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: next }),
      })
      if (!res.ok) throw new Error('Could not switch language')
      router.refresh()
    } catch {
      setLocale(prev)
    } finally {
      setSaving(false)
    }
  }

  if (variant === 'pill') {
    return (
      <div className="inline-flex items-center gap-1 border border-line rounded-sm bg-white p-0.5">
        <Toggle
          active={locale === 'en'}
          disabled={saving}
          onClick={() => switchTo('en')}
        >
          EN
        </Toggle>
        <Toggle
          active={locale === 'es'}
          disabled={saving}
          onClick={() => switchTo('es')}
        >
          ES
        </Toggle>
      </div>
    )
  }

  // Matches the public site's Navbar switcher: a single Globe + locale
  // button that toggles between EN/ES.
  return (
    <button
      type="button"
      onClick={() => switchTo(locale === 'en' ? 'es' : 'en')}
      disabled={saving}
      title={`Switch to ${locale === 'en' ? 'Español' : 'English'}`}
      className="cursor-pointer h-8 flex items-center gap-2 bg-sand/60 backdrop-blur-sm rounded-none p-2 border border-line/50 hover:bg-sand/60 transition-all duration-200 disabled:opacity-50"
    >
      <Globe className="w-4 h-4 text-muted" />
      <span className="text-xs font-medium text-body-strong uppercase">
        {locale}
      </span>
    </button>
  )
}

function Toggle({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-0.5 text-xs uppercase tracking-wider font-light transition-colors ${
        active
          ? 'text-ink underline underline-offset-4'
          : 'text-muted-2 hover:text-ink'
      } disabled:opacity-50`}
    >
      {children}
    </button>
  )
}
