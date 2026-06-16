import 'server-only'
import { Resend } from 'resend'
import SubmissionRejectedEmail from '@/emails/SubmissionRejectedEmail'
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
  requestId: string
  requestTitle: string
  note: string | null
}

export async function sendSubmissionRejected(opts: Opts): Promise<string | null> {
  const { booking, renter, requestId, requestTitle, note } = opts
  const locale = (renter.locale ?? 'en') as 'en' | 'es'

  const actionUrl = `${SITE_URL}/portal/stays/${booking.id}/requests/${requestId}`
  const subject =
    locale === 'es'
      ? `Por favor reenvía: ${requestTitle}`
      : `Please re-submit: ${requestTitle}`

  if (!resend) {
    console.warn('[sendSubmissionRejected] RESEND_API_KEY missing — skipping')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: renter.email,
    subject,
    react: SubmissionRejectedEmail({
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      requestTitle,
      note,
      actionUrl,
      locale,
    }),
  })

  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      recipientEmail: renter.email,
      recipientUserId: renter.id,
      kind: 'submission_rejected',
      subject,
      body: actionUrl,
      resendId: data?.id ?? null,
      status: error ? 'failed' : 'sent',
    },
  })

  if (error) throw new Error(`Failed: ${error.message}`)
  return data?.id ?? null
}
