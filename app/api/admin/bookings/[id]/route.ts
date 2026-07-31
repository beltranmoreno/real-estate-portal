import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'

/**
 * PATCH /api/admin/bookings/[id]
 *
 * Edit an existing booking. Every field is optional — pass only what
 * you want to change. Useful when the original was created with a
 * mistake, or when stay details change.
 *
 * Property is intentionally NOT editable — that's a fundamentally
 * different booking. Cancel and create a new one instead.
 */
const schema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guestCount: z
    .union([z.string(), z.number()])
    .optional()
    .nullable(),
  status: z
    .enum(['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
    .optional(),
  totalAmount: z.union([z.string(), z.number()]).optional().nullable(),
  balanceDue: z.union([z.string(), z.number()]).optional().nullable(),
  paidInFull: z.boolean().optional(),
  arrivalDetails: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  keyCode: z.string().optional().nullable(),
})

function toDate(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`)
}

function toNumberOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
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

  const before = await prisma.booking.findUnique({ where: { id } })
  if (!before) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Build the update payload only with fields the caller actually sent.
  const data: Record<string, unknown> = {}
  if (payload.checkIn !== undefined) data.checkIn = toDate(payload.checkIn)
  if (payload.checkOut !== undefined) data.checkOut = toDate(payload.checkOut)
  if (payload.guestCount !== undefined) {
    data.guestCount = toNumberOrNull(payload.guestCount)
  }
  if (payload.status !== undefined) data.status = payload.status
  if (payload.totalAmount !== undefined) {
    data.totalAmount = toNumberOrNull(payload.totalAmount)
  }
  if (payload.balanceDue !== undefined) {
    data.balanceDue = toNumberOrNull(payload.balanceDue)
  }
  if (payload.paidInFull !== undefined) data.paidInFull = payload.paidInFull
  if (payload.arrivalDetails !== undefined) {
    data.arrivalDetails = payload.arrivalDetails
  }
  if (payload.internalNotes !== undefined) {
    data.internalNotes = payload.internalNotes
  }
  if (payload.keyCode !== undefined) {
    data.keyCode = payload.keyCode || null
    // If the keyCode was cleared OR changed, reset the released
    // timestamp so the daily cron can re-release fresh.
    if (payload.keyCode !== before.keyCode) {
      data.keyReleasedAt = null
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  // Sanity check: check-out must be after check-in. Validates against
  // the merged dates (existing + new) so a partial update doesn't
  // create an invalid window.
  const finalCheckIn = data.checkIn ?? before.checkIn
  const finalCheckOut = data.checkOut ?? before.checkOut
  if ((finalCheckOut as Date) <= (finalCheckIn as Date)) {
    return NextResponse.json(
      { error: 'Check-out must be after check-in' },
      { status: 400 }
    )
  }

  await prisma.booking.update({ where: { id }, data })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'booking',
      entityId: id,
      action: 'updated',
      payload: JSON.parse(JSON.stringify({ changes: data })),
    },
  })

  return NextResponse.json({ ok: true })
}
