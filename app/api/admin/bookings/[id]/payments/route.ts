import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

/**
 * POST /api/admin/bookings/[id]/payments
 *
 * Add a line to the booking's payments log: money received (PAYMENT) or
 * something settled outside the portal (SETTLED_OUTSIDE). Both reduce the
 * balance due in that currency.
 */
const schema = z.object({
  kind: z.enum(['PAYMENT', 'SETTLED_OUTSIDE']).default('PAYMENT'),
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n > 0, 'Amount must be greater than 0'),
  currency: z.enum(['USD', 'DOP']).default('USD'),
  receivedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  method: z.string().trim().max(60).optional().nullable(),
  note: z.string().trim().max(1000).optional().nullable(),
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

  const payment = await prisma.bookingPayment.create({
    data: {
      bookingId: id,
      kind: payload.kind,
      amount: payload.amount,
      currency: payload.currency,
      receivedOn: payload.receivedOn ? new Date(`${payload.receivedOn}T00:00:00.000Z`) : null,
      method: payload.method || null,
      note: payload.note || null,
      createdByUserId: admin.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'bookingPayment',
      entityId: payment.id,
      action: 'created',
      payload: { bookingId: id, kind: payload.kind, amount: payload.amount, currency: payload.currency },
    },
  })

  return NextResponse.json({ ok: true, id: payment.id })
}
