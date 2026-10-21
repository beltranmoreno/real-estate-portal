import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { getInquiryProperties, propertyTitle } from '@/lib/inquiries'

/** PATCH /api/admin/inquiries/[id] — status, internal notes, houses. */
const schema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'SELECTION_SENT', 'BOOKED', 'CLOSED']).optional(),
  notes: z.string().max(4000).optional(),
  propertyIds: z.array(z.string().min(1)).max(30).optional(),
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

  const update: Record<string, unknown> = {}
  if (data.status) update.status = data.status
  if (data.notes !== undefined) update.notes = data.notes.trim() || null
  if (data.propertyIds) {
    const properties = await getInquiryProperties([...new Set(data.propertyIds)])
    update.propertyIds = properties.map((p) => p._id)
    update.propertyTitles = properties.map(propertyTitle)
  }

  try {
    await prisma.inquiry.update({ where: { id }, data: update })
  } catch {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
