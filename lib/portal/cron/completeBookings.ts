import 'server-only'
import { prisma } from '@/lib/db'
import { sendFeedbackRequest } from '@/lib/email/sendFeedbackRequest'

/**
 * Post-stay sweep, run daily:
 *
 *  1. Marks bookings completed once their checkout is in the past (the day
 *     after checkout), unless an admin already completed them.
 *  2. Emails the guest a private feedback invitation ~1 day later — once the
 *     stay is complete and checkout has passed — guarded by
 *     `feedbackEmailSentAt` so it only ever sends once.
 *
 * Cancelled bookings are skipped. Dates are compared at UTC midnight because
 * checkOut is a `@db.Date`.
 */
export async function completeBookings() {
  const now = new Date()
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )

  // 1) Auto-complete stays whose checkout has passed.
  const toComplete = await prisma.booking.findMany({
    where: {
      completedAt: null,
      status: { not: 'CANCELLED' },
      checkOut: { lt: startOfToday },
    },
    select: { id: true },
  })

  for (const b of toComplete) {
    await prisma.booking.update({
      where: { id: b.id },
      data: { completedAt: new Date() },
    })
    await prisma.auditLog.create({
      data: { actorUserId: null, entity: 'booking', entityId: b.id, action: 'completed_auto' },
    })
  }

  // 2) Send the feedback invitation for completed, past-checkout stays that
  //    haven't been emailed yet.
  const toEmail = await prisma.booking.findMany({
    where: {
      completedAt: { not: null },
      feedbackEmailSentAt: null,
      status: { not: 'CANCELLED' },
      checkOut: { lt: startOfToday },
    },
    include: { primaryGuest: true },
  })

  let emailed = 0
  let emailsFailed = 0
  for (const booking of toEmail) {
    if (!booking.primaryGuest?.email) continue
    try {
      await sendFeedbackRequest({ booking, renter: booking.primaryGuest })
      await prisma.booking.update({
        where: { id: booking.id },
        data: { feedbackEmailSentAt: new Date() },
      })
      emailed++
    } catch (err) {
      console.error('[completeBookings] feedback email failed for booking', booking.id, err)
      emailsFailed++
    }
  }

  return { completed: toComplete.length, emailed, emailsFailed }
}
