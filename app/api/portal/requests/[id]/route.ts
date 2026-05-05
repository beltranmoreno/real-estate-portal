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

  await prisma.request.update({
    where: { id },
    data: {
      status: 'FULFILLED',
      textResponse: payload.textResponse,
      fulfilledAt: new Date(),
      fulfilledByUserId: user.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entity: 'request',
      entityId: id,
      action: 'fulfilled',
      payload: { textOnly: true },
    },
  })

  return NextResponse.json({ ok: true })
}
