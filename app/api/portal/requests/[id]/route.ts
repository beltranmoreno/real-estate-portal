import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'

/**
 * PATCH /api/portal/requests/[id]
 *
 * Renter-side fulfillment for text-only requests (e.g. dietary preferences,
 * arrival details). For document requests, the renter uploads via
 * /api/portal/uploads + /api/portal/documents which marks the request
 * fulfilled automatically.
 */
const schema = z.object({
  textResponse: z.string().min(1).max(5000),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireCurrentUser()
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
    include: { booking: { select: { primaryGuestUserId: true } } },
  })
  if (!request) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (request.booking.primaryGuestUserId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (request.expectsDocument) {
    return NextResponse.json(
      { error: 'This request expects a document upload, not a text response' },
      { status: 400 }
    )
  }
  if (
    request.status !== 'PENDING' &&
    request.status !== 'PENDING_REVIEW' &&
    request.status !== 'FULFILLED'
  ) {
    return NextResponse.json(
      { error: 'This request is no longer editable' },
      { status: 400 }
    )
  }

  // Track whether this is the renter editing an already-approved
  // submission — so the audit trail distinguishes initial submit from
  // a "modification after approval" (which kicks the request back into
  // review and will need admin re-approval).
  const wasFulfilled = request.status === 'FULFILLED'

  await prisma.request.update({
    where: { id },
    data: {
      status: 'PENDING_REVIEW',
      textResponse: payload.textResponse,
      reviewNote: null,
      // Editing resets the fulfilled metadata so the row doesn't claim
      // it's "approved by Leticia on May 5" while sitting in PENDING_REVIEW.
      fulfilledAt: null,
      fulfilledByUserId: null,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entity: 'request',
      entityId: id,
      action: wasFulfilled ? 'modified_after_approval' : 'submitted',
      payload: { textOnly: true, previousStatus: request.status },
    },
  })

  return NextResponse.json({ ok: true })
}
