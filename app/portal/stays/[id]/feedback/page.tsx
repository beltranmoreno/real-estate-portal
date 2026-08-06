import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { PortalFooter } from '@/components/portal/PortalFooter'
import { PortalLocaleSwitcher } from '@/components/portal/PortalLocaleSwitcher'
import { FeedbackForm } from '../FeedbackForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata = { robots: { index: false, follow: false } }

export default async function StayFeedbackPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireCurrentUser()
  const locale: 'en' | 'es' = user.locale === 'es' ? 'es' : 'en'
  const t = (en: string, es: string) => (locale === 'es' ? es : en)

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { feedback: true },
  })
  if (!booking) notFound()
  if (booking.primaryGuestUserId !== user.id) redirect('/portal')

  // Feedback only opens once the stay is complete.
  if (!booking.completedAt) redirect(`/portal/stays/${id}`)

  return (
    <ClerkProvider>
      <PortalHeader>
        <PortalLocaleSwitcher current={locale} />
        <UserButton />
      </PortalHeader>

      <main className="container mx-auto px-6 py-10 max-w-2xl">
        <Link
          href={`/portal/stays/${id}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-2 hover:text-ink transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('Back to your stay', 'Volver a tu estadía')}
        </Link>

        <span className="eyebrow !text-brand">{t('Your stay', 'Tu estadía')}</span>
        <h1 className="font-display text-3xl sm:text-4xl text-ink mt-3 mb-4 leading-tight">
          {t('How was it?', '¿Cómo estuvo?')}
        </h1>
        <p className="text-muted font-light leading-relaxed measure-lede mb-3">
          {booking.propertyTitle}
        </p>
        <p className="text-muted font-light leading-relaxed measure-lede mb-10">
          {t(
            'Tell us anything — what you loved, what we could do better, a word for Leticia or the team. It stays private to us and helps us look after you even better next time.',
            'Cuéntanos lo que quieras — lo que te encantó, lo que podemos mejorar, unas palabras para Leticia o el equipo. Es privado para nosotros y nos ayuda a cuidarte aún mejor la próxima vez.'
          )}
        </p>

        <FeedbackForm
          bookingId={booking.id}
          locale={locale}
          alreadySubmitted={!!booking.feedback}
          initial={
            booking.feedback
              ? {
                  reviewLeticia: booking.feedback.reviewLeticia ?? '',
                  reviewAgents: booking.feedback.reviewAgents ?? '',
                  noteHouse: booking.feedback.noteHouse ?? '',
                  noteServices: booking.feedback.noteServices ?? '',
                  general: booking.feedback.general ?? '',
                  rating: booking.feedback.rating ?? null,
                }
              : undefined
          }
        />
      </main>

      <PortalFooter locale={locale} />
    </ClerkProvider>
  )
}
