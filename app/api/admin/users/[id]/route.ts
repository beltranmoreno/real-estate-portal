import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { guestDetailsSchema, guestDetailsToData } from '@/lib/admin/guestInput'

/**
 * PATCH /api/admin/users/[id]
 *
 * Update a user's role, admin notes and/or guest details (`details`: name,
 * email, phone, nationality, address). All optional — pass only what you
 * want to change. Restricted to ADMIN only.
 *
 * Notes are admin-internal (never shown to the renter), persistent
 * across bookings, and useful for tracking guest preferences and history.
 */
const schema = z.object({
  role: z
    .enum(['ADMIN', 'AGENT', 'STAFF', 'OWNER', 'RENTER', 'ADDITIONAL_GUEST'])
    .optional(),
  notes: z.string().max(5000).optional().nullable(),
  details: guestDetailsSchema.optional(),
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

  if (payload.role === undefined && payload.notes === undefined && payload.details === undefined) {
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
  if (payload.details) {
    const details = guestDetailsToData(payload.details)
    // A signed-up user's email belongs to their Clerk account; only guests
    // who haven't signed up yet (placeholder rows) can have it changed here.
    if (details.email !== target.email && !target.clerkId.startsWith('pending:')) {
      return NextResponse.json(
        { error: 'This guest has signed up — their email can only change from their own account' },
        { status: 400 }
      )
    }
    if (details.email && details.email !== target.email) {
      const taken = await prisma.user.findUnique({ where: { email: details.email }, select: { id: true } })
      if (taken) return NextResponse.json({ error: 'Another user already has this email' }, { status: 409 })
    }
    Object.assign(data, details)
  }

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

  if (payload.details) {
    await prisma.auditLog.create({
      data: { actorUserId: admin.id, entity: 'user', entityId: id, action: 'details_updated', payload: {} },
    })
  }

  return NextResponse.json({ ok: true })
}
