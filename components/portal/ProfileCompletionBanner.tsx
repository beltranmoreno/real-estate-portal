import Link from 'next/link'

/**
 * Gentle nudge shown on portal pages when the guest hasn't set their name.
 * Magic-link / OTP signups often arrive nameless, which makes bookings read
 * "Requested by —" on the admin side. Links to the profile page.
 */
export function ProfileCompletionBanner({
  locale,
  returnTo,
}: {
  locale: 'en' | 'es'
  returnTo?: string
}) {
  const t = (en: string, es: string) => (locale === 'es' ? es : en)
  const href = returnTo
    ? `/portal/profile?returnTo=${encodeURIComponent(returnTo)}`
    : '/portal/profile'

  return (
    <div className="bg-amber-50 border border-amber-200 px-5 py-4 rounded-sm flex flex-wrap items-center justify-between gap-3 mb-8">
      <p className="text-sm font-light text-amber-900">
        {t(
          'Complete your profile so our team knows who to help.',
          'Completa tu perfil para que nuestro equipo sepa a quién atender.'
        )}
      </p>
      <Link
        href={href}
        className="inline-flex items-center px-4 py-2 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors whitespace-nowrap"
      >
        {t('Add your name', 'Agrega tu nombre')} →
      </Link>
    </div>
  )
}
