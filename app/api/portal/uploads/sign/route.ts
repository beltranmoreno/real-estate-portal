import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { buildDocumentKey, presignUploadUrl } from '@/lib/r2'

/**
 * POST /api/portal/uploads/sign
 *
 * Step 1 of the upload flow. Browser asks for a presigned PUT URL. We
 * verify the user owns the booking, generate a fresh document id (used
 * in the storage key), and hand back the URL.
 *
 * After the browser PUTs the file to R2, it must call POST /api/portal/documents
 * to record metadata (step 2). If step 2 never happens, the orphan blob
 * is cleaned up by the daily retention sweep.
 */
const schema = z.object({
  bookingId: z.string().min(1),
  /** Optional — when this upload fulfills a specific request. */
  requestId: z.string().optional().nullable(),
  /** Optional — passport for a specific guest. */
  guestId: z.string().optional().nullable(),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  contentLength: z.number().int().positive().max(10 * 1024 * 1024), // 10 MB cap
})

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

  // Authorization: must own this booking, OR be admin/agent.
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    select: { id: true, primaryGuestUserId: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  const isAdmin = user.role === 'ADMIN' || user.role === 'AGENT'
  const isOwner = booking.primaryGuestUserId === user.id
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // If this upload is tied to a request, verify it belongs to this booking
  if (payload.requestId) {
    const request = await prisma.request.findUnique({
      where: { id: payload.requestId },
      select: { bookingId: true, expectsDocument: true },
    })
    if (!request || request.bookingId !== payload.bookingId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    if (!request.expectsDocument) {
      return NextResponse.json(
        { error: 'This request expects a text response, not a document' },
        { status: 400 }
      )
    }
  }

  // Pre-generate the document id so the storage key is deterministic and
  // the commit step can recover the row even if the client lost state.
  const documentId = `doc_${randomBytes(12).toString('hex')}`
  const storageKey = buildDocumentKey({
    bookingId: payload.bookingId,
    documentId,
    filename: payload.filename,
  })

  const { url, expiresAt } = await presignUploadUrl({
    key: storageKey,
    contentType: payload.contentType,
    contentLength: payload.contentLength,
  })

  return NextResponse.json({
    uploadUrl: url,
    storageKey,
    documentId,
    expiresAt: expiresAt.toISOString(),
  })
}
