import 'server-only'
import { addDaysToKey, keyToDbDate, todayInDR } from '@/lib/dates'
import { prisma } from '@/lib/db'
import { sendKeyReleased } from '@/lib/email/sendKeyReleased'

/**
 * Releases key codes the day before check-in. checkIn is a DR calendar day
 * (@db.Date, UTC midnight) and check-in time is villa-local, so the daily run
 * (09:00 DR) sends codes for anyone arriving today or tomorrow in the DR —
 * roughly 24h+ ahead. Including today catches a missed run; keyReleasedAt
 * keeps it to once per booking.
 *
 * Only fires for bookings that:
 *   - Have a keyCode set by an admin
 *   - Have not already had keyReleasedAt set (idempotent)
 *   - Are CONFIRMED (not cancelled)
 */
export async function releaseKeys() {
  const today = todayInDR()
  const lower = keyToDbDate(today)
  const upper = keyToDbDate(addDaysToKey(today, 1))

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
