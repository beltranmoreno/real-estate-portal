import { NextResponse } from 'next/server'
import { z } from 'zod'
import { addDays } from 'date-fns'
import { prisma } from '@/lib/db'
import { newInviteToken } from '@/lib/auth/inviteToken'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { sendInvitation } from '@/lib/email/sendInvitation'

/**
 * POST /api/admin/bookings/[id]/invitation
 *
 * Manage a booking's invitation from the detail page:
 *   - 'prepare' → create the invitation if missing, but don't email it
 *                 (promotes a DRAFT booking to PENDING).
 *   - 'send'    → create it if missing, email the magic link, stamp sentAt
 *                 (also covers resending). Promotes DRAFT → PENDING.
 */
const schema = z.object({ action: z.enum(['prepare', 'send']) })

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
  const { id } = await params

  let action: 'prepare' | 'send'
  try {
    action = schema.parse(await req.json()).action
  } catch {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { invitation: true, primaryGuest: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (booking.status === 'CANCELLED') {
    return NextResponse.json(
      { error: 'This booking is cancelled — reopen it before inviting the guest' },
      { status: 409 }
    )
  }
  if (booking.invitation?.status === 'ACCEPTED') {
    return NextResponse.json(
      { error: 'Invitation already accepted' },
      { status: 409 }
    )
  }

  // The portal invitation goes by email; a phone-only guest needs one first.
  const guestEmail = booking.primaryGuest.email
  if (!guestEmail) {
    return NextResponse.json(
      { error: 'Add an email for this guest before inviting them to the portal' },
      { status: 400 }
    )
  }

  const locale: 'en' | 'es' = booking.primaryGuest.locale === 'es' ? 'es' : 'en'

  // Ensure an invitation exists (create for drafts).
  let invitation = booking.invitation
  if (!invitation) {
    invitation = await prisma.invitation.create({
      data: {
        token: newInviteToken(),
        email: guestEmail,
        firstName: booking.primaryGuest.firstName,
        lastName: booking.primaryGuest.lastName,
        propertySanityId: booking.propertySanityId,
        propertyTitle: booking.propertyTitle,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestCount: booking.guestCount,
        expiresAt: addDays(new Date(), 30),
        createdByUserId: admin.id,
        resultingBookingId: booking.id,
      },
    })
  }

  // An invitation revoked (booking cancelled, then reopened) or expired
  // works again for another 30 days when it's prepared or resent.
  if (invitation.status === 'REVOKED' || invitation.status === 'EXPIRED' || invitation.expiresAt < new Date()) {
    invitation = await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'PENDING', expiresAt: addDays(new Date(), 30) },
    })
  }
  // Invitations made before the random tokens get one when they're resent
  // (a new token is 43 characters; the old cuid ones are 25).
  if (action === 'send' && invitation.token.length < 40) {
    invitation = await prisma.invitation.update({
      where: { id: invitation.id },
      data: { token: newInviteToken() },
    })
  }

  // A booking with an invitation is at least PENDING.
  if (booking.status === 'DRAFT') {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'PENDING' },
    })
  }

  if (action === 'send') {
    try {
      await sendInvitation({ invitation, locale })
    } catch (err) {
      console.error('[bookings/invitation] send failed', err)
      return NextResponse.json(
        { error: 'Invitation email failed to send. Try again.' },
        { status: 502 }
      )
    }
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { sentAt: new Date() },
    })
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'invitation',
      entityId: invitation.id,
      action: action === 'send' ? 'sent' : 'prepared',
      payload: { bookingId: booking.id, email: invitation.email },
    },
  })

  return NextResponse.json({ ok: true, action })
}
