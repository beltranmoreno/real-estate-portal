import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ipLimited, mayEmailVisitor, siteFlooded } from '@/lib/formGuard'
import { prisma } from '@/lib/db'
import { keyToDbDate } from '@/lib/dates'
import { BUDGET_KEYS } from '@/lib/inquiry'
import { getInquiryProperties, newInquiryReference, notifyNewInquiry, propertyTitle, sendInquiryConfirmation } from '@/lib/inquiries'

/**
 * POST /api/inquire — public, no account needed.
 *
 * Saves the inquiry (name + email and/or WhatsApp, the houses, optional stay
 * details) so it shows up in /admin/inquiries, alerts Leticia, and returns a
 * short reference the visitor can quote on WhatsApp.
 */
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const schema = z
  .object({
    source: z.enum(['PROPERTY', 'FAVORITES']),
    propertyIds: z.array(z.string().min(1)).min(1).max(30),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200).optional().or(z.literal('')),
    whatsapp: z.string().trim().max(40).optional().or(z.literal('')),
    checkIn: dateKey.optional().or(z.literal('')),
    checkOut: dateKey.optional().or(z.literal('')),
    guests: z.number().int().min(1).max(200).optional(),
    message: z.string().trim().max(4000).optional(),
    estimateTotal: z.number().nonnegative().optional(),
    estimateCurrency: z.string().max(3).optional(),
    budget: z.enum(BUDGET_KEYS).optional(),
    locale: z.enum(['en', 'es']).default('en'),
    website: z.string().optional(), // honeypot
  })
  .refine((d) => d.email || (d.whatsapp && d.whatsapp.replace(/\D/g, '').length >= 7), {
    message: 'Email or WhatsApp number required',
    path: ['email'],
  })

export async function POST(request: NextRequest) {
  let data: z.infer<typeof schema>
  try {
    data = schema.parse(await request.json())
  } catch (err) {
    return NextResponse.json({ error: 'Invalid inquiry', details: (err as z.ZodError).issues }, { status: 400 })
  }

  // Bots fill every field; pretend it worked.
  if (data.website) return NextResponse.json({ reference: 'LC-0000' })

  if (ipLimited(request, 'inquire') || (await siteFlooded())) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later, or message us on WhatsApp.' },
      { status: 429 }
    )
  }

  // Titles come from Sanity, not the client.
  const properties = await getInquiryProperties([...new Set(data.propertyIds)])
  if (properties.length === 0) {
    return NextResponse.json({ error: 'Unknown property' }, { status: 400 })
  }

  const hasDates = data.checkIn && data.checkOut && data.checkOut > data.checkIn

  // Checked before saving, so this inquiry isn't counted against itself.
  const confirm = await mayEmailVisitor(data.email)

  const inquiry = await prisma.inquiry.create({
    data: {
      reference: await newInquiryReference(),
      source: data.source,
      name: data.name,
      email: data.email || null,
      whatsapp: data.whatsapp || null,
      locale: data.locale,
      checkIn: hasDates ? keyToDbDate(data.checkIn!) : null,
      checkOut: hasDates ? keyToDbDate(data.checkOut!) : null,
      guests: data.guests ?? null,
      message: data.message || null,
      propertyIds: properties.map((p) => p._id),
      propertyTitles: properties.map(propertyTitle),
      estimateTotal: data.estimateTotal ?? null,
      estimateCurrency: data.estimateTotal ? data.estimateCurrency || 'USD' : null,
      budget: data.budget ?? null,
    },
  })

  await Promise.all([notifyNewInquiry(inquiry), confirm ? sendInquiryConfirmation(inquiry) : null])

  return NextResponse.json({ reference: inquiry.reference })
}
