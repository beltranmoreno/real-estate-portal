import 'server-only'
import { Resend } from 'resend'
import FeedbackRequestEmail from '@/emails/FeedbackRequestEmail'
import { prisma } from '@/lib/db'
import type { Booking, User } from '@prisma/client'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM || 'Leticia Coudray <hello@updates.leticiacoudrayrealestate.com>'
const REPLY_TO = process.env.PORTAL_EMAIL_REPLY_TO || 'leticiacoudrayrealestate@gmail.com'

/**
 * Invites the guest to leave private post-stay feedback. Records a
 * Notification row (sent/failed) for the booking's activity feed.
 */
export async function sendFeedbackRequest(opts: { booking: Booking; renter: User }): Promise<string | null> {
  const { booking, renter } = opts
  if (!renter?.email) return null
  const locale = (renter.locale ?? 'en') as 'en' | 'es'

  const actionUrl = `${SITE_URL}/portal/stays/${booking.id}/feedback`
  const subject =
    locale === 'es'
      ? `¿Cómo estuvo tu estadía? — ${booking.propertyTitle}`
      : `How was your stay? — ${booking.propertyTitle}`

  if (!resend) {
    console.warn('[sendFeedbackRequest] RESEND_API_KEY missing — skipping send')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: renter.email,
    subject,
    react: FeedbackRequestEmail({
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      actionUrl,
      locale,
    }),
  })

  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      recipientEmail: renter.email,
      recipientUserId: renter.id,
      kind: 'feedback_request',
      subject,
      body: actionUrl,
      resendId: error ? null : data?.id ?? null,
      status: error ? 'failed' : 'sent',
    },
  })

  if (error) throw new Error(`Failed to send feedback request: ${error.message}`)
  return data?.id ?? null
}
