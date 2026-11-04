import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { getInquiryProperties, newInquiryReference, propertyTitle } from '@/lib/inquiries'
import { cleanPropertyNotes, inquiryFieldsSchema, inquiryFieldsToData } from '@/lib/admin/inquiryInput'

/** POST /api/admin/inquiries — an admin logs an inquiry that came in off the site. */
export async function POST(req: Request) {
  const admin = await requireAdmin({ throwOnFail: true })

  let data: z.infer<typeof inquiryFieldsSchema>
  try {
    data = inquiryFieldsSchema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', details: (err as z.ZodError).issues }, { status: 400 })
  }

  const { propertyIds, propertyNotes, ...fields } = data
  const properties = await getInquiryProperties([...new Set(propertyIds)])
  const ids = properties.map((p) => p._id)

  const inquiry = await prisma.inquiry.create({
    data: {
      ...inquiryFieldsToData(fields),
      reference: await newInquiryReference(),
      source: 'MANUAL',
      status: 'CONTACTED',
      propertyIds: ids,
      propertyTitles: properties.map(propertyTitle),
      propertyNotes: cleanPropertyNotes(propertyNotes, ids),
      createdByUserId: admin.id,
    },
  })

  return NextResponse.json({ id: inquiry.id })
}
