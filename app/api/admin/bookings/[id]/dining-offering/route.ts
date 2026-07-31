import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import type { Prisma } from '@prisma/client'

/**
 * PUT /api/admin/bookings/[id]/dining-offering
 *
 * Sets the per-booking availability allow-lists — concierge services, chef
 * menus, and à-la-carte plates. Nothing is offered to the guest unless it's
 * in these lists (see getDiningForBooking / the guest concierge filter).
 *
 * Each field is OPTIONAL: only the arrays present in the request body are
 * updated, so the services picker and the dining picker can save
 * independently without clobbering each other.
 */
const schema = z.object({
  offeredServiceSanityIds: z.array(z.string().min(1)).max(300).optional(),
  offeredMenuSanityIds: z.array(z.string().min(1)).max(200).optional(),
  offeredPlateSanityIds: z.array(z.string().min(1)).max(400).optional(),
  offerGroceries: z.boolean().optional(),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin({ throwOnFail: true })
  const { id } = await params

  let body
  try {
    body = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload', details: (err as z.ZodError).issues },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Only update the arrays actually provided; de-dupe defensively.
  const data: Prisma.BookingUpdateInput = {}
  const audit: Record<string, number> = {}
  if (body.offeredServiceSanityIds) {
    const v = Array.from(new Set(body.offeredServiceSanityIds))
    data.offeredServiceSanityIds = v
    audit.serviceCount = v.length
  }
  if (body.offeredMenuSanityIds) {
    const v = Array.from(new Set(body.offeredMenuSanityIds))
    data.offeredMenuSanityIds = v
    audit.menuCount = v.length
  }
  if (body.offeredPlateSanityIds) {
    const v = Array.from(new Set(body.offeredPlateSanityIds))
    data.offeredPlateSanityIds = v
    audit.plateCount = v.length
  }
  if (typeof body.offerGroceries === 'boolean') {
    data.offerGroceries = body.offerGroceries
    audit.groceries = body.offerGroceries ? 1 : 0
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  await prisma.booking.update({ where: { id: booking.id }, data })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'booking',
      entityId: booking.id,
      action: 'offering_updated',
      payload: audit,
    },
  })

  return NextResponse.json({ ok: true })
}
