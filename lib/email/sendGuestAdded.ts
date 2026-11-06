import 'server-only'
import { Resend } from 'resend'
import { format } from 'date-fns'
import { es as esLocale } from 'date-fns/locale'
import GuestAddedEmail from '@/emails/GuestAddedEmail'
import { prisma } from '@/lib/db'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM || 'Leticia Coudray <hello@updates.leticiacoudrayrealestate.com>'
const REPLY_TO = process.env.PORTAL_EMAIL_REPLY_TO || 'leticiacoudrayrealestate@gmail.com'

/**
 * Invite an extra guest who has portal access. Written in the booking guest's
 * language. Best-effort: logs a Notification and never throws, so adding the
 * guest never fails because of the email.
 */
export async function sendGuestAdded(guestId: string): Promise<boolean> {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { booking: { include: { primaryGuest: true } } },
    })
    if (!guest?.email || !guest.portalAccess || !resend) return false
    const { booking } = guest
    const primary = booking.primaryGuest
    const locale: 'en' | 'es' = primary.locale === 'es' ? 'es' : 'en'
    const df = locale === 'es' ? { locale: esLocale } : undefined
    // @db.Date at UTC midnight — format the calendar day, not local time.
    const day = (d: Date) => format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), locale === 'es' ? 'd MMM' : 'MMM d', df)
    const dates = `${day(booking.checkIn)} – ${day(booking.checkOut)}, ${booking.checkOut.getUTCFullYear()}`
    const bookedBy = [primary.firstName, primary.lastName].filter(Boolean).join(' ') || null
    const subject =
      locale === 'es'
        ? `Te agregaron a la estadía en ${booking.propertyTitle}`
        : `You’ve been added to the stay at ${booking.propertyTitle}`
    const actionUrl = `${SITE_URL}/portal/stays/${booking.id}`

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      replyTo: REPLY_TO,
      to: guest.email,
      subject,
      react: GuestAddedEmail({
        firstName: guest.firstName,
        bookedBy,
        propertyTitle: booking.propertyTitle,
        dates,
        email: guest.email,
        actionUrl,
        locale,
      }),
    })
    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        recipientEmail: guest.email,
        kind: 'guest_added',
        subject,
        body: actionUrl,
        resendId: error ? null : (data?.id ?? null),
        status: error ? 'failed' : 'sent',
      },
    })
    return !error
  } catch (err) {
    console.error('[sendGuestAdded] failed', err)
    return false
  }
}
