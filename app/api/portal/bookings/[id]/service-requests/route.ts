import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireCurrentUser } from '@/lib/auth/getCurrentUser'
import { getConciergeServiceById } from '@/lib/portal/conciergeServices'
import { resolveGroceryBySlugs } from '@/lib/portal/groceryItems'
import type { GroceryLineItem } from '@/lib/portal/groceryItems.types'

/**
 * POST /api/portal/bookings/[id]/service-requests
 *
 * Renter creates a service request. The `kind` discriminates the body:
 *   - SERVICE → bridges to a Sanity conciergeService doc
 *   - GROCERY → submits a list of items the staff will shop for
 *
 * For each kind we re-fetch from Sanity server-side and snapshot the
 * canonical names/categories onto the row, so a future Sanity edit
 * doesn't rewrite history.
 */

const serviceSchema = z.object({
  kind: z.literal('SERVICE'),
  serviceSanityId: z.string().min(1),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().max(80).optional().nullable(),
  partySize: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

const grocerySchema = z.object({
  kind: z.literal('GROCERY'),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        qty: z.number().positive().max(999),
        unit: z.string().max(40).optional().nullable(),
        note: z.string().max(200).optional().nullable(),
      })
    )
    .min(1, 'Pick at least one item')
    .max(120, 'That’s a lot of items — please split into multiple requests'),
  preferredDate: z.string().optional().nullable(),
  preferredTime: z.string().max(80).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

const schema = z.discriminatedUnion('kind', [serviceSchema, grocerySchema])

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
  const user = await requireCurrentUser()
  const { id: bookingId } = await params

  let payload
  try {
    // Default kind=SERVICE for back-compat with anything that omits it.
    const raw = await req.json()
    payload = schema.parse({ kind: 'SERVICE', ...raw })
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

  if (payload.kind === 'SERVICE') {
    return handleService(payload, booking.id, user)
  }
  return handleGrocery(payload, booking.id, user)
}

async function handleService(
  payload: z.infer<typeof serviceSchema>,
  bookingId: string,
  user: { id: string; locale: string | null }
) {
  const service = await getConciergeServiceById(payload.serviceSanityId)
  if (!service) {
    return NextResponse.json(
      { error: 'That service is no longer available' },
      { status: 400 }
    )
  }

  const serviceName =
    (user.locale === 'es' ? service.name_es : service.name_en) ||
    service.name_en ||
    service.name_es ||
    service.slug ||
    'Concierge service'

  const created = await prisma.serviceRequest.create({
    data: {
      bookingId,
      kind: 'SERVICE',
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
        kind: 'SERVICE',
        bookingId,
        serviceSlug: service.slug,
        serviceName,
      },
    },
  })

  return NextResponse.json({ id: created.id }, { status: 201 })
}

async function handleGrocery(
  payload: z.infer<typeof grocerySchema>,
  bookingId: string,
  user: { id: string; locale: string | null }
) {
  // Resolve the catalog rows for the slugs the renter selected. Anything
  // missing is dropped silently rather than failing — items can be
  // deactivated between page load and submit.
  const slugs = payload.items.map((i) => i.slug)
  const catalog = await resolveGroceryBySlugs(slugs)

  const lineItems: GroceryLineItem[] = []
  for (const sel of payload.items) {
    const cat = catalog.get(sel.slug)
    if (!cat) continue
    lineItems.push({
      slug: cat.slug,
      name_en: cat.name_en,
      name_es: cat.name_es,
      category: cat.category,
      brand: cat.brand,
      qty: sel.qty,
      unit: sel.unit || cat.defaultUnit || null,
      note: sel.note || null,
    })
  }

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: 'None of the items you selected are still available' },
      { status: 400 }
    )
  }

  const serviceName =
    user.locale === 'es'
      ? `Lista de compras (${lineItems.length} artículo${lineItems.length === 1 ? '' : 's'})`
      : `Grocery list (${lineItems.length} item${lineItems.length === 1 ? '' : 's'})`

  const created = await prisma.serviceRequest.create({
    data: {
      bookingId,
      kind: 'GROCERY',
      serviceName,
      serviceCategory: 'grocery',
      // JSON-coerce so Prisma gets InputJsonValue, not Record<string, unknown>.
      groceryItems: JSON.parse(JSON.stringify(lineItems)),
      preferredDate: toDateOrNull(payload.preferredDate ?? null),
      preferredTime: payload.preferredTime || null,
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
        kind: 'GROCERY',
        bookingId,
        itemCount: lineItems.length,
      },
    },
  })

  return NextResponse.json({ id: created.id }, { status: 201 })
}
