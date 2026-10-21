import 'server-only'
import { prisma } from '@/lib/db'
import { keyToDbDate } from '@/lib/dates'

/**
 * Date availability across both sources of truth:
 *   - Sanity `availability.blockedDates` — inclusive DR calendar days
 *     (owner use, maintenance, bookings taken elsewhere)
 *   - portal bookings in Postgres — checkIn inclusive, checkOut exclusive
 *
 * A stay occupies its check-in day through the night before check-out, so
 * arriving on someone's check-out day (or checking out on a block's first
 * day) is fine.
 */

/** Statuses that hold the house's dates. */
const HOLDING_STATUSES = ['DRAFT', 'PENDING', 'CONFIRMED', 'ACTIVE'] as const

export const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

/** GROQ filter: no blocked range overlaps $checkIn → $checkOut. */
export const NOT_BLOCKED_GROQ =
  'count(availability.blockedDates[startDate < $checkOut && endDate >= $checkIn]) == 0'

/**
 * Sanity ids of properties with a portal booking overlapping the stay.
 * Returns [] if the database is unreachable, so search still works.
 */
export async function getBookedPropertyIds(checkIn: string, checkOut: string, propertyId?: string): Promise<string[]> {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: [...HOLDING_STATUSES] },
        checkIn: { lt: keyToDbDate(checkOut) },
        checkOut: { gt: keyToDbDate(checkIn) },
        ...(propertyId ? { propertySanityId: propertyId } : {}),
      },
      select: { propertySanityId: true },
      distinct: ['propertySanityId'],
    })
    return bookings.map((b) => b.propertySanityId)
  } catch (error) {
    console.error('[availability] booking lookup failed', error)
    return []
  }
}
