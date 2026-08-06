import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'

/**
 * POST /api/admin/bookings/[id]/complete
 *
 * Manually mark a booking completed (or reopen it). Setting `completedAt`
 * unlocks the guest's private feedback page + banner. The feedback-invitation
 * email is sent separately by the daily cron ~2 days after checkout, so
 * toggling here does not email the guest.
 *
 * Body: { completed: boolean }
 */
const schema = z.object({ completed: z.boolean() })

export async function POST(
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

  const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true } })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  await prisma.booking.update({
    where: { id },
    data: {
      completedAt: payload.completed ? new Date() : null,
      // Reopening resets the email guard so the cron can invite again later.
      ...(payload.completed ? {} : { feedbackEmailSentAt: null }),
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'booking',
      entityId: id,
      action: payload.completed ? 'completed' : 'reopened',
      payload: {},
    },
  })

  return NextResponse.json({ ok: true })
}
