import { getPropertyOptions } from '@/lib/portal/properties'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'
import { toLocale, tFor } from '@/lib/i18n'
import { CreateBookingForm } from './CreateBookingForm'

export default async function NewBookingPage() {
  const admin = await getCurrentUser()
  const locale = toLocale(admin?.locale)
  const t = tFor(locale)

  const properties = await getPropertyOptions()

  // Existing guests, so admins can pick a returning guest instead of
  // retyping their details. Renters + additional guests only.
  const guestRows = await prisma.user.findMany({
    where: { role: { in: ['RENTER', 'ADDITIONAL_GUEST'] } },
    select: { email: true, firstName: true, lastName: true, locale: true },
    orderBy: [{ firstName: 'asc' }, { email: 'asc' }],
    take: 500,
  })
  const guests = guestRows.map((g) => ({
    email: g.email,
    firstName: g.firstName,
    lastName: g.lastName,
    locale: (g.locale === 'es' ? 'es' : 'en') as 'en' | 'es',
  }))

  return (
    <div className="container mx-auto px-6 py-10 max-w-3xl">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
        {t('New booking', 'Nueva reserva')}
      </p>
      <h1 className="text-3xl font-light text-stone-900 tracking-tight mb-2">
        {t('Create a booking', 'Crear una reserva')}
      </h1>
      <p className="text-stone-600 font-light mb-10 max-w-2xl">
        {t(
          'Pick a returning guest or add a new one. Save it as a draft, prepare an invitation to send later, or create and send the magic-link invitation now.',
          'Elige un huésped recurrente o agrega uno nuevo. Guárdala como borrador, prepara una invitación para enviar más tarde, o crea y envía la invitación con enlace mágico ahora.'
        )}
      </p>

      <CreateBookingForm properties={properties} guests={guests} locale={locale} />
    </div>
  )
}
