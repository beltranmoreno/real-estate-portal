import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'

/**
 * POST /api/admin/documents
 *
 * Commit step for admin uploads. Defaults to `kind: AGENT_UPLOAD` (the
 * admin's "share with guest" bucket) but can be tagged differently for
 * specific contexts — e.g. RECEIPT for a grocery purchase. When a
 * `serviceRequestId` is supplied the document is linked to that
 * request so it shows up in context (and can be deleted with it).
 */
const schema = z.object({
  bookingId: z.string().min(1),
  documentId: z.string().min(1),
  storageKey: z.string().min(1),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
  label: z.string().optional().nullable(),
  serviceRequestId: z.string().optional().nullable(),
  kind: z
    .enum([
      'PASSPORT',
      'CONTRACT',
      'RECEIPT',
      'ID',
      'INSURANCE',
      'PET_DOC',
      'AGENT_UPLOAD',
      'OTHER',
    ])
    .optional(),
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

  // Validate the service-request link, if one was supplied. Prevents
  // accidentally attaching a doc to a request from another booking.
  if (payload.serviceRequestId) {
    const sr = await prisma.serviceRequest.findUnique({
      where: { id: payload.serviceRequestId },
      select: { id: true, bookingId: true },
    })
    if (!sr || sr.bookingId !== payload.bookingId) {
      return NextResponse.json(
        { error: 'Service request not found on this booking' },
        { status: 400 }
      )
    }
  }

  const kind = payload.kind ?? 'AGENT_UPLOAD'

  const doc = await prisma.document.create({
    data: {
      id: payload.documentId,
      bookingId: payload.bookingId,
      kind,
      filename: payload.filename,
      storageKey: payload.storageKey,
      contentType: payload.contentType,
      fileSize: payload.fileSize,
      label: payload.label ?? null,
      uploadedByUserId: admin.id,
      serviceRequestId: payload.serviceRequestId ?? null,
      // Admin-shared docs (and receipts) don't auto-purge.
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
        kind,
        serviceRequestId: payload.serviceRequestId ?? null,
        filename: payload.filename,
      },
    },
  })

  return NextResponse.json({ id: doc.id }, { status: 201 })
}
