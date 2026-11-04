import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { getInquiryProperties, propertyTitle, setCollectionProperties } from '@/lib/inquiries'
import { cleanPropertyNotes, inquiryFieldsSchema, inquiryFieldsToData } from '@/lib/admin/inquiryInput'

/**
 * PATCH /api/admin/inquiries/[id] — status, internal notes, houses (with
 * their comments), or the whole inquiry from the edit form.
 */
const schema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'SELECTION_SENT', 'BOOKED', 'CLOSED']).optional(),
  notes: z.string().max(4000).optional(),
  propertyIds: z.array(z.string().min(1)).max(30).optional(),
  propertyNotes: z.record(z.string(), z.string().max(2000)).optional(),
  // The edit form sends every field at once.
  fields: inquiryFieldsSchema.omit({ propertyIds: true, propertyNotes: true }).optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin({ throwOnFail: true })
  const { id } = await params

  let data: z.infer<typeof schema>
  try {
    data = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', details: (err as z.ZodError).issues }, { status: 400 })
  }

  const inquiry = await prisma.inquiry.findUnique({ where: { id } })
  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

  const update: Record<string, unknown> = data.fields ? inquiryFieldsToData(data.fields) : {}
  if (data.status) update.status = data.status
  if (data.notes !== undefined) update.notes = data.notes.trim() || null

  let ids = inquiry.propertyIds
  if (data.propertyIds) {
    const properties = await getInquiryProperties([...new Set(data.propertyIds)])
    ids = properties.map((p) => p._id)
    update.propertyIds = ids
    update.propertyTitles = properties.map(propertyTitle)
  }
  if (data.propertyIds || data.propertyNotes) {
    const current = (inquiry.propertyNotes ?? {}) as Record<string, string>
    update.propertyNotes = cleanPropertyNotes(data.propertyNotes ?? current, ids)
  }

  // Once a private collection exists, its houses follow the inquiry's.
  if (data.propertyIds && inquiry.collectionId) {
    try {
      await setCollectionProperties(inquiry.collectionId, ids)
    } catch (err) {
      console.error('[inquiries] collection sync failed', err)
      return NextResponse.json({ error: 'Could not update the collection in Sanity' }, { status: 502 })
    }
  }

  await prisma.inquiry.update({ where: { id }, data: update })
  return NextResponse.json({ ok: true })
}

/**
 * DELETE /api/admin/inquiries/[id] — removes the inquiry. A private
 * collection made from it stays in Sanity (it may already have been sent).
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin({ throwOnFail: true })
  const { id } = await params
  try {
    await prisma.inquiry.delete({ where: { id } })
  } catch {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
