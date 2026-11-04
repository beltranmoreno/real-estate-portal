import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

/** PATCH /api/admin/payments/[id] — mark a payment received (or not yet). */
const patchSchema = z.object({ received: z.boolean() })

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin({ throwOnFail: true })
  const { id } = await params

  let payload: z.infer<typeof patchSchema>
  try {
    payload = patchSchema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', details: (err as z.ZodError).issues }, { status: 400 })
  }

  const payment = await prisma.bookingPayment.findUnique({ where: { id } })
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  await prisma.bookingPayment.update({ where: { id }, data: { received: payload.received } })
  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'bookingPayment',
      entityId: id,
      action: payload.received ? 'marked_received' : 'marked_not_received',
      payload: { bookingId: payment.bookingId },
    },
  })
  return NextResponse.json({ ok: true })
}

/** DELETE /api/admin/payments/[id] — remove a line from a booking's payments log. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin({ throwOnFail: true })
  const { id } = await params

  const payment = await prisma.bookingPayment.findUnique({ where: { id } })
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

  await prisma.bookingPayment.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'bookingPayment',
      entityId: id,
      action: 'deleted',
      payload: {
        bookingId: payment.bookingId,
        kind: payment.kind,
        amount: payment.amount.toString(),
        currency: payment.currency,
      },
    },
  })

  return NextResponse.json({ ok: true })
}
