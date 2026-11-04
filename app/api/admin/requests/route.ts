import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { sendRequestCreated } from '@/lib/email/sendRequestCreated'
import { getPreset } from '@/lib/portal/requestPresets'
import type { RequestKind } from '@prisma/client'

/**
 * POST /api/admin/requests
 *
 * Creates one Request on a booking, or several at once (`requests: [...]`).
 * For a preset `kind` we fill in the preset's defaults (title, description,
 * expectsDocument) where the admin didn't override them. CUSTOM requires an
 * explicit title.
 *
 * Emails the renter once — a single request, or one email listing all of
 * the requests created together.
 */
const itemSchema = z.object({
  kind: z.enum([
    'PASSPORT',
    'RENTAL_CONTRACT',
    'DEPOSIT_RECEIPT',
    'ID_PHOTO',
    'TRAVEL_INSURANCE',
    'PET_DOCUMENTATION',
    'ARRIVAL_DETAILS',
    'GUEST_LIST',
    'DIETARY_PREFERENCES',
    'SERVICE_PREFERENCES',
    'CUSTOM',
  ]),
  title: z.string().optional(),
  title_es: z.string().optional().nullable(),
  description: z.string().optional(),
  description_es: z.string().optional().nullable(),
  expectsDocument: z.boolean().optional(),
  dueAt: z.string().optional().nullable(),
  /** Optional link to a specific guest (e.g. "passport for John"). */
  guestId: z.string().optional().nullable(),
})
const schema = z.union([
  z.object({ bookingId: z.string().min(1), requests: z.array(itemSchema).min(1).max(20) }),
  itemSchema.extend({ bookingId: z.string().min(1) }),
])

type Item = z.infer<typeof itemSchema>

/** Title/description/expectsDocument with preset defaults; EN is canonical, ES optional. */
function resolveItem(item: Item) {
  let title = item.title?.trim()
  let titleEs = item.title_es?.trim() || null
  let description = item.description?.trim() || null
  let descriptionEs = item.description_es?.trim() || null
  let expectsDocument = item.expectsDocument

  const preset = getPreset(item.kind as RequestKind)
  if (preset) {
    if (!title) title = preset.label.en
    if (!titleEs) titleEs = preset.label.es
    if (description === null) description = preset.description.en
    if (descriptionEs === null) descriptionEs = preset.description.es
    if (expectsDocument === undefined) expectsDocument = preset.expectsDocument
  }
  return {
    kind: item.kind as RequestKind,
    title: title ?? '',
    titleEs,
    description,
    descriptionEs,
    expectsDocument: expectsDocument ?? true,
    dueAt: item.dueAt ? new Date(item.dueAt) : null,
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin({ throwOnFail: true })

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
    where: { id: payload.bookingId },
    include: { primaryGuest: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const items = ('requests' in payload ? payload.requests : [payload]).map(resolveItem)
  if (items.some((i) => !i.title)) {
    return NextResponse.json({ error: 'Title is required for custom requests' }, { status: 400 })
  }

  const created = await prisma.$transaction(
    items.map((i) =>
      prisma.request.create({
        data: {
          bookingId: booking.id,
          kind: i.kind,
          title: i.title,
          title_es: i.titleEs,
          description: i.description,
          description_es: i.descriptionEs,
          expectsDocument: i.expectsDocument,
          dueAt: i.dueAt,
          createdByUserId: admin.id,
        },
      })
    )
  )

  await prisma.auditLog.createMany({
    data: created.map((r) => ({
      actorUserId: admin.id,
      entity: 'request',
      entityId: r.id,
      action: 'created',
      payload: { bookingId: booking.id, kind: r.kind, title: r.title, batch: created.length > 1 },
    })),
  })

  // One email for everything created (best effort — failure doesn't roll
  // back). Each request in the renter's language, falling back to EN.
  const es = booking.primaryGuest.locale === 'es'
  try {
    await sendRequestCreated({
      booking,
      renter: booking.primaryGuest,
      requests: created.map((r) => ({
        id: r.id,
        title: es && r.title_es ? r.title_es : r.title,
        description: es && r.description_es ? r.description_es : r.description,
        expectsDocument: r.expectsDocument,
        dueAt: r.dueAt,
      })),
    })
  } catch (err) {
    console.error('[admin/requests] notification email failed', err)
  }

  return NextResponse.json(
    created.length === 1 ? { id: created[0].id } : { ids: created.map((r) => r.id) },
    { status: 201 }
  )
}
