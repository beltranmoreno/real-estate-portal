import 'server-only'
import { Resend } from 'resend'
import { format } from 'date-fns'
import RequestCreatedEmail from '@/emails/RequestCreatedEmail'
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

interface SendRequestCreatedOpts {
  booking: Booking
  renter: User
  requestId: string
  title: string
  description?: string | null
  expectsDocument: boolean
  dueAt?: Date | null
}

export async function sendRequestCreated(
  opts: SendRequestCreatedOpts
): Promise<string | null> {
  const { booking, renter, requestId, title, description, expectsDocument, dueAt } = opts
  const locale = (renter.locale ?? 'en') as 'en' | 'es'

  const actionUrl = `${SITE_URL}/portal/stays/${booking.id}/requests/${requestId}`
  const subject =
    locale === 'es' ? `${title} — ${booking.propertyTitle}` : `${title} — ${booking.propertyTitle}`

  if (!resend) {
    console.warn('[sendRequestCreated] RESEND_API_KEY missing — skipping send')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: renter.email,
    subject,
    react: RequestCreatedEmail({
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      requestTitle: title,
      requestDescription: description ?? null,
      expectsDocument,
      dueAt: dueAt ? format(dueAt, 'MMM d, yyyy') : null,
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
        kind: 'request_created',
        subject,
        body: actionUrl,
        status: 'failed',
      },
    })
    throw new Error(`Failed to send request notification: ${error.message}`)
  }

  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      recipientEmail: renter.email,
      recipientUserId: renter.id,
      kind: 'request_created',
      subject,
      body: actionUrl,
      resendId: data?.id ?? null,
      status: 'sent',
    },
  })

  return data?.id ?? null
}
