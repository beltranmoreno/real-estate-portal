import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * /portal entry point. Routes the user to the right destination based
 * on role. If they're not authenticated, the middleware already redirected
 * them to Clerk's sign-in.
 */
export default async function PortalLanding() {
  const user = await getCurrentUser()
  if (!user) redirect('/portal/sign-in')

  // Admins/agents land on the stays index, which for them lists every
  // booking so they can preview the portal as each guest sees it. The
  // admin dashboard is one click away from there.
  if (user.role === 'ADMIN' || user.role === 'AGENT') {
    redirect('/portal/stays')
  }

  if (user.role === 'OWNER') {
    redirect('/portal/owner')
  }

  // RENTER / ADDITIONAL_GUEST — go straight to their stay when there's
  // exactly one; otherwise show the list (empty state or multiple stays).
  const bookings = await prisma.booking.findMany({
    where: { primaryGuestUserId: user.id },
    orderBy: { checkIn: 'desc' },
    select: { id: true },
  })

  if (bookings.length === 1) {
    redirect(`/portal/stays/${bookings[0].id}`)
  }

  redirect('/portal/stays')
}
