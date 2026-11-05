import 'server-only'
import { Resend } from 'resend'
import { format } from 'date-fns'
import KeyReleasedEmail from '@/emails/KeyReleasedEmail'
import { prisma } from '@/lib/db'
import type { Booking, User } from '@prisma/client'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM ||
  'Leticia Coudray Real Estate <hello@updates.leticiacoudrayrealestate.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const REPLY_TO =
  process.env.PORTAL_EMAIL_REPLY_TO || 'leticiacoudrayrealestate@gmail.com'

interface Opts {
  booking: Booking
  renter: User
  /** Include the door code (only once it's released). */
  includeCode: boolean
}

export async function sendKeyReleased(opts: Opts): Promise<string | null> {
  const { booking, renter } = opts
  const keyCode = opts.includeCode ? booking.keyCode : null
  const locale = (renter.locale ?? 'en') as 'en' | 'es'
  const subject = keyCode
    ? locale === 'es'
      ? `Tu código para ${booking.propertyTitle}`
      : `Your check-in code for ${booking.propertyTitle}`
    : locale === 'es'
      ? `Tu estadía en ${booking.propertyTitle} comienza mañana`
      : `Your stay at ${booking.propertyTitle} starts tomorrow`

  if (!resend) {
    console.warn('[sendKeyReleased] RESEND_API_KEY missing — skipping send')
    return null
  }

  const checkInLabel = format(booking.checkIn, "EEEE, MMM d")
  // Guests added with only a phone number have no email to send to.
  if (!renter.email) {
    console.warn('[sendKeyReleased] guest has no email — skipping send')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: renter.email,
    subject,
    react: KeyReleasedEmail({
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      keyCode,
      checkInLabel,
      stayUrl: `${SITE_URL}/portal/stays/${booking.id}#house`,
      locale,
    }),
  })

  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      recipientEmail: renter.email,
      recipientUserId: renter.id,
      kind: keyCode ? 'key_released' : 'pre_arrival',
      subject,
      body: keyCode ?? '',
      resendId: data?.id ?? null,
      status: error ? 'failed' : 'sent',
    },
  })

  if (error) throw new Error(`Failed: ${error.message}`)
  return data?.id ?? null
}
