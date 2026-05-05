import { NextResponse } from 'next/server'
import { z } from 'zod'
import { addDays } from 'date-fns'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { sendInvitation } from '@/lib/email/sendInvitation'

/**
 * POST /api/admin/bookings
 *
 * Creates a Booking (status: PENDING) AND an Invitation, then sends the
 * magic-link email. Renter completes Clerk signup → accepts invitation
 * → Booking becomes CONFIRMED.
 */
const schema = z.object({
  propertySanityId: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guestCount: z.union([z.string(), z.number()]).optional().nullable(),
  totalAmount: z.union([z.string(), z.number()]).optional().nullable(),
  balanceDue: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().optional().nullable(),
  locale: z.enum(['en', 'es']).default('en'),
})

function toDate(s: string): Date {
  // Treat YYYY-MM-DD inputs as midnight UTC so they stay calendar-anchored
  // regardless of server timezone.
  return new Date(`${s}T00:00:00.000Z`)
}

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function POST(req: Request) {
  const admin = await requireAdmin({ throwOnFail: true })

  let payload
  try {
    payload = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload', details: (err as z.ZodError).issues },
      { status: 400 }
    )
  }

  const checkIn = toDate(payload.checkIn)
  const checkOut = toDate(payload.checkOut)
  if (checkOut <= checkIn) {
    return NextResponse.json(
      { error: 'Check-out must be after check-in' },
      { status: 400 }
    )
  }

  // Snapshot the property title so the invitation email + history records
  // still read cleanly even if the property is deleted/renamed in Sanity.
  const property = await getPropertyForPortal(payload.propertySanityId)
  if (!property) {
    return NextResponse.json(
      { error: 'Property not found in Sanity' },
      { status: 400 }
    )
  }
  const propertyTitle =
    property.title_en || property.title_es || 'Casa de Campo property'

  // Find or create a User row for the renter so the booking has a
  // primaryGuestUserId. The User starts with role=RENTER and a placeholder
  // clerkId until they accept the invitation and Clerk creates a real one.
  // Webhook reconciles the placeholder when they sign up.
  const placeholderClerkId = `pending:${payload.email.toLowerCase()}`
  const renter = await prisma.user.upsert({
    where: { email: payload.email.toLowerCase() },
    create: {
      email: payload.email.toLowerCase(),
      firstName: payload.firstName ?? null,
      lastName: payload.lastName ?? null,
      clerkId: placeholderClerkId,
      role: 'RENTER',
      locale: payload.locale,
    },
    update: {
      // Don't override existing names if guest already has them
      firstName: payload.firstName ?? undefined,
      lastName: payload.lastName ?? undefined,
    },
  })

  // Create everything in one transaction so a failed email send doesn't
  // leave us with an orphaned Booking with no Invitation pointer.
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: {
        propertySanityId: payload.propertySanityId,
        propertyTitle,
        primaryGuestUserId: renter.id,
        checkIn,
        checkOut,
        guestCount: toNumberOrNull(payload.guestCount),
        totalAmount: toNumberOrNull(payload.totalAmount),
        balanceDue: toNumberOrNull(payload.balanceDue),
        internalNotes: payload.notes || null,
        status: 'PENDING',
      },
    })

    const invitation = await tx.invitation.create({
      data: {
        email: payload.email.toLowerCase(),
        firstName: payload.firstName ?? null,
        lastName: payload.lastName ?? null,
        propertySanityId: payload.propertySanityId,
        propertyTitle,
        checkIn,
        checkOut,
        guestCount: toNumberOrNull(payload.guestCount),
        notes: payload.notes || null,
        expiresAt: addDays(new Date(), 30),
        createdByUserId: admin.id,
        resultingBookingId: booking.id,
      },
    })

    await tx.auditLog.create({
      data: {
        actorUserId: admin.id,
        entity: 'booking',
        entityId: booking.id,
        action: 'created',
        payload: { propertyTitle, email: payload.email },
      },
    })

    return { booking, invitation }
  })

  // Email is fire-and-forget from the user's perspective but we await so
  // we can surface failure messages.
  try {
    await sendInvitation({
      invitation: result.invitation,
      locale: payload.locale,
    })
  } catch (err) {
    console.error('[admin/bookings POST] invitation email failed', err)
    // We've already created the booking. Surface the failure but don't
    // roll back — admin can resend from the booking detail page.
    return NextResponse.json(
      {
        bookingId: result.booking.id,
        warning: 'Booking created, but invitation email failed. Resend from the booking detail page.',
      },
      { status: 207 }
    )
  }

  return NextResponse.json({ bookingId: result.booking.id }, { status: 201 })
}
