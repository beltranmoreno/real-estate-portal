import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

/**
 * PATCH /api/admin/requests/[id]
 *
 * Updates a request — supported actions:
 *   - status: WAIVED  → admin marks "not needed for this booking"
 *   - status: PENDING → reopen a fulfilled request
 *   - title / description / dueAt edits
 */
const schema = z.object({
  status: z.enum(['PENDING', 'WAIVED']).optional(),
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  dueAt: z.string().optional().nullable(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin({ throwOnFail: true })
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

  const before = await prisma.request.findUnique({ where: { id } })
  if (!before) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (payload.status !== undefined) data.status = payload.status
  if (payload.title !== undefined) data.title = payload.title
  if (payload.description !== undefined) data.description = payload.description
  if (payload.dueAt !== undefined) {
    data.dueAt = payload.dueAt ? new Date(payload.dueAt) : null
  }

  const updated = await prisma.request.update({ where: { id }, data })

  // JSON serialization happens once for the audit payload — gives Prisma
  // a properly-typed JSON value rather than the loose Record above.
  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'request',
      entityId: id,
      action: 'updated',
      payload: JSON.parse(JSON.stringify({ changes: data })),
    },
  })

  return NextResponse.json({ id: updated.id })
}

/**
 * DELETE /api/admin/requests/[id]
 *
 * Hard-deletes a request and any documents attached to it (CASCADE in DB).
 * R2 blobs of attached documents are NOT auto-deleted here — admin must
 * delete those separately. Generally, "waive" is preferred over delete.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin({ throwOnFail: true })
  const { id } = await params

  await prisma.request.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'request',
      entityId: id,
      action: 'deleted',
    },
  })

  return NextResponse.json({ ok: true })
}
