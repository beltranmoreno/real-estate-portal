import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'

/**
 * PATCH  /api/admin/guests/[id]  — toggle portal access / fix the email.
 * DELETE /api/admin/guests/[id]  — remove an extra guest from the stay.
 */
const schema = z.object({
  portalAccess: z.boolean().optional(),
  email: z.string().trim().email().optional().nullable().or(z.literal('')),
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

  const guest = await prisma.guest.findUnique({ where: { id } })
  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })

  const email =
    payload.email === undefined ? guest.email : payload.email ? payload.email.toLowerCase() : null
  const portalAccess = payload.portalAccess ?? guest.portalAccess
  if (portalAccess && !email) {
    return NextResponse.json({ error: 'Portal access needs an email' }, { status: 400 })
  }

  await prisma.guest.update({ where: { id }, data: { email, portalAccess } })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'guest',
      entityId: id,
      action: 'updated',
      payload: { portalAccess },
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin({ throwOnFail: true })
  const { id } = await params

  const guest = await prisma.guest.findUnique({ where: { id }, select: { id: true, bookingId: true, isPrimary: true } })
  if (!guest) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  if (guest.isPrimary) {
    return NextResponse.json({ error: 'The primary guest can’t be removed here' }, { status: 400 })
  }

  await prisma.guest.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'guest',
      entityId: id,
      action: 'deleted',
      payload: { bookingId: guest.bookingId },
    },
  })

  return NextResponse.json({ ok: true })
}
