import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

/**
 * POST /api/admin/bookings/[id]/charges
 *
 * Log an extra cost on a stay (supermarket run, alcohol, one-off extra),
 * optionally linked to a receipt already uploaded to this booking.
 */
const schema = z.object({
  category: z.enum(['GROCERIES', 'ALCOHOL', 'SERVICE', 'EXTRA']),
  description: z.string().trim().min(1).max(300),
  amount: z.union([z.string(), z.number()]).transform((v) => Number(v)).refine((n) => Number.isFinite(n) && n >= 0, 'Invalid amount'),
  currency: z.enum(['USD', 'DOP']).default('USD'),
  cost: z.union([z.string(), z.number()]).optional().nullable(),
  incurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  documentId: z.string().optional().nullable(),
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

  const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true } })
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  // A receipt must belong to this booking and not already back another charge.
  if (payload.documentId) {
    const doc = await prisma.document.findFirst({
      where: { id: payload.documentId, bookingId: id },
      select: { id: true, charge: { select: { id: true } } },
    })
    if (!doc) return NextResponse.json({ error: 'Receipt not found on this booking' }, { status: 400 })
    if (doc.charge) return NextResponse.json({ error: 'That receipt is already linked to a charge' }, { status: 400 })
  }

  const charge = await prisma.bookingCharge.create({
    data: {
      bookingId: id,
      category: payload.category,
      description: payload.description,
      amount: payload.amount,
      currency: payload.currency,
      cost:
        payload.cost === undefined || payload.cost === null || payload.cost === '' || !Number.isFinite(Number(payload.cost))
          ? null
          : Number(payload.cost),
      incurredOn: payload.incurredOn ? new Date(`${payload.incurredOn}T00:00:00.000Z`) : null,
      documentId: payload.documentId || null,
      createdByUserId: admin.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'bookingCharge',
      entityId: charge.id,
      action: 'created',
      payload: { bookingId: id, amount: payload.amount, currency: payload.currency, category: payload.category },
    },
  })

  return NextResponse.json({ ok: true, id: charge.id })
}
