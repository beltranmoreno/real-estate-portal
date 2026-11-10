import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { canSeeFinancials } from '@/lib/auth/permissions'

/**
 * DELETE /api/admin/charges/[id]
 *
 * Remove an extra cost from a stay. The linked receipt document is kept.
 * STAFF can only remove charges they added themselves.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
  const { id } = await params

  const charge = await prisma.bookingCharge.findUnique({ where: { id } })
  if (!charge) return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
  if (!canSeeFinancials(admin.role) && charge.createdByUserId !== admin.id) {
    return NextResponse.json({ error: 'You can only remove charges you added' }, { status: 403 })
  }

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
