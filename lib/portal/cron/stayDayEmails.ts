import 'server-only'
import { keyToDbDate, todayInDR } from '@/lib/dates'
import { prisma } from '@/lib/db'
import { formatTime } from '@/lib/formatTime'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { sendStayDayEmail } from '@/lib/email/sendStayDayEmail'

/**
 * Day-of emails, run daily (09:00 DR): a welcome to guests arriving today and
 * a goodbye to guests leaving today. Only today's stays — a missed run is
 * skipped rather than sending a "welcome" a day late. `checkInEmailSentAt` /
 * `checkOutEmailSentAt` keep each to once per booking.
 *
 * Drafts (no invitation yet) and cancelled bookings are skipped.
 */
export async function sendStayDayEmails() {
  const today = keyToDbDate(todayInDR())
  const live = { status: { notIn: ['DRAFT', 'CANCELLED'] as Array<'DRAFT' | 'CANCELLED'> } }

  const [arriving, leaving] = await Promise.all([
    prisma.booking.findMany({
      where: { ...live, checkIn: today, checkInEmailSentAt: null },
      include: { primaryGuest: true },
    }),
    prisma.booking.findMany({
      where: { ...live, checkOut: today, checkOutEmailSentAt: null },
      include: { primaryGuest: true },
    }),
  ])

  const result = { checkIn: 0, checkOut: 0, skipped: 0, failed: 0 }
  const jobs = [
    ...arriving.map((booking) => ({ kind: 'check-in' as const, booking })),
    ...leaving.map((booking) => ({ kind: 'check-out' as const, booking })),
  ]

  for (const { kind, booking } of jobs) {
    try {
      const property = await getPropertyForPortal(booking.propertySanityId).catch(() => null)
      const rawTime = kind === 'check-in' ? property?.guestInfo?.checkInTime : property?.guestInfo?.checkOutTime
      const sent = await sendStayDayEmail({
        kind,
        booking,
        renter: booking.primaryGuest,
        time: formatTime(rawTime) || null,
      })
      if (!sent) {
        result.skipped++
        continue
      }
      await prisma.booking.update({
        where: { id: booking.id },
        data: kind === 'check-in' ? { checkInEmailSentAt: new Date() } : { checkOutEmailSentAt: new Date() },
      })
      if (kind === 'check-in') result.checkIn++
      else result.checkOut++
    } catch (err) {
      console.error(`[stayDayEmails] ${kind} email failed for booking`, booking.id, err)
      result.failed++
    }
  }

  return result
}
