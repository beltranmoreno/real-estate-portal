import 'server-only'
import { addDaysToKey, keyToDbDate, todayInDR } from '@/lib/dates'
import { prisma } from '@/lib/db'
import { sendKeyReleased } from '@/lib/email/sendKeyReleased'

/**
 * The day-before email ("Your stay starts tomorrow") plus key release.
 * checkIn is a DR calendar day (@db.Date, UTC midnight); the daily run is
 * 09:00 DR.
 *
 * - Every live booking (not DRAFT / CANCELLED) arriving tomorrow gets the
 *   pre-arrival email once (preArrivalEmailSentAt), with a link to the house
 *   info — and the door code when one is set and releasable.
 * - Door codes are released for CONFIRMED bookings arriving today or tomorrow
 *   (today catches a missed run, or a code added late). keyReleasedAt keeps it
 *   to once per code; the admin API clears it when the code changes. If the
 *   pre-arrival email already went out without a code, the code goes in a
 *   follow-up email.
 */
export async function releaseKeys() {
  const today = todayInDR()
  const todayDb = keyToDbDate(today)
  const tomorrowDb = keyToDbDate(addDaysToKey(today, 1))

  const candidates = await prisma.booking.findMany({
    where: {
      OR: [
        {
          status: { notIn: ['DRAFT', 'CANCELLED'] },
          preArrivalEmailSentAt: null,
          checkIn: tomorrowDb,
        },
        {
          status: 'CONFIRMED',
          keyCode: { not: null },
          keyReleasedAt: null,
          checkIn: { gte: todayDb, lte: tomorrowDb },
        },
      ],
    },
    include: { primaryGuest: true },
  })

  let sent = 0
  let released = 0
  let emailsFailed = 0

  for (const booking of candidates) {
    const releaseCode = booking.status === 'CONFIRMED' && !!booking.keyCode && !booking.keyReleasedAt
    const isTomorrow = booking.checkIn.getTime() === tomorrowDb.getTime()
    const needsPreArrival = !booking.preArrivalEmailSentAt && isTomorrow && booking.status !== 'DRAFT' && booking.status !== 'CANCELLED'
    if (!releaseCode && !needsPreArrival) continue

    const now = new Date()
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        ...(releaseCode ? { keyReleasedAt: now } : {}),
        // A code email on/just before arrival also counts as the pre-arrival.
        ...(needsPreArrival || releaseCode ? { preArrivalEmailSentAt: booking.preArrivalEmailSentAt ?? now } : {}),
      },
    })

    if (releaseCode) {
      await prisma.auditLog.create({
        data: { actorUserId: null, entity: 'booking', entityId: booking.id, action: 'key_released' },
      })
      released++
    }

    try {
      await sendKeyReleased({ booking, renter: booking.primaryGuest, includeCode: releaseCode })
      sent++
    } catch (err) {
      console.error('[releaseKeys] email failed for booking', booking.id, err)
      emailsFailed++
    }
  }

  return { sent, released, emailsFailed, candidates: candidates.length }
}
