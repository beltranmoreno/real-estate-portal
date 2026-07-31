import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { presignDownloadUrl } from '@/lib/r2'

/**
 * GET /api/admin/documents/[id]/url
 *
 * Admin-side signed download. Same TTL + audit logging as the renter
 * endpoint, but allows STAFF/AGENT/ADMIN. STAFF still gets blocked from
 * sensitive doc kinds (passport/ID/contract).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStaffOrAbove({ throwOnFail: true })
  const { id } = await params

  const doc = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      storageKey: true,
      filename: true,
      kind: true,
      bookingId: true,
    },
  })
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const isStaff = user.role === 'STAFF'
  const isSensitive =
    doc.kind === 'PASSPORT' || doc.kind === 'ID' || doc.kind === 'CONTRACT'
  if (isStaff && isSensitive) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = await presignDownloadUrl(doc.storageKey)

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
