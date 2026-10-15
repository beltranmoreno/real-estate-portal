import type { Prisma, User } from '@prisma/client'
import { prisma } from '@/lib/db'
import { hasPermission } from '@/lib/auth/permissions'

/**
 * How the signed-in user relates to a booking in the portal:
 * - `primary`    — the booking's guest: full access.
 * - `additional` — an extra guest with portal access: read-only, no prices,
 *                  no to-dos/documents/costs.
 * - `staff`      — an admin/agent previewing: read-only, sees everything.
 */
export type StayAccess = 'primary' | 'additional' | 'staff'

/**
 * Where-clause for bookings an additional guest may see: a Guest row on the
 * booking with portal access switched on and this user's (Clerk-verified)
 * email. Case-insensitive, since admins type emails by hand.
 */
export function additionalGuestWhere(email: string): Prisma.BookingWhereInput {
  return {
    guests: {
      some: { portalAccess: true, email: { equals: email, mode: 'insensitive' } },
    },
  }
}

export async function resolveStayAccess(
  booking: { id: string; primaryGuestUserId: string },
  user: User
): Promise<StayAccess | null> {
  if (booking.primaryGuestUserId === user.id) return 'primary'

  const asGuest = await prisma.booking.count({
    where: { id: booking.id, ...additionalGuestWhere(user.email) },
  })
  if (asGuest > 0) return 'additional'

  if (hasPermission(user.role, 'booking.read')) return 'staff'
  return null
}
