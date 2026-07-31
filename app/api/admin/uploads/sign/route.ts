import { NextResponse } from 'next/server'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { buildDocumentKey, presignUploadUrl } from '@/lib/r2'

/**
 * POST /api/admin/uploads/sign
 *
 * Admin-side equivalent of the renter presign endpoint. Returns a 5-minute
 * PUT URL for an AGENT_UPLOAD document. Admin commits via /api/admin/documents.
 */
const schema = z.object({
  bookingId: z.string().min(1),
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(127),
  contentLength: z.number().int().positive().max(20 * 1024 * 1024), // 20 MB cap admin-side
})

export async function POST(req: Request) {
  await requireStaffOrAbove({ throwOnFail: true })

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
    maxBytes: 20 * 1024 * 1024,
  })

  return NextResponse.json({
    uploadUrl: url,
    storageKey,
    documentId,
    expiresAt: expiresAt.toISOString(),
  })
}
