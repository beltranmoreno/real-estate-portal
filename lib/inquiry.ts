/**
 * Client-safe inquiry helpers, shared by the public inquiry form and admin.
 * Server-side logic (saving, Sanity collections, email) is in lib/inquiries.ts.
 */

/** Leticia's WhatsApp, in international format. */
export const LETICIA_WHATSAPP = '+18293422566'

export type InquirySourceKey = 'PROPERTY' | 'FAVORITES'

/** Nightly budget ranges offered on the inquiry form (USD). */
export const BUDGET_RANGES = [
  { key: 'under-1000', en: 'Under $1,000', es: 'Menos de $1,000' },
  { key: '1000-2500', en: '$1,000 – $2,500', es: '$1,000 – $2,500' },
  { key: '2500-5000', en: '$2,500 – $5,000', es: '$2,500 – $5,000' },
  { key: '5000-10000', en: '$5,000 – $10,000', es: '$5,000 – $10,000' },
  { key: '10000-plus', en: '$10,000+', es: '$10,000+' },
] as const

export type BudgetKey = (typeof BUDGET_RANGES)[number]['key']
export const BUDGET_KEYS = BUDGET_RANGES.map((b) => b.key) as [BudgetKey, ...BudgetKey[]]

/** "$1,000 – $2,500 / night" (or the stored value if it's not a known key). */
export function budgetLabel(key: string | null | undefined, locale: 'en' | 'es' = 'en'): string | null {
  if (!key) return null
  const range = BUDGET_RANGES.find((b) => b.key === key)
  return range ? `${range[locale]} ${locale === 'es' ? '/ noche' : '/ night'}` : key
}

export interface InquiryPayload {
  source: InquirySourceKey
  propertyIds: string[]
  name: string
  email?: string
  whatsapp?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  message?: string
  estimateTotal?: number
  estimateCurrency?: string
  budget?: BudgetKey
  locale: 'en' | 'es'
  /** Honeypot: real visitors never fill it. */
  website?: string
}

/** wa.me link with a pre-filled message. */
export function whatsappLink(text: string, number: string = LETICIA_WHATSAPP): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

/** The message a visitor sends after their inquiry is saved. */
export function inquiryWhatsappMessage(opts: {
  reference: string
  name: string
  titles: string[]
  checkIn?: string
  checkOut?: string
  guests?: number
  budget?: string
  locale: 'en' | 'es'
}): string {
  const es = opts.locale === 'es'
  const lines = [
    es ? `¡Hola Leticia! Soy ${opts.name}.` : `Hi Leticia! This is ${opts.name}.`,
    es ? `Acabo de enviar una consulta (ref. ${opts.reference}):` : `I just sent an inquiry (ref. ${opts.reference}):`,
    ...opts.titles.map((title) => `• ${title}`),
  ]
  if (opts.checkIn && opts.checkOut) lines.push(`${es ? 'Fechas' : 'Dates'}: ${opts.checkIn} → ${opts.checkOut}`)
  if (opts.guests) lines.push(`${es ? 'Huéspedes' : 'Guests'}: ${opts.guests}`)
  const budget = budgetLabel(opts.budget, opts.locale)
  if (budget) lines.push(`${es ? 'Presupuesto' : 'Budget'}: ${budget}`)
  return lines.join('\n')
}
