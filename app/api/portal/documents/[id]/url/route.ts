import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { presignDownloadUrl } from '@/lib/r2'

/**
 * GET /api/portal/documents/[id]/url
 *
 * Returns a short-TTL signed URL the browser can use to download a
 * document. Every successful call writes an audit log entry — so we
 * always know who downloaded what and when. Compliance: this is the
 * paper trail you want when something goes wrong.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireCurrentUser()
  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      storageKey: true,
      kind: true,
      filename: true,
      bookingId: true,
      booking: { select: { primaryGuestUserId: true } },
    },
  })
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Authorization:
  //   - admin/agent: always allowed
  //   - renter: only the primary guest of the booking
  //   - staff: not allowed for sensitive docs (passport/ID/contract)
  const isAdmin = user.role === 'ADMIN' || user.role === 'AGENT'
  const isOwner = doc.booking.primaryGuestUserId === user.id
  const isStaff = user.role === 'STAFF'
  const isSensitive =
    doc.kind === 'PASSPORT' || doc.kind === 'ID' || doc.kind === 'CONTRACT'

  if (!isAdmin && !isOwner && !(isStaff && !isSensitive)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = await presignDownloadUrl(doc.storageKey)

  // Audit trail — who downloaded, when, what kind. Cheap insurance.
  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entity: 'document',
      entityId: doc.id,
      action: 'downloaded',
      payload: { kind: doc.kind, filename: doc.filename },
    },
  })

  return NextResponse.json({ url, filename: doc.filename })
}
