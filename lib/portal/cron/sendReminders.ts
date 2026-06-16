import 'server-only'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/db'
import { sendRequestReminder } from '@/lib/email/sendRequestReminder'

/**
 * Sends nudge emails to renters with pending requests when their check-in
 * lands at one of three milestones: 7 days, 3 days, or 1 day out.
 *
 * Sends at most one email per booking per day. We dedupe by checking
 * the Notification log for a `request_reminder` row in the last 20 hours.
 */
const REMINDER_DAYS = [7, 3, 1] as const

export async function sendReminders() {
  const now = new Date()
  let totalSent = 0
  let totalSkipped = 0
  const failures: string[] = []

  for (const daysOut of REMINDER_DAYS) {
    const target = startOfDay(addDays(now, daysOut))
    const windowEnd = endOfDay(target)

    // Bookings checking in on the target day, with at least one PENDING request.
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        checkIn: { gte: target, lte: windowEnd },
        requests: { some: { status: 'PENDING' } },
      },
      include: {
        primaryGuest: true,
        requests: { where: { status: 'PENDING' } },
      },
    })

    for (const booking of bookings) {
      const recentReminder = await prisma.notification.findFirst({
        where: {
          bookingId: booking.id,
          kind: 'request_reminder',
          sentAt: { gte: addDays(now, -1) },
        },
      })
      if (recentReminder) {
        totalSkipped++
        continue
      }

      try {
        await sendRequestReminder({
          booking,
          renter: booking.primaryGuest,
          pendingCount: booking.requests.length,
          daysUntilCheckIn: daysOut,
        })
        totalSent++
      } catch (err) {
        console.error('[sendReminders] failed for booking', booking.id, err)
        failures.push(booking.id)
      }
    }
  }

  return { sent: totalSent, skipped: totalSkipped, failures }
}
