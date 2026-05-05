import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { getConciergeServiceById } from '@/lib/portal/conciergeServices'

/**
 * POST /api/admin/bookings/[id]/service-requests
 *
 * Admin/staff log a concierge service the guest asked for out-of-band
 * (phone, WhatsApp, mentioned at check-in). `addedManually` is set so
 * the audit reads cleanly. Optionally accepts a free-form serviceName
 * when the guest wants something not in the Sanity catalog.
 */
const schema = z
  .object({
    serviceSanityId: z.string().optional().nullable(),
    serviceName: z.string().min(1).max(200).optional(),
    preferredDate: z.string().optional().nullable(),
    preferredTime: z.string().max(80).optional().nullable(),
    partySize: z.union([z.string(), z.number()]).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
    internalNotes: z.string().max(2000).optional().nullable(),
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
  })
  .refine((d) => d.serviceSanityId || d.serviceName, {
    message: 'Either serviceSanityId or a custom serviceName is required',
  })

function toIntOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

function toDateOrNull(v: string | null | undefined): Date | null {
  if (!v) return null
  return new Date(`${v}T00:00:00.000Z`)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireStaffOrAbove({ throwOnFail: true })
  const { id: bookingId } = await params

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
    where: { id: bookingId },
    select: { id: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // When linked to Sanity, snapshot canonical fields. When free-form,
  // trust the admin-supplied name and leave the Sanity bridge fields null.
  let serviceSlug: string | null = null
  let serviceName = payload.serviceName ?? ''
  let serviceCategory: string | null = null
  let serviceSanityId: string | null = null

  if (payload.serviceSanityId) {
    const service = await getConciergeServiceById(payload.serviceSanityId)
    if (!service) {
      return NextResponse.json(
        { error: 'Service not found in catalog' },
        { status: 400 }
      )
    }
    serviceSanityId = service._id
    serviceSlug = service.slug ?? null
    serviceName =
      payload.serviceName ||
      service.name_en ||
      service.name_es ||
      service.slug ||
      'Concierge service'
    serviceCategory = service.category ?? null
  }

  const created = await prisma.serviceRequest.create({
    data: {
      bookingId: booking.id,
      serviceSanityId,
      serviceSlug,
      serviceName,
      serviceCategory,
      preferredDate: toDateOrNull(payload.preferredDate ?? null),
      preferredTime: payload.preferredTime || null,
      partySize: toIntOrNull(payload.partySize),
      notes: payload.notes || null,
      internalNotes: payload.internalNotes || null,
      status: payload.status ?? 'REQUESTED',
      addedManually: true,
      requestedByUserId: admin.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'service_request',
      entityId: created.id,
      action: 'created',
      payload: {
        bookingId: booking.id,
        addedManually: true,
        serviceSlug,
        serviceName,
      },
    },
  })

  return NextResponse.json({ id: created.id }, { status: 201 })
}
