import 'server-only'
import { Resend } from 'resend'
import RequestReminderEmail from '@/emails/RequestReminderEmail'
import { prisma } from '@/lib/db'
import type { Booking, User } from '@prisma/client'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM ||
  'Leticia Coudray <hello@leticiacoudrayrealestate.com>'

interface Opts {
  booking: Booking
  renter: User
  pendingCount: number
  daysUntilCheckIn: number
}

export async function sendRequestReminder(opts: Opts): Promise<string | null> {
  const { booking, renter, pendingCount, daysUntilCheckIn } = opts
  const locale = (renter.locale ?? 'en') as 'en' | 'es'

  const actionUrl = `${SITE_URL}/portal/stays/${booking.id}`
  const subject =
    locale === 'es'
      ? `Recordatorio: ${pendingCount} pendiente${pendingCount === 1 ? '' : 's'} para ${booking.propertyTitle}`
      : `Reminder: ${pendingCount} pending item${pendingCount === 1 ? '' : 's'} for ${booking.propertyTitle}`

  if (!resend) {
    console.warn('[sendRequestReminder] RESEND_API_KEY missing — skipping send')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: renter.email,
    subject,
    react: RequestReminderEmail({
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      pendingCount,
      daysUntilCheckIn,
      actionUrl,
      locale,
    }),
  })

  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      recipientEmail: renter.email,
      recipientUserId: renter.id,
      kind: 'request_reminder',
      subject,
      body: actionUrl,
      resendId: data?.id ?? null,
      status: error ? 'failed' : 'sent',
    },
  })

  if (error) throw new Error(`Failed: ${error.message}`)
  return data?.id ?? null
}
