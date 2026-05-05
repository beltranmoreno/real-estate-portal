import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

/**
 * PATCH /api/admin/users/[id]
 *
 * Update a user's role and/or admin notes. Both fields are optional —
 * pass only what you want to change. Restricted to ADMIN only.
 *
 * Notes are admin-internal (never shown to the renter), persistent
 * across bookings, and useful for tracking guest preferences and history.
 */
const schema = z.object({
  role: z
    .enum(['ADMIN', 'AGENT', 'STAFF', 'OWNER', 'RENTER', 'ADDITIONAL_GUEST'])
    .optional(),
  notes: z.string().max(5000).optional().nullable(),
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

  if (payload.role === undefined && payload.notes === undefined) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  // Block self-demotion as a safety. Prevents accidentally locking out
  // the only admin.
  if (
    id === admin.id &&
    payload.role !== undefined &&
    payload.role !== 'ADMIN'
  ) {
    return NextResponse.json(
      { error: 'You cannot change your own role. Ask another admin.' },
      { status: 400 }
    )
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (payload.role !== undefined) data.role = payload.role
  if (payload.notes !== undefined) data.notes = payload.notes

  await prisma.user.update({ where: { id }, data })

  // Audit each change separately so the history reads cleanly.
  if (payload.role !== undefined && payload.role !== target.role) {
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        entity: 'user',
        entityId: id,
        action: 'role_changed',
        payload: {
          from: target.role,
          to: payload.role,
          targetEmail: target.email,
        },
      },
    })
  }
  if (payload.notes !== undefined && payload.notes !== target.notes) {
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        entity: 'user',
        entityId: id,
        action: 'notes_updated',
        payload: { targetEmail: target.email },
      },
    })
  }

  return NextResponse.json({ ok: true })
}
