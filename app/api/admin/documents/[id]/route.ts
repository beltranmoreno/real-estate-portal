import { NextResponse } from 'next/server'
import { z } from 'zod'
import { addDays } from 'date-fns'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { deleteObject } from '@/lib/r2'

/**
 * PATCH /api/admin/documents/[id]
 *
 * Reclassify a document's `kind` (e.g. uploaded as OTHER but it's actually
 * a contract). Also adjusts `expiresAt` consistently — moving a doc into
 * a sensitive kind sets the 90-day post-checkout expiry; moving out clears it.
 */
const SENSITIVE_KINDS = new Set(['PASSPORT', 'ID', 'CONTRACT'])

const schema = z.object({
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
  label: z.string().optional().nullable(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
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
  if (payload.kind === undefined && payload.label === undefined) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const before = await prisma.document.findUnique({
    where: { id },
    include: { booking: { select: { checkOut: true } } },
  })
  if (!before) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (payload.kind !== undefined) {
    data.kind = payload.kind
    // Re-evaluate the retention expiry whenever the kind changes:
    // sensitive kinds get a 90-day post-checkout expiry, others get null.
    if (SENSITIVE_KINDS.has(payload.kind)) {
      data.expiresAt = addDays(before.booking.checkOut, 90)
    } else {
      data.expiresAt = null
    }
  }
  if (payload.label !== undefined) data.label = payload.label

  await prisma.document.update({ where: { id }, data })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'document',
      entityId: id,
      action: 'reclassified',
      payload: JSON.parse(
        JSON.stringify({
          changes: data,
          previousKind: before.kind,
        })
      ),
    },
  })

  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/admin/documents/[id]
 *
 * Hard-delete: removes the R2 blob first, then the DB row + audit. We
 * delete from R2 first so a partial failure leaves us with a stale DB
 * row (which we'll reconcile on retry) instead of an orphaned blob.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
  const { id } = await params

  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    await deleteObject(doc.storageKey)
  } catch (err) {
    console.error('[admin/documents DELETE] R2 delete failed', err)
    return NextResponse.json(
      { error: 'Storage delete failed; try again' },
      { status: 500 }
    )
  }

  await prisma.$transaction([
    prisma.document.delete({ where: { id } }),
    prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        entity: 'document',
        entityId: id,
        action: 'deleted',
        payload: { kind: doc.kind, filename: doc.filename },
      },
    }),
  ])

  return NextResponse.json({ ok: true })
}
