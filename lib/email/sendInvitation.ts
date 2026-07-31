import 'server-only'
import { Resend } from 'resend'
import { format } from 'date-fns'
import InvitationEmail from '@/emails/InvitationEmail'
import { prisma } from '@/lib/db'
import type { Invitation } from '@prisma/client'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM ||
  'Leticia Coudray <hello@leticiacoudrayrealestate.com>'

interface SendInvitationOpts {
  invitation: Invitation
  locale?: 'en' | 'es'
}

/**
 * Sends the invitation email and writes a row to the Notification log.
 * Returns the Resend message id (or null if Resend isn't configured).
 */
export async function sendInvitation(opts: SendInvitationOpts): Promise<string | null> {
  const { invitation, locale = 'en' } = opts

  const acceptUrl = `${SITE_URL}/portal/accept-invite?token=${invitation.token}`
  const subject =
    locale === 'es'
      ? `Tu portal para ${invitation.propertyTitle}`
      : `Your portal for ${invitation.propertyTitle}`

  const checkInLabel = format(invitation.checkIn, 'MMM d, yyyy')
  const checkOutLabel = format(invitation.checkOut, 'MMM d, yyyy')

  if (!resend) {
    console.warn('[sendInvitation] RESEND_API_KEY missing — skipping send')
    return null
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: invitation.email,
    subject,
    react: InvitationEmail({
      firstName: invitation.firstName,
      propertyTitle: invitation.propertyTitle,
      checkIn: checkInLabel,
      checkOut: checkOutLabel,
      acceptUrl,
      locale,
    }),
  })

  if (error) {
    console.error('[sendInvitation] resend error', error)
    await prisma.notification.create({
      data: {
        recipientEmail: invitation.email,
        kind: 'invitation',
        subject,
        body: acceptUrl,
        status: 'failed',
      },
    })
    throw new Error(`Failed to send invitation: ${error.message}`)
  }

  await prisma.notification.create({
    data: {
      recipientEmail: invitation.email,
      kind: 'invitation',
      subject,
      body: acceptUrl,
      resendId: data?.id ?? null,
      status: 'sent',
    },
  })

  return data?.id ?? null
}
