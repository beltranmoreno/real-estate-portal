import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'

/**
 * PATCH /api/admin/service-requests/[id]
 *
 * Update any field on a concierge service request — status changes
 * cascade to confirmedAt/completedAt timestamps so the audit trail is
 * consistent with the chosen state.
 */
const schema = z.object({
  status: z
    .enum([
      'REQUESTED',
      'IN_PROGRESS',
      'CONFIRMED',
      'COMPLETED',
      'DECLINED',
      'CANCELLED',
    ])
    .optional(),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().max(80).optional().nullable(),
  partySize: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  internalNotes: z.string().max(2000).optional().nullable(),
  quotedAmount: z.union([z.string(), z.number()]).optional().nullable(),
  currency: z.enum(['USD', 'DOP']).optional().nullable(),
  serviceName: z.string().min(1).max(200).optional(),
})

function toIntOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

function toDecimalOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function toDateOrNull(v: string | null | undefined): Date | null {
  if (!v) return null
  return new Date(`${v}T00:00:00.000Z`)
}

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

  const before = await prisma.serviceRequest.findUnique({ where: { id } })
  if (!before) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (payload.status !== undefined) {
    data.status = payload.status
    // Keep timestamps consistent with the new status.
    if (payload.status === 'CONFIRMED' && !before.confirmedAt) {
      data.confirmedAt = new Date()
    }
    if (payload.status === 'COMPLETED') {
      data.completedAt = new Date()
      if (!before.confirmedAt) data.confirmedAt = new Date()
    }
    // Re-opening a closed item clears its end-state timestamp so the row
    // doesn't claim it's both REQUESTED and "completed on May 5".
    if (payload.status === 'REQUESTED' || payload.status === 'IN_PROGRESS') {
      data.completedAt = null
    }
  }
  if (payload.preferredDate !== undefined) {
    data.preferredDate = toDateOrNull(payload.preferredDate)
  }
  if (payload.preferredTime !== undefined) {
    data.preferredTime = payload.preferredTime || null
  }
  if (payload.partySize !== undefined) {
    data.partySize = toIntOrNull(payload.partySize)
  }
  if (payload.notes !== undefined) data.notes = payload.notes || null
  if (payload.internalNotes !== undefined) {
    data.internalNotes = payload.internalNotes || null
  }
  if (payload.quotedAmount !== undefined) {
    data.quotedAmount = toDecimalOrNull(payload.quotedAmount)
  }
  if (payload.currency !== undefined) data.currency = payload.currency || 'USD'
  if (payload.serviceName !== undefined) data.serviceName = payload.serviceName

  const updated = await prisma.serviceRequest.update({ where: { id }, data })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'service_request',
      entityId: id,
      action: 'updated',
      payload: JSON.parse(JSON.stringify({ changes: data })),
    },
  })

  return NextResponse.json({ id: updated.id })
}

/**
 * DELETE /api/admin/service-requests/[id]
 *
 * Hard-delete. Useful for fat-finger admin entries. Prefer setting
 * status=CANCELLED instead so the history is preserved.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
  const { id } = await params

  await prisma.serviceRequest.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'service_request',
      entityId: id,
      action: 'deleted',
    },
  })

  return NextResponse.json({ ok: true })
}
