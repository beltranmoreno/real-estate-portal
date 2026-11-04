import { z } from 'zod'
import { keyToDbDate } from '@/lib/dates'

/**
 * The inquiry fields an admin fills in (log form, edit form). Shared by
 * POST /api/admin/inquiries and PATCH /api/admin/inquiries/[id] so both
 * validate and store them the same way.
 */
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const text = (max: number) => z.string().trim().max(max).optional().or(z.literal(''))
const count = z.union([z.number(), z.string()]).optional().nullable()

export const inquiryFieldsSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().optional().or(z.literal('')),
  whatsapp: text(40),
  nationality: text(60),
  channel: text(40),
  checkIn: dateKey.optional().or(z.literal('')),
  checkOut: dateKey.optional().or(z.literal('')),
  guests: count,
  bedrooms: count,
  budget: text(120),
  message: text(4000),
  notes: text(4000),
  locale: z.enum(['en', 'es']).default('en'),
  propertyIds: z.array(z.string().min(1)).max(30).default([]),
  propertyNotes: z.record(z.string(), z.string().max(2000)).optional(),
})

export type InquiryFields = z.infer<typeof inquiryFieldsSchema>

const positiveInt = (v: InquiryFields['guests']) => {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

/** Comments kept only for houses still in the inquiry, empty ones dropped. */
export function cleanPropertyNotes(notes: Record<string, string> | undefined, propertyIds: string[]) {
  const out: Record<string, string> = {}
  for (const id of propertyIds) {
    const note = notes?.[id]?.trim()
    if (note) out[id] = note
  }
  return out
}

/** Form fields → Prisma columns (houses are resolved separately, against Sanity). */
export function inquiryFieldsToData(data: Omit<InquiryFields, 'propertyIds' | 'propertyNotes'>) {
  const hasDates = !!(data.checkIn && data.checkOut && data.checkOut > data.checkIn)
  return {
    name: data.name,
    email: data.email || null,
    whatsapp: data.whatsapp || null,
    nationality: data.nationality || null,
    channel: data.channel || null,
    locale: data.locale,
    checkIn: hasDates ? keyToDbDate(data.checkIn!) : null,
    checkOut: hasDates ? keyToDbDate(data.checkOut!) : null,
    guests: positiveInt(data.guests),
    bedrooms: positiveInt(data.bedrooms),
    budget: data.budget || null,
    message: data.message || null,
    notes: data.notes || null,
  }
}
