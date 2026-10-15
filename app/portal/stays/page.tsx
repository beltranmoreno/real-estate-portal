import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserButton } from '@clerk/nextjs'
import { Mail, Phone, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { hasPermission } from '@/lib/auth/permissions'
import { additionalGuestWhere } from '@/lib/portal/stayAccess'
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
 *
 * Admins/agents see every booking here instead, each opening a read-only
 * preview of that guest's stay page.
 */
export default async function StaysIndexPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/portal/sign-in')

  const locale: 'en' | 'es' = user.locale === 'es' ? 'es' : 'en'
  const t = (en: string, esText: string) => (locale === 'es' ? esText : en)
  const dateLocale = locale === 'es' ? es : undefined
  const fmt = (d: Date) =>
    format(d, locale === 'es' ? 'd MMM yyyy' : 'MMM d, yyyy', { locale: dateLocale })

  const isStaffPreview = hasPermission(user.role, 'booking.read')

  const bookings = await prisma.booking.findMany({
    where: isStaffPreview
      ? {}
      : { OR: [{ primaryGuestUserId: user.id }, additionalGuestWhere(user.email)] },
    orderBy: { checkIn: 'desc' },
    take: isStaffPreview ? 100 : undefined,
    include: {
      primaryGuest: { select: { firstName: true, lastName: true, email: true } },
    },
  })
  const agents = await getPortalAgents()

  return (
    <div className="min-h-screen bg-canvas">
      <PortalHeader>
        <PortalLocaleSwitcher current={locale} />
        <UserButton />
      </PortalHeader>

      <main className="container mx-auto px-6 py-12 max-w-5xl min-h-dvh">
        {isStaffPreview ? (
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t('Admin preview', 'Vista de administrador')}</p>
              <h1 className="mt-2 font-title text-3xl text-ink">
                {t('Guest portal', 'Portal del huésped')}
              </h1>
              <p className="mt-2 text-sm text-muted-2 font-light">
                {t(
                  'Open any booking to see its stay page as the guest sees it. Read-only.',
                  'Abre cualquier reserva para ver su página como la ve el huésped. Solo lectura.'
                )}
              </p>
            </div>
            <Link
              href="/admin"
              className="text-xs uppercase tracking-[0.15em] text-body-strong border-b border-control-border pb-1 hover:border-ink hover:text-ink transition-colors"
            >
              {t('Admin dashboard', 'Panel de administración')} →
            </Link>
          </div>
        ) : (
          <h1 className="font-title text-3xl text-ink mb-8">
            {t('Your stays', 'Tus estadías')}
          </h1>
        )}

        {(!user.firstName || !user.lastName) && (
          <ProfileCompletionBanner locale={locale} returnTo="/portal/stays" />
        )}

        {bookings.length === 0 ? (
          <div className="p-8 bg-white border border-line rounded-sm text-center">
            <p className="text-body-strong font-light">
              {t('You have no stays yet.', 'Aún no tienes estadías.')}
            </p>
            <p className="text-sm text-muted-2 font-light mt-2">
              {t(
                'Once a booking is set up for you, it will appear here.',
                'Cuando se registre una reserva a tu nombre, aparecerá aquí.'
              )}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-ink text-white text-sm font-light tracking-wide rounded-sm hover:bg-brand transition-colors"
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
                className="flex items-center justify-between gap-4 p-5 bg-white border border-line rounded-sm hover:border-ink transition-colors"
              >
                <div>
                  <h2 className="font-light text-ink">{b.propertyTitle}</h2>
                  <p className="text-sm text-muted-2 font-light mt-1">
                    {fmt(b.checkIn)} — {fmt(b.checkOut)}
                    {isStaffPreview && (
                      <>
                        {' · '}
                        {[b.primaryGuest.firstName, b.primaryGuest.lastName].filter(Boolean).join(' ') ||
                          b.primaryGuest.email}
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-[0.15em] text-muted-2">
                  {t('View', 'Ver')} →
                </span>
              </Link>
            ))}
          </div>
        )}

        {agents.length > 0 && !isStaffPreview && (
          <section className="mt-14">
            <h2 className="text-xs uppercase tracking-[0.25em] text-muted-2 mb-4">
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
                    className="flex items-start gap-4 p-5 bg-white border border-line rounded-sm"
                  >
                    {photo && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-sand shrink-0">
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
                      <p className="font-light text-ink">{a.name}</p>
                      {position && (
                        <p className="text-[11px] uppercase tracking-wider text-muted-2 mb-2">
                          {position}
                        </p>
                      )}
                      <div className="flex flex-col gap-1 text-sm font-light">
                        {a.email && (
                          <a
                            href={`mailto:${a.email}`}
                            className="inline-flex items-center gap-1.5 text-body-strong hover:text-ink break-all"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0 text-muted-2" />
                            {a.email}
                          </a>
                        )}
                        {a.phone && (
                          <a
                            href={`tel:${a.phone}`}
                            className="inline-flex items-center gap-1.5 text-body-strong hover:text-ink"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0 text-muted-2" />
                            {a.phone}
                          </a>
                        )}
                        {wa && (
                          <a
                            href={`https://wa.me/${wa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-body-strong hover:text-ink"
                          >
                            <MessageCircle className="w-3.5 h-3.5 shrink-0 text-muted-2" />
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
