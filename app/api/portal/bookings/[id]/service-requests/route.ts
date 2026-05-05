import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { getConciergeServiceById } from '@/lib/portal/conciergeServices'

/**
 * POST /api/portal/bookings/[id]/service-requests
 *
 * Renter requests a concierge service for their stay. We re-fetch the
 * Sanity service doc server-side to snapshot the canonical name + slug
 * + category onto the row (so admin sees the same thing the renter
 * picked, even if the catalog drifts later).
 */
const schema = z.object({
  serviceSanityId: z.string().min(1),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().max(80).optional().nullable(),
  partySize: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

function toIntOrNull(v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

function toDateOrNull(v: string | null | undefined): Date | null {
  if (!v) return null
  // YYYY-MM-DD anchored at UTC midnight, same convention as bookings.
  return new Date(`${v}T00:00:00.000Z`)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireCurrentUser()
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
    select: { id: true, primaryGuestUserId: true, status: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }
  if (booking.primaryGuestUserId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (booking.status === 'CANCELLED') {
    return NextResponse.json(
      { error: 'Cannot request services on a cancelled booking' },
      { status: 400 }
    )
  }

  const service = await getConciergeServiceById(payload.serviceSanityId)
  if (!service) {
    return NextResponse.json(
      { error: 'That service is no longer available' },
      { status: 400 }
    )
  }

  // Snapshot the renter-locale name. Falls back across locales then to
  // the slug so the row always has *something* legible.
  const serviceName =
    (user.locale === 'es' ? service.name_es : service.name_en) ||
    service.name_en ||
    service.name_es ||
    service.slug ||
    'Concierge service'

  const created = await prisma.serviceRequest.create({
    data: {
      bookingId: booking.id,
      serviceSanityId: service._id,
      serviceSlug: service.slug ?? null,
      serviceName,
      serviceCategory: service.category ?? null,
      preferredDate: toDateOrNull(payload.preferredDate ?? null),
      preferredTime: payload.preferredTime || null,
      partySize: toIntOrNull(payload.partySize),
      notes: payload.notes || null,
      addedManually: false,
      requestedByUserId: user.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      entity: 'service_request',
      entityId: created.id,
      action: 'created',
      payload: {
        bookingId: booking.id,
        serviceSlug: service.slug,
        serviceName,
      },
    },
  })

  return NextResponse.json({ id: created.id }, { status: 201 })
}
