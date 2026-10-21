/**
 * Client-safe inquiry helpers, shared by the public inquiry form and admin.
 * Server-side logic (saving, Sanity collections, email) is in lib/inquiries.ts.
 */

/** Leticia's WhatsApp, in international format. */
export const LETICIA_WHATSAPP = '+18293422566'

export type InquirySourceKey = 'PROPERTY' | 'FAVORITES'

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
  return lines.join('\n')
}
