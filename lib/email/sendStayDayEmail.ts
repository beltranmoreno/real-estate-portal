import 'server-only'
import { Resend } from 'resend'
import StayDayEmail from '@/emails/StayDayEmail'
import { prisma } from '@/lib/db'
import type { Booking, User } from '@prisma/client'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM || 'Leticia Coudray <hello@updates.leticiacoudrayrealestate.com>'
const REPLY_TO = process.env.PORTAL_EMAIL_REPLY_TO || 'leticiacoudrayrealestate@gmail.com'

/**
 * Check-in day welcome / check-out day goodbye. Sent by the daily cron.
 * Records a Notification row (sent/failed). Returns false when there was
 * nothing to send to (no email, or Resend not configured).
 */
export async function sendStayDayEmail(opts: {
  kind: 'check-in' | 'check-out'
  booking: Booking
  renter: User
  time?: string | null
}): Promise<boolean> {
  const { kind, booking, renter, time } = opts
  if (!renter?.email) return false
  if (!resend) {
    console.warn('[sendStayDayEmail] RESEND_API_KEY missing — skipping send')
    return false
  }
  const es = renter.locale === 'es'
  const subject =
    kind === 'check-in'
      ? es
        ? `Bienvenido a ${booking.propertyTitle}`
        : `Welcome to ${booking.propertyTitle}`
      : es
        ? `Gracias por tu estadía en ${booking.propertyTitle}`
        : `Thank you for staying at ${booking.propertyTitle}`
  const actionUrl = `${SITE_URL}/portal/stays/${booking.id}`

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: renter.email,
    subject,
    react: StayDayEmail({
      kind,
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      time,
      actionUrl,
      locale: es ? 'es' : 'en',
    }),
  })

  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      recipientEmail: renter.email,
      recipientUserId: renter.id,
      kind: kind === 'check-in' ? 'check_in_day' : 'check_out_day',
      subject,
      body: actionUrl,
      resendId: error ? null : (data?.id ?? null),
      status: error ? 'failed' : 'sent',
    },
  })

  if (error) throw new Error(`Failed to send ${kind} email: ${error.message}`)
  return true
}
