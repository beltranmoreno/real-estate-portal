import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

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
