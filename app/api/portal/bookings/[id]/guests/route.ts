import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { sendGuestAdded } from '@/lib/email/sendGuestAdded'

/**
 * POST /api/portal/bookings/[id]/guests
 *
 * The guest who booked adds someone to their party. With an email, that
 * person gets portal access (read-only, no prices) and an invite email;
 * without one they're just listed (e.g. children).
 */
const schema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().email().optional().nullable().or(z.literal('')),
})

/** Keeps a guest's own list from growing without bound. */
const MAX_EXTRA_GUESTS = 40

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireCurrentUser()
  const { id } = await params

  let payload
  try {
    payload = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', details: (err as z.ZodError).issues }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { id: true, primaryGuestUserId: true, status: true, _count: { select: { guests: true } } },
  })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.primaryGuestUserId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (booking.status === 'CANCELLED') {
    return NextResponse.json({ error: 'This booking is cancelled' }, { status: 400 })
  }
  if (booking._count.guests >= MAX_EXTRA_GUESTS) {
    return NextResponse.json({ error: 'Too many guests on this booking' }, { status: 400 })
  }

  const email = payload.email ? payload.email.toLowerCase() : null
  if (email && email === user.email?.toLowerCase()) {
    return NextResponse.json({ error: 'That’s your own email' }, { status: 400 })
  }
  if (email) {
    const dupe = await prisma.guest.findFirst({
      where: { bookingId: id, email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    })
    if (dupe) return NextResponse.json({ error: 'This person is already on the stay' }, { status: 400 })
  }

  const guest = await prisma.guest.create({
    data: {
      bookingId: id,
      firstName: payload.firstName,
      lastName: payload.lastName ?? '',
      email,
      portalAccess: Boolean(email),
    },
  })
  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entity: 'guest',
      entityId: guest.id,
      action: 'created_by_guest',
      payload: { bookingId: id, portalAccess: guest.portalAccess },
    },
  })

  if (guest.portalAccess) await sendGuestAdded(guest.id)
  return NextResponse.json({ ok: true, id: guest.id })
}
