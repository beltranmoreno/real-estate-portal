import 'server-only'
import { addHours } from 'date-fns'
import { prisma } from '@/lib/db'
import { sendKeyReleased } from '@/lib/email/sendKeyReleased'

/**
 * Releases key codes for bookings whose check-in is within the next 25
 * hours but more than 23 hours out. The 23–25h window catches a booking
 * exactly once (the cron runs daily, so a 24h boundary risks double-firing
 * or missing entirely depending on timing drift).
 *
 * Only fires for bookings that:
 *   - Have a keyCode set by an admin
 *   - Have not already had keyReleasedAt set (idempotent)
 *   - Are CONFIRMED (not cancelled)
 */
export async function releaseKeys() {
  const now = new Date()
  const lower = addHours(now, 23)
  const upper = addHours(now, 25)

  const candidates = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      keyCode: { not: null },
      keyReleasedAt: null,
      checkIn: { gte: lower, lte: upper },
    },
    include: { primaryGuest: true },
  })

  let released = 0
  let emailsFailed = 0

  for (const booking of candidates) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { keyReleasedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: null,
        entity: 'booking',
        entityId: booking.id,
        action: 'key_released',
      },
    })

    try {
      await sendKeyReleased({
        booking,
        renter: booking.primaryGuest,
      })
    } catch (err) {
      console.error('[releaseKeys] email failed for booking', booking.id, err)
      emailsFailed++
    }
    released++
  }

  return { released, emailsFailed, candidates: candidates.length }
}
