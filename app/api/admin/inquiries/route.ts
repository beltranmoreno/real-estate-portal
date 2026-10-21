import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth/requireRole'
import { keyToDbDate } from '@/lib/dates'
import { getInquiryProperties, newInquiryReference, propertyTitle } from '@/lib/inquiries'

/** POST /api/admin/inquiries — an admin logs an inquiry that came in off the site. */
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().optional().or(z.literal('')),
  whatsapp: z.string().trim().max(40).optional().or(z.literal('')),
  channel: z.string().trim().max(40).optional().or(z.literal('')),
  propertyIds: z.array(z.string().min(1)).max(30).default([]),
  checkIn: dateKey.optional().or(z.literal('')),
  checkOut: dateKey.optional().or(z.literal('')),
  guests: z.union([z.number(), z.string()]).optional().nullable(),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  notes: z.string().trim().max(4000).optional().or(z.literal('')),
  locale: z.enum(['en', 'es']).default('en'),
})

export async function POST(req: Request) {
  const admin = await requireAdmin({ throwOnFail: true })

  let data: z.infer<typeof schema>
  try {
    data = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload', details: (err as z.ZodError).issues }, { status: 400 })
  }

  const properties = await getInquiryProperties([...new Set(data.propertyIds)])
  const hasDates = data.checkIn && data.checkOut && data.checkOut > data.checkIn
  const guests = data.guests === '' || data.guests == null ? null : Number(data.guests)

  const inquiry = await prisma.inquiry.create({
    data: {
      reference: await newInquiryReference(),
      source: 'MANUAL',
      status: 'CONTACTED',
      channel: data.channel || null,
      name: data.name,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      locale: data.locale,
      checkIn: hasDates ? keyToDbDate(data.checkIn!) : null,
      checkOut: hasDates ? keyToDbDate(data.checkOut!) : null,
      guests: Number.isFinite(guests) && guests! > 0 ? Math.round(guests!) : null,
      message: data.message || null,
      notes: data.notes || null,
      propertyIds: properties.map((p) => p._id),
      propertyTitles: properties.map(propertyTitle),
      createdByUserId: admin.id,
    },
  })

  return NextResponse.json({ id: inquiry.id })
}
