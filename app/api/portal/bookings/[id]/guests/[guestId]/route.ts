import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'

/** DELETE — the guest who booked removes someone from their party. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; guestId: string }> }) {
  const user = await requireCurrentUser()
  const { id, guestId } = await params

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: { id: true, bookingId: true, isPrimary: true, booking: { select: { primaryGuestUserId: true } } },
  })
  if (!guest || guest.bookingId !== id) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  if (guest.booking.primaryGuestUserId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (guest.isPrimary) return NextResponse.json({ error: 'You can’t remove yourself' }, { status: 400 })

  await prisma.guest.delete({ where: { id: guestId } })
  await prisma.auditLog.create({
    data: { actorUserId: user.id, entity: 'guest', entityId: guestId, action: 'deleted_by_guest', payload: { bookingId: id } },
  })
  return NextResponse.json({ ok: true })
}
