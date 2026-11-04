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
  'Leticia Coudray <hello@updates.leticiacoudrayrealestate.com>'
const REPLY_TO =
  process.env.PORTAL_EMAIL_REPLY_TO || 'leticiacoudrayrealestate@gmail.com'

interface SendRequestCreatedOpts {
  booking: Booking
  renter: User
  /** One request, or several created together — they go out as one email. */
  requests: Array<{
    id: string
    title: string
    description?: string | null
    expectsDocument: boolean
    dueAt?: Date | null
  }>
}

export async function sendRequestCreated(
  opts: SendRequestCreatedOpts
): Promise<string | null> {
  const { booking, renter, requests } = opts
  if (requests.length === 0) return null
  const locale = (renter.locale ?? 'en') as 'en' | 'es'
  const many = requests.length > 1

  // One request opens it directly; several open the stay's to-do list.
  const actionUrl = many
    ? `${SITE_URL}/portal/stays/${booking.id}#to-do`
    : `${SITE_URL}/portal/stays/${booking.id}/requests/${requests[0].id}`
  const subject = many
    ? locale === 'es'
      ? `${requests.length} solicitudes — ${booking.propertyTitle}`
      : `${requests.length} requests — ${booking.propertyTitle}`
    : `${requests[0].title} — ${booking.propertyTitle}`

  if (!resend) {
    console.warn('[sendRequestCreated] RESEND_API_KEY missing — skipping send')
    return null
  }

  // Guests added with only a phone number have no email to send to.
  if (!renter.email) {
    console.warn('[sendRequestCreated] guest has no email — skipping send')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: renter.email,
    subject,
    react: RequestCreatedEmail({
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      requests: requests.map((r) => ({
        title: r.title,
        description: r.description ?? null,
        expectsDocument: r.expectsDocument,
        dueAt: r.dueAt ? format(r.dueAt, 'd MMM yyyy') : null,
      })),
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
