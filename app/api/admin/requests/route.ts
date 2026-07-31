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
 * Creates a new Request on a booking. If `kind` is a preset, we use the
 * preset's defaults (title, description, expectsDocument); the admin can
 * still override them in the form. CUSTOM requires explicit title.
 *
 * Sends a notification email to the renter.
 */
const schema = z.object({
  bookingId: z.string().min(1),
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

  // Verify booking exists + collect data we need for the email.
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { primaryGuest: true },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Resolve title/description/expectsDocument. EN is the canonical row;
  // ES is optional (server-side fallback to EN if missing). For preset
  // kinds we default both languages from the preset when the admin
  // didn't pass overrides.
  let title = payload.title?.trim()
  let titleEs =
    payload.title_es && payload.title_es.trim() ? payload.title_es.trim() : null
  let description = payload.description?.trim() ?? null
  let descriptionEs =
    payload.description_es && payload.description_es.trim()
      ? payload.description_es.trim()
      : null
  let expectsDocument = payload.expectsDocument

  const preset = getPreset(payload.kind as RequestKind)
  if (preset) {
    if (!title) title = preset.label.en
    if (!titleEs) titleEs = preset.label.es
    if (description === null) description = preset.description.en
    if (descriptionEs === null) descriptionEs = preset.description.es
    if (expectsDocument === undefined) expectsDocument = preset.expectsDocument
  }

  if (!title) {
    return NextResponse.json(
      { error: 'Title is required for custom requests' },
      { status: 400 }
    )
  }
  if (expectsDocument === undefined) expectsDocument = true

  const request = await prisma.request.create({
    data: {
      bookingId: payload.bookingId,
      kind: payload.kind as RequestKind,
      title,
      title_es: titleEs,
      description,
      description_es: descriptionEs,
      expectsDocument,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : null,
      createdByUserId: admin.id,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entity: 'request',
      entityId: request.id,
      action: 'created',
      payload: { bookingId: payload.bookingId, kind: payload.kind, title },
    },
  })

  // Fire the renter notification (best effort — failure doesn't roll back).
  // Pick the locale-matching copy for the email, falling back to EN.
  const renterLocale = (booking.primaryGuest.locale ?? 'en') as 'en' | 'es'
  const emailTitle = renterLocale === 'es' && titleEs ? titleEs : title
  const emailDescription =
    renterLocale === 'es' && descriptionEs ? descriptionEs : description
  try {
    await sendRequestCreated({
      booking,
      renter: booking.primaryGuest,
      requestId: request.id,
      title: emailTitle,
      description: emailDescription,
      expectsDocument,
      dueAt: request.dueAt,
    })
  } catch (err) {
    console.error('[admin/requests] notification email failed', err)
  }

  return NextResponse.json({ id: request.id }, { status: 201 })
}
