import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { sendFeedbackRequest } from '@/lib/email/sendFeedbackRequest'

/**
 * POST /api/admin/bookings/[id]/feedback-email
 *
 * Sends the guest the post-stay thank-you email with the link to their
 * private feedback form. Only for completed stays. Marks
 * `feedbackEmailSentAt`, so the daily cron won't send it a second time.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
  const { id } = await params

  const booking = await prisma.booking.findUnique({ where: { id }, include: { primaryGuest: true } })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (!booking.completedAt) {
    return NextResponse.json({ error: 'Mark the stay completed first' }, { status: 409 })
  }
  if (!booking.primaryGuest?.email) {
    return NextResponse.json({ error: 'The guest has no email address' }, { status: 409 })
  }

  try {
    await sendFeedbackRequest({ booking, renter: booking.primaryGuest })
  } catch (err) {
    console.error('[feedback-email] send failed', id, err)
    return NextResponse.json({ error: 'Could not send the email' }, { status: 502 })
  }

  await prisma.booking.update({ where: { id }, data: { feedbackEmailSentAt: new Date() } })
  await prisma.auditLog.create({
    data: { actorUserId: admin.id, entity: 'booking', entityId: id, action: 'feedback_email_sent', payload: {} },
  })

  return NextResponse.json({ ok: true })
}
