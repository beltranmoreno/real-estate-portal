import 'server-only'
import { Resend } from 'resend'
import ServiceConfirmedEmail from '@/emails/ServiceConfirmedEmail'
import { prisma } from '@/lib/db'
import type { Booking, User } from '@prisma/client'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM ||
  'Leticia Coudray <hello@updates.leticiacoudrayrealestate.com>'
const REPLY_TO =
  process.env.PORTAL_EMAIL_REPLY_TO || 'leticiacoudrayrealestate@gmail.com'

interface SendServiceConfirmedOpts {
  booking: Booking
  renter: User
  serviceName: string
  venueName?: string | null
  dateLabel?: string | null // preformatted, range-aware
  timeLabel?: string | null
  partySize?: number | null
}

/**
 * Notifies the guest that a concierge service request has been confirmed.
 * Records a Notification row (sent/failed) for the booking's activity feed.
 */
export async function sendServiceConfirmed(
  opts: SendServiceConfirmedOpts
): Promise<string | null> {
  const { booking, renter, serviceName, venueName, dateLabel, timeLabel, partySize } =
    opts
  const locale = (renter.locale ?? 'en') as 'en' | 'es'

  const actionUrl = `${SITE_URL}/portal/stays/${booking.id}`
  const subject =
    locale === 'es'
      ? `Confirmado: ${serviceName} — ${booking.propertyTitle}`
      : `Confirmed: ${serviceName} — ${booking.propertyTitle}`

  if (!resend) {
    console.warn('[sendServiceConfirmed] RESEND_API_KEY missing — skipping send')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: renter.email,
    subject,
    react: ServiceConfirmedEmail({
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      serviceName,
      venueName: venueName ?? null,
      dateLabel: dateLabel ?? null,
      timeLabel: timeLabel ?? null,
      partySize: partySize ?? null,
      actionUrl,
      locale,
    }),
  })

  if (error) {
    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        recipientEmail: renter.email,
        recipientUserId: renter.id,
        kind: 'service_confirmed',
        subject,
        body: actionUrl,
        status: 'failed',
      },
    })
    throw new Error(`Failed to send confirmation: ${error.message}`)
  }

  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      recipientEmail: renter.email,
      recipientUserId: renter.id,
      kind: 'service_confirmed',
      subject,
      body: actionUrl,
      resendId: data?.id ?? null,
      status: 'sent',
    },
  })

  return data?.id ?? null
}
