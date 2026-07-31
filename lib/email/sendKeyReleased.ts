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
  'Leticia Coudray <hello@leticiacoudrayrealestate.com>'

interface Opts {
  booking: Booking
  renter: User
}

export async function sendKeyReleased(opts: Opts): Promise<string | null> {
  const { booking, renter } = opts
  if (!booking.keyCode) {
    throw new Error('Booking has no keyCode set')
  }
  const locale = (renter.locale ?? 'en') as 'en' | 'es'
  const subject =
    locale === 'es'
      ? `Tu código para ${booking.propertyTitle}`
      : `Your check-in code for ${booking.propertyTitle}`

  if (!resend) {
    console.warn('[sendKeyReleased] RESEND_API_KEY missing — skipping send')
    return null
  }

  const checkInLabel = format(booking.checkIn, "EEEE, MMM d")
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: renter.email,
    subject,
    react: KeyReleasedEmail({
      firstName: renter.firstName,
      propertyTitle: booking.propertyTitle,
      keyCode: booking.keyCode,
      checkInLabel,
      locale,
    }),
  })

  await prisma.notification.create({
    data: {
      bookingId: booking.id,
      recipientEmail: renter.email,
      recipientUserId: renter.id,
      kind: 'key_released',
      subject,
      body: booking.keyCode,
      resendId: data?.id ?? null,
      status: error ? 'failed' : 'sent',
    },
  })

  if (error) throw new Error(`Failed: ${error.message}`)
  return data?.id ?? null
}
