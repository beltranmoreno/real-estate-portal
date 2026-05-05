import { NextResponse } from 'next/server'
import { z } from 'zod'
import { addDays } from 'date-fns'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import type { DocumentKind } from '@prisma/client'

/**
 * POST /api/portal/documents
 *
 * Step 2 of the upload flow. Browser confirms a successful PUT to R2,
 * we record metadata, link to the request (if any), and mark the
 * request fulfilled.
 *
 * If the document is a sensitive kind (passport/ID/contract), we set a
 * 90-day post-checkout expiry — the daily retention sweep deletes these.
 */
const schema = z.object({
  bookingId: z.string().min(1),
  documentId: z.string().min(1),
  storageKey: z.string().min(1),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  fileSize: z.number().int().positive(),
  /** Document classification — drives sensitivity rules. */
  kind: z.enum([
    'PASSPORT',
    'CONTRACT',
    'RECEIPT',
    'ID',
    'INSURANCE',
    'PET_DOC',
    'AGENT_UPLOAD',
    'OTHER',
  ]),
  requestId: z.string().optional().nullable(),
  guestId: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
})

const SENSITIVE_KINDS = new Set<DocumentKind>(['PASSPORT', 'ID', 'CONTRACT'])

export async function POST(req: Request) {
  const user = await requireCurrentUser()

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
    select: { id: true, primaryGuestUserId: true, checkOut: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  const isAdmin = user.role === 'ADMIN' || user.role === 'AGENT'
  const isOwner = booking.primaryGuestUserId === user.id
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Auto-purge passports / IDs / contracts 90 days after checkout —
  // compliance: don't keep PII longer than necessary.
  const expiresAt = SENSITIVE_KINDS.has(payload.kind as DocumentKind)
    ? addDays(booking.checkOut, 90)
    : null

  // All in one transaction so a failed request fulfillment doesn't
  // leave us with an orphaned Document row.
  const result = await prisma.$transaction(async (tx) => {
    const doc = await tx.document.create({
      data: {
        id: payload.documentId,
        bookingId: payload.bookingId,
        requestId: payload.requestId ?? null,
        guestId: payload.guestId ?? null,
        kind: payload.kind as DocumentKind,
        filename: payload.filename,
        storageKey: payload.storageKey,
        contentType: payload.contentType,
        fileSize: payload.fileSize,
        label: payload.label ?? null,
        uploadedByUserId: user.id,
        expiresAt,
      },
    })

    if (payload.requestId) {
      await tx.request.update({
        where: { id: payload.requestId },
        data: {
          status: 'FULFILLED',
          fulfilledAt: new Date(),
          fulfilledByUserId: user.id,
        },
      })
    }

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        entity: 'document',
        entityId: doc.id,
        action: 'uploaded',
        payload: {
          bookingId: payload.bookingId,
          requestId: payload.requestId,
          kind: payload.kind,
          filename: payload.filename,
          fileSize: payload.fileSize,
        },
      },
    })

    return doc
  })

  return NextResponse.json({ id: result.id }, { status: 201 })
}
