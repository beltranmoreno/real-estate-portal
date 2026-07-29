import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalFooter } from '@/components/portal/PortalFooter'

export const metadata = {
  title: 'Your Stays · Leticia Coudray Real Estate',
  robots: { index: false, follow: false },
}

/**
 * Index of a guest's stays. Renters with a booking are normally routed
 * straight to their stay from /portal, so this is reached mainly when a
 * guest has no (or multiple) bookings — hence the empty state.
 */
export default async function StaysIndexPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/portal/sign-in')

  const locale: 'en' | 'es' = user.locale === 'es' ? 'es' : 'en'
  const t = (en: string, esText: string) => (locale === 'es' ? esText : en)
  const dateLocale = locale === 'es' ? es : undefined
  const fmt = (d: Date) =>
    format(d, locale === 'es' ? 'd MMM yyyy' : 'MMM d, yyyy', { locale: dateLocale })

  const bookings = await prisma.booking.findMany({
    where: { primaryGuestUserId: user.id },
    orderBy: { checkIn: 'desc' },
  })

  return (
    <div className="min-h-screen bg-stone-50">
      <PortalHeader>
        <UserButton />
      </PortalHeader>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-8">
          {t('Your stays', 'Tus estadías')}
        </h1>

        {bookings.length === 0 ? (
          <div className="p-8 bg-white border border-stone-200 rounded-sm text-center">
            <p className="text-stone-700 font-light">
              {t('You have no stays yet.', 'Aún no tienes estadías.')}
            </p>
            <p className="text-sm text-stone-500 font-light mt-2">
              {t(
                'Once a booking is set up for you, it will appear here.',
                'Cuando se registre una reserva a tu nombre, aparecerá aquí.'
              )}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
            >
              {t('Contact us', 'Contáctanos')}
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/portal/stays/${b.id}`}
                className="flex items-center justify-between gap-4 p-5 bg-white border border-stone-200 rounded-sm hover:border-stone-400 transition-colors"
              >
                <div>
                  <h2 className="font-light text-stone-900">{b.propertyTitle}</h2>
                  <p className="text-sm text-stone-500 font-light mt-1">
                    {fmt(b.checkIn)} — {fmt(b.checkOut)}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.15em] text-stone-500">
                  {t('View', 'Ver')} →
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PortalFooter locale={locale} />
    </div>
  )
}
