import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { addDays } from 'date-fns'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { getPropertyForPortal } from '@/lib/portal/properties'
import { getPropertyDiningDefaults } from '@/lib/portal/presetMenus'
import { sendInvitation } from '@/lib/email/sendInvitation'
import { guestDetailsSchema, guestDetailsToData } from '@/lib/admin/guestInput'
import { parseRatePeriods } from '@/lib/bookingRates'

/**
 * POST /api/admin/bookings
 *
 * Creates a Booking (status: PENDING) AND an Invitation, then sends the
 * magic-link email. Renter completes Clerk signup → accepts invitation
 * → Booking becomes CONFIRMED.
 *
 * The guest is an existing user (`guestUserId`) or a new one with an email,
 * a phone or both. Without an email it can only be saved as a draft — the
 * portal invitation goes by email.
 */
const amount = z.union([z.string(), z.number()]).optional().nullable()
const paymentSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n > 0, 'Payment amount must be greater than 0'),
  currency: z.enum(['USD', 'DOP']).default('USD'),
  receivedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  received: z.boolean().default(true),
  method: z.string().trim().max(60).optional().nullable(),
})
const schema = guestDetailsSchema.extend({
  propertySanityId: z.string().min(1),
  guestUserId: z.string().optional().nullable(),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guestCount: amount,
  nightlyRate: amount,
  /** Rate periods when the price changes during the stay. */
  nightlyRates: z
    .array(z.object({ from: z.string(), to: z.string(), rate: z.union([z.string(), z.number()]) }))
    .optional()
    .nullable(),
  totalAmount: amount,
  commissionAmount: amount,
  securityDeposit: amount,
  payments: z.array(paymentSchema).max(30).default([]),
  notes: z.string().optional().nullable(),
  locale: z.enum(['en', 'es']).default('en'),
  // How far to take creation:
  //   'draft'  → booking only, no invitation
  //   'invite' → booking + invitation, but don't email it yet
  //   'send'   → booking + invitation + send the magic-link email (default)
  mode: z.enum(['draft', 'invite', 'send']).default('send'),
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

/**
 * The User row for a new guest. By email when there is one (it may already
 * exist); phone-only guests reuse an email-less guest with the same number.
 * Only the fields the admin filled in are written to a guest who exists.
 */
async function findOrCreateGuest(details: ReturnType<typeof guestDetailsToData>, locale: 'en' | 'es') {
  const filled = Object.fromEntries(Object.entries(details).filter(([, v]) => v !== null))
  if (details.email) {
    return prisma.user.upsert({
      where: { email: details.email },
      create: { ...details, clerkId: `pending:${details.email}`, role: 'RENTER', locale },
      update: filled,
    })
  }
  const samePhone = await prisma.user.findFirst({ where: { phone: details.phone, email: null } })
  if (samePhone) return prisma.user.update({ where: { id: samePhone.id }, data: filled })
  return prisma.user.create({
    data: { ...details, clerkId: `pending:${randomUUID()}`, role: 'RENTER', locale },
  })
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

  // Who the booking is for: a guest picked from the list, or a new one.
  const details = guestDetailsToData(payload)
  const existing = payload.guestUserId
    ? await prisma.user.findUnique({ where: { id: payload.guestUserId } })
    : null
  if (payload.guestUserId && !existing) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 400 })
  }
  if (!existing && !details.email && !details.phone) {
    return NextResponse.json({ error: 'Add an email or a phone number for the guest' }, { status: 400 })
  }
  const guestEmail = existing ? existing.email : details.email
  if (payload.mode !== 'draft' && !guestEmail) {
    return NextResponse.json(
      { error: 'A guest without an email can only be saved as a draft — the invitation goes by email' },
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

  // Pre-fill the booking's dining allow-list from the property's defaults so
  // the admin starts from a sensible baseline (they can trim it afterwards).
  // Concierge services have no property-level default, so they start empty —
  // the admin turns those on explicitly.
  const diningDefaults = await getPropertyDiningDefaults(payload.propertySanityId)

  // Find or create a User row for the renter so the booking has a
  // primaryGuestUserId. The User starts with role=RENTER and a placeholder
  // clerkId until they accept the invitation and Clerk creates a real one.
  // Webhook reconciles the placeholder (by email) when they sign up.
  const renter = existing ?? (await findOrCreateGuest(details, payload.locale))

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
        nightlyRate: toNumberOrNull(payload.nightlyRate),
        ...(payload.nightlyRates && parseRatePeriods(payload.nightlyRates).length > 0
          ? { nightlyRates: parseRatePeriods(payload.nightlyRates) }
          : {}),
        totalAmount: toNumberOrNull(payload.totalAmount),
        commissionAmount: toNumberOrNull(payload.commissionAmount),
        securityDeposit: toNumberOrNull(payload.securityDeposit),
        internalNotes: payload.notes || null,
        // Draft = no invitation yet; the invite modes make it PENDING.
        status: payload.mode === 'draft' ? 'DRAFT' : 'PENDING',
        offeredMenuSanityIds: diningDefaults.menuIds,
        offeredPlateSanityIds: diningDefaults.plateIds,
      },
    })

    // Drafts get no invitation — the admin can create/send one later from
    // the booking detail page.
    const invitation =
      payload.mode === 'draft'
        ? null
        : await tx.invitation.create({
            data: {
              email: guestEmail!,
              firstName: renter.firstName,
              lastName: renter.lastName,
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

    if (payload.payments.length > 0) {
      await tx.bookingPayment.createMany({
        data: payload.payments.map((p) => ({
          bookingId: booking.id,
          amount: p.amount,
          currency: p.currency,
          receivedOn: p.receivedOn ? toDate(p.receivedOn) : null,
          received: p.received,
          method: p.method || null,
          createdByUserId: admin.id,
        })),
      })
    }

    await tx.auditLog.create({
      data: {
        actorUserId: admin.id,
        entity: 'booking',
        entityId: booking.id,
        action:
          payload.mode === 'draft'
            ? 'created_draft'
            : payload.mode === 'invite'
              ? 'created_with_invitation'
              : 'created',
        payload: { propertyTitle, guestUserId: renter.id, mode: payload.mode },
      },
    })

    return { booking, invitation }
  })

  // Only 'send' mode emails the invitation. Draft/invite stop here.
  if (payload.mode === 'send' && result.invitation) {
    try {
      await sendInvitation({
        invitation: result.invitation,
        locale: payload.locale,
      })
      await prisma.invitation.update({
        where: { id: result.invitation.id },
        data: { sentAt: new Date() },
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
  }

  return NextResponse.json(
    { bookingId: result.booking.id, mode: payload.mode },
    { status: 201 }
  )
}
