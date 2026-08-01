import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserButton } from '@clerk/nextjs'
import { Mail, Phone, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { getPortalAgents } from '@/lib/portal/agents'
import { urlFor } from '@/sanity/lib/image'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalFooter } from '@/components/portal/PortalFooter'
import { ProfileCompletionBanner } from '@/components/portal/ProfileCompletionBanner'
import { PortalLocaleSwitcher } from '@/components/portal/PortalLocaleSwitcher'

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
  const agents = await getPortalAgents()

  return (
    <div className="min-h-screen bg-stone-50">
      <PortalHeader>
        <PortalLocaleSwitcher current={locale} />
        <UserButton />
      </PortalHeader>

      <main className="container mx-auto px-6 py-12 max-w-5xl min-h-dvh">
        <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-8">
          {t('Your stays', 'Tus estadías')}
        </h1>

        {(!user.firstName || !user.lastName) && (
          <ProfileCompletionBanner locale={locale} returnTo="/portal/stays" />
        )}

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

        {agents.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-4">
              {t('Contact', 'Contacto')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agents.map((a) => {
                const position =
                  (locale === 'es' ? a.positionTitle_es : a.positionTitle_en) ||
                  a.positionTitle_en ||
                  a.positionTitle_es
                const photo = a.photo?.asset
                  ? urlFor(a.photo).width(128).height(128).fit('crop').url()
                  : null
                const wa = a.whatsapp?.replace(/[^\d]/g, '')
                return (
                  <div
                    key={a._id}
                    className="flex items-start gap-4 p-5 bg-white border border-stone-200 rounded-sm"
                  >
                    {photo && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-stone-100 shrink-0">
                        <Image
                          src={photo}
                          alt={a.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-light text-stone-900">{a.name}</p>
                      {position && (
                        <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">
                          {position}
                        </p>
                      )}
                      <div className="flex flex-col gap-1 text-sm font-light">
                        {a.email && (
                          <a
                            href={`mailto:${a.email}`}
                            className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900 break-all"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0 text-stone-500" />
                            {a.email}
                          </a>
                        )}
                        {a.phone && (
                          <a
                            href={`tel:${a.phone}`}
                            className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0 text-stone-500" />
                            {a.phone}
                          </a>
                        )}
                        {wa && (
                          <a
                            href={`https://wa.me/${wa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900"
                          >
                            <MessageCircle className="w-3.5 h-3.5 shrink-0 text-stone-500" />
                            {t('WhatsApp', 'WhatsApp')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <PortalFooter locale={locale} />
    </div>
  )
}
