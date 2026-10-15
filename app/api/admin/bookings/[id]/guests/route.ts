import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

/**
 * POST /api/admin/bookings/[id]/guests
 *
 * Add an extra guest to a stay. With `portalAccess` on, whoever signs in to
 * the portal with this email gets a read-only, price-free view of the stay.
 */
const schema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().email().optional().nullable().or(z.literal('')),
  portalAccess: z.boolean().default(false),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin({ throwOnFail: true })
  const { id } = await params

  let payload
  try {
    payload = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload', details: (err as z.ZodError).issues },
      { status: 400 }
    )
  }

  const email = payload.email ? payload.email.toLowerCase() : null
  if (payload.portalAccess && !email) {
    return NextResponse.json({ error: 'Portal access needs an email' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true } })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const guest = await prisma.guest.create({
    data: {
      bookingId: id,
      firstName: payload.firstName,
      lastName: payload.lastName ?? '',
      email,
      portalAccess: payload.portalAccess,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'guest',
      entityId: guest.id,
      action: 'created',
      payload: { bookingId: id, portalAccess: payload.portalAccess },
    },
  })

  return NextResponse.json({ ok: true, id: guest.id })
}
