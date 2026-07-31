import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * GET /api/portal/me/bookings
 *
 * The signed-in guest's own bookings, newest stay first. Powers the header
 * account menu on the public site. Cancelled bookings are excluded.
 */
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    where: {
      primaryGuestUserId: user.id,
      status: { not: 'CANCELLED' },
    },
    orderBy: { checkIn: 'desc' },
    take: 25,
    select: {
      id: true,
      propertyTitle: true,
      checkIn: true,
      checkOut: true,
      status: true,
    },
  })

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      propertyTitle: b.propertyTitle,
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      status: b.status,
    })),
  })
}
