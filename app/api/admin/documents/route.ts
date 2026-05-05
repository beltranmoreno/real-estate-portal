import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'

/**
 * POST /api/admin/documents
 *
 * Commit step for admin uploads. Mirrors the renter document commit but
 * always tags `kind: AGENT_UPLOAD` (the admin's bucket). No `requestId`
 * link — these are unsolicited shares, not request fulfillments.
 */
const schema = z.object({
  bookingId: z.string().min(1),
  documentId: z.string().min(1),
  storageKey: z.string().min(1),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
  label: z.string().optional().nullable(),
})

export async function POST(req: Request) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })

  let payload
  try {
    payload = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload', details: (err as z.ZodError).issues },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    select: { id: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const doc = await prisma.document.create({
    data: {
      id: payload.documentId,
      bookingId: payload.bookingId,
      kind: 'AGENT_UPLOAD',
      filename: payload.filename,
      storageKey: payload.storageKey,
      contentType: payload.contentType,
      fileSize: payload.fileSize,
      label: payload.label ?? null,
      uploadedByUserId: admin.id,
      // Admin-shared docs don't auto-purge — Leticia can delete them
      // manually or they live with the booking record.
      expiresAt: null,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'document',
      entityId: doc.id,
      action: 'uploaded',
      payload: {
        bookingId: payload.bookingId,
        kind: 'AGENT_UPLOAD',
        filename: payload.filename,
      },
    },
  })

  return NextResponse.json({ id: doc.id }, { status: 201 })
}
