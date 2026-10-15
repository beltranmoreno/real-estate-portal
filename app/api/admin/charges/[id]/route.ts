import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

/**
 * DELETE /api/admin/charges/[id]
 *
 * Remove an extra cost from a stay. The linked receipt document is kept.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin({ throwOnFail: true })
  const { id } = await params

  const charge = await prisma.bookingCharge.findUnique({ where: { id } })
  if (!charge) return NextResponse.json({ error: 'Charge not found' }, { status: 404 })

  await prisma.bookingCharge.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'bookingCharge',
      entityId: id,
      action: 'deleted',
      payload: {
        bookingId: charge.bookingId,
        amount: charge.amount.toString(),
        currency: charge.currency,
        description: charge.description,
      },
    },
  })

  return NextResponse.json({ ok: true })
}
