import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { sendSubmissionRejected } from '@/lib/email/sendSubmissionRejected'

/**
 * POST /api/admin/requests/[id]/review
 *
 * Admin reviews a renter's submission:
 *   - accept: status PENDING_REVIEW → FULFILLED (final, no further action)
 *   - reject: status PENDING_REVIEW → PENDING with reviewNote (renter gets
 *     an email and re-uploads from their portal)
 */
const schema = z.object({
  action: z.enum(['accept', 'reject']),
  note: z.string().max(2000).optional().nullable(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const reviewer = await requireStaffOrAbove({ throwOnFail: true })
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

  const request = await prisma.request.findUnique({
    where: { id },
    include: { booking: { include: { primaryGuest: true } } },
  })
  if (!request) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (request.status !== 'PENDING_REVIEW') {
    return NextResponse.json(
      { error: 'Request is not awaiting review' },
      { status: 400 }
    )
  }

  if (payload.action === 'accept') {
    await prisma.$transaction([
      prisma.request.update({
        where: { id },
        data: {
          status: 'FULFILLED',
          fulfilledAt: new Date(),
          fulfilledByUserId: reviewer.id,
          reviewedAt: new Date(),
          reviewedByUserId: reviewer.id,
          reviewNote: null,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: reviewer.id,
          entity: 'request',
          entityId: id,
          action: 'review_accepted',
        },
      }),
    ])
    return NextResponse.json({ ok: true, status: 'FULFILLED' })
  }

  // Reject — send back to PENDING with the note
  const note = payload.note?.trim() || null

  await prisma.$transaction([
    prisma.request.update({
      where: { id },
      data: {
        status: 'PENDING',
        reviewedAt: new Date(),
        reviewedByUserId: reviewer.id,
        reviewNote: note,
        // Clear text response so the renter re-enters fresh on next submission.
        // Documents stay attached for audit, but the request UI shows the
        // re-upload prompt.
        textResponse: null,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: reviewer.id,
        entity: 'request',
        entityId: id,
        action: 'review_rejected',
        payload: note ? { note } : undefined,
      },
    }),
  ])

  // Notify the renter so they don't have to keep checking the portal.
  try {
    await sendSubmissionRejected({
      booking: request.booking,
      renter: request.booking.primaryGuest,
      requestId: request.id,
      requestTitle: request.title,
      note,
    })
  } catch (err) {
    console.error('[review] rejection email failed', err)
  }

  return NextResponse.json({ ok: true, status: 'PENDING' })
}
