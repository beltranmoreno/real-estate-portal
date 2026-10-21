import 'server-only'
import { randomInt } from 'crypto'
import { Resend } from 'resend'
import type { Inquiry } from '@prisma/client'
import { prisma } from '@/lib/db'
import { client } from '@/sanity/lib/client'
import { serverClient } from '@/sanity/lib/serverClient'
import { dbDateKey, formatDateKey } from '@/lib/dates'
import InquirySelectionEmail from '@/emails/InquirySelectionEmail'
import InquiryReceivedEmail, { type EmailHouse } from '@/emails/InquiryReceivedEmail'
import { urlFor } from '@/sanity/lib/image'
import { getSimilarProperties } from '@/lib/sanity/similarProperties'
import { inquiryWhatsappMessage, whatsappLink } from '@/lib/inquiry'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'
const FROM_ADDRESS =
  process.env.PORTAL_EMAIL_FROM || 'Leticia Coudray Real Estate <hello@updates.leticiacoudrayrealestate.com>'
const REPLY_TO = process.env.PORTAL_EMAIL_REPLY_TO || 'leticiacoudrayrealestate@gmail.com'
/** Where new-inquiry alerts go. */
const NOTIFY_TO = process.env.INQUIRY_NOTIFY_EMAIL || REPLY_TO

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// No 0/O/1/I so references and access codes read cleanly over the phone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const randomCode = (length: number) => Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

/** Unique short reference, e.g. "LC-7K3F". */
export async function newInquiryReference(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const reference = `LC-${randomCode(4)}`
    const taken = await prisma.inquiry.findUnique({ where: { reference }, select: { id: true } })
    if (!taken) return reference
  }
  return `LC-${randomCode(6)}`
}

export interface InquiryProperty {
  _id: string
  title_en: string | null
  title_es: string | null
  slug: string | null
  propertyCode: string | null
  mainImage?: any
  bedrooms?: number | null
  status?: string | null
  areaTitle?: string | null
  areaRef?: string | null
  themes?: string[] | null
  listingType?: string | null
}

/** Live Sanity data for an inquiry's houses, in the inquiry's order. */
export async function getInquiryProperties(ids: string[]): Promise<InquiryProperty[]> {
  if (ids.length === 0) return []
  const rows: InquiryProperty[] = await client.fetch(
    `*[_type == "property" && _id in $ids]{
      _id, title_en, title_es, "slug": slug.current, propertyCode, mainImage, status,
      "bedrooms": amenities.bedrooms,
      "areaTitle": location.area->title_en,
      "areaRef": location.area._ref,
      themes,
      "listingType": pricing.type
    }`,
    { ids }
  )
  const byId = new Map(rows.map((r) => [r._id, r]))
  return ids.map((id) => byId.get(id)).filter(Boolean) as InquiryProperty[]
}

export const propertyTitle = (p: Pick<InquiryProperty, 'title_en' | 'title_es' | 'propertyCode' | '_id'>) =>
  p.title_en || p.title_es || p.propertyCode || p._id

/** Public link to an inquiry's private collection. */
export function collectionUrl(inquiry: Pick<Inquiry, 'collectionSlug' | 'collectionAccessCode'>): string | null {
  if (!inquiry.collectionSlug) return null
  const code = inquiry.collectionAccessCode ? `?accessCode=${encodeURIComponent(inquiry.collectionAccessCode)}` : ''
  return `${SITE_URL}/collection/${inquiry.collectionSlug}${code}`
}

/** Studio deep link that opens a document in the editor. */
export const studioEditUrl = (id: string, type: string) => `/studio/intent/edit/id=${id};type=${type}/`

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

/**
 * Creates a private Sanity collection with the inquiry's houses and links it
 * to the inquiry. Published straight away (not a draft) with an access code,
 * so the link works immediately; editors refine it in Studio afterwards.
 */
export async function createCollectionForInquiry(inquiry: Inquiry): Promise<Inquiry> {
  const firstName = inquiry.name.trim().split(/\s+/)[0] || inquiry.name
  const slug = slugify(`selection-${firstName}-${inquiry.reference}`)
  const accessCode = randomCode(6)

  const doc = await serverClient.create({
    _type: 'collection',
    title_en: `A selection for ${firstName}`,
    title_es: `Una selección para ${firstName}`,
    slug: { _type: 'slug', current: slug },
    collectionType: 'curated',
    isActive: true,
    isPublic: false,
    accessCode,
    welcomeMessage_en: `${firstName}, here are the houses I'd suggest for your stay in Casa de Campo. Have a look and tell me what you think — I'm happy to answer anything.`,
    welcomeMessage_es: `${firstName}, estas son las casas que te sugiero para tu estadía en Casa de Campo. Échales un vistazo y dime qué te parecen — con gusto respondo cualquier pregunta.`,
    properties: inquiry.propertyIds.map((id, i) => ({
      _type: 'reference',
      _ref: id,
      _key: `p${i}-${id.slice(-6)}`,
    })),
    ...(inquiry.checkIn && inquiry.checkOut
      ? { dateRange: { startDate: dbDateKey(inquiry.checkIn), endDate: dbDateKey(inquiry.checkOut) } }
      : {}),
    organizer: {
      name: inquiry.name,
      ...(inquiry.email ? { email: inquiry.email } : {}),
      ...(inquiry.whatsapp ? { phone: inquiry.whatsapp } : {}),
    },
    ...(inquiry.guests ? { metadata: { expectedGuests: inquiry.guests } } : {}),
    features: { showPricing: true, showAvailability: true, enableSharing: false, allowInquiries: true },
  })

  return prisma.inquiry.update({
    where: { id: inquiry.id },
    data: { collectionId: doc._id, collectionSlug: slug, collectionAccessCode: accessCode },
  })
}

/** Emails the guest their private collection and records it on the inquiry. */
export async function sendCollectionEmail(
  inquiry: Inquiry,
  opts: { to: string; note?: string | null; locale: 'en' | 'es' }
): Promise<Inquiry> {
  const url = collectionUrl(inquiry)
  if (!url) throw new Error('This inquiry has no collection yet')
  if (!resend) throw new Error('Email is not configured (RESEND_API_KEY missing)')

  const es = opts.locale === 'es'
  const firstName = inquiry.name.trim().split(/\s+/)[0] || inquiry.name
  const subject = es ? 'Tu selección de casas en Casa de Campo' : 'Your selection of houses in Casa de Campo'
  const dates =
    inquiry.checkIn && inquiry.checkOut
      ? `${formatDateKey(dbDateKey(inquiry.checkIn), opts.locale)} – ${formatDateKey(dbDateKey(inquiry.checkOut), opts.locale)}`
      : null

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    replyTo: REPLY_TO,
    to: opts.to,
    subject,
    react: InquirySelectionEmail({
      firstName,
      url,
      note: opts.note || null,
      dates,
      houseCount: inquiry.propertyIds.length,
      locale: opts.locale,
    }),
  })

  await prisma.notification.create({
    data: {
      recipientEmail: opts.to,
      kind: 'inquiry_selection',
      subject,
      body: url,
      resendId: data?.id ?? null,
      status: error ? 'failed' : 'sent',
    },
  })
  if (error) throw new Error(`Failed to send: ${error.message}`)

  return prisma.inquiry.update({
    where: { id: inquiry.id },
    data: {
      collectionSentAt: new Date(),
      collectionSentTo: opts.to,
      status: inquiry.status === 'BOOKED' ? 'BOOKED' : 'SELECTION_SENT',
    },
  })
}

/** Best-effort heads-up to Leticia that a website inquiry arrived. */
export async function notifyNewInquiry(inquiry: Inquiry): Promise<void> {
  if (!resend) return
  const lines = [
    `${inquiry.name} sent an inquiry (${inquiry.reference}).`,
    '',
    inquiry.email ? `Email: ${inquiry.email}` : null,
    inquiry.whatsapp ? `WhatsApp: ${inquiry.whatsapp}` : null,
    inquiry.checkIn && inquiry.checkOut ? `Dates: ${dbDateKey(inquiry.checkIn)} → ${dbDateKey(inquiry.checkOut)}` : null,
    inquiry.guests ? `Guests: ${inquiry.guests}` : null,
    '',
    'Houses:',
    ...inquiry.propertyTitles.map((t) => `• ${t}`),
    inquiry.message ? `\nMessage:\n${inquiry.message}` : null,
    '',
    `Open it: ${SITE_URL}/admin/inquiries/${inquiry.id}`,
  ].filter((l) => l !== null)

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: NOTIFY_TO,
      ...(inquiry.email ? { replyTo: inquiry.email } : {}),
      subject: `New inquiry from ${inquiry.name} (${inquiry.reference})`,
      text: lines.join('\n'),
    })
  } catch (err) {
    console.error('[inquiries] notify failed', err)
  }
}

/**
 * Confirmation to the visitor after a website inquiry (only when they left an
 * email): recap, a WhatsApp button, and a small "while you wait" section with
 * a few similar houses and things to do. Best-effort — never throws.
 */
export async function sendInquiryConfirmation(inquiry: Inquiry): Promise<void> {
  if (!resend || !inquiry.email) return
  const locale: 'en' | 'es' = inquiry.locale === 'es' ? 'es' : 'en'
  const es = locale === 'es'
  const firstName = inquiry.name.trim().split(/\s+/)[0] || inquiry.name

  try {
    const houses = await getInquiryProperties(inquiry.propertyIds)
    const lead = houses[0]
    const similar = lead
      ? await getSimilarProperties(
          {
            excludeIds: inquiry.propertyIds,
            listingType: lead.listingType,
            areaRef: lead.areaRef,
            bedrooms: lead.bedrooms,
            themes: lead.themes,
          },
          3
        )
      : []

    const toEmailHouse = (p: {
      title_en?: string | null
      title_es?: string | null
      slug?: string | null
      mainImage?: any
      bedrooms?: number | null
      areaTitle?: string | null
      area?: { title_en?: string; title_es?: string } | null
    }): EmailHouse => {
      const area = p.areaTitle ?? (es ? p.area?.title_es : p.area?.title_en) ?? null
      return {
        title: (es ? p.title_es : p.title_en) || p.title_en || p.title_es || '',
        url: `${SITE_URL}/property/${p.slug}`,
        // JPG (not auto/WebP): Outlook and older clients can't show WebP.
        imageUrl: p.mainImage ? urlFor(p.mainImage).width(176).height(132).fit('crop').format('jpg').url() : null,
        meta: [p.bedrooms ? `${p.bedrooms} ${es ? 'habitaciones' : 'bedrooms'}` : null, area].filter(Boolean).join(' · ') || null,
      }
    }

    const checkIn = inquiry.checkIn ? dbDateKey(inquiry.checkIn) : null
    const checkOut = inquiry.checkOut ? dbDateKey(inquiry.checkOut) : null
    const dates = checkIn && checkOut ? `${formatDateKey(checkIn, locale)} – ${formatDateKey(checkOut, locale)}` : null
    const houseList = houses.map(toEmailHouse)
    const subject = es
      ? `Recibí tu consulta (${inquiry.reference})`
      : `I have your inquiry (${inquiry.reference})`

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      replyTo: REPLY_TO,
      to: inquiry.email,
      subject,
      react: InquiryReceivedEmail({
        firstName,
        reference: inquiry.reference,
        houses: houseList,
        dates,
        guests: inquiry.guests,
        whatsappUrl: whatsappLink(
          inquiryWhatsappMessage({
            reference: inquiry.reference,
            name: inquiry.name,
            titles: houseList.map((h) => h.title),
            checkIn: checkIn ?? undefined,
            checkOut: checkOut ?? undefined,
            guests: inquiry.guests ?? undefined,
            locale,
          })
        ),
        similar: similar.filter((p) => p.slug).map(toEmailHouse),
        thingsToDoUrl: `${SITE_URL}/info/activities`,
        locale,
      }),
    })

    await prisma.notification.create({
      data: {
        recipientEmail: inquiry.email,
        kind: 'inquiry_received',
        subject,
        body: inquiry.reference,
        resendId: data?.id ?? null,
        status: error ? 'failed' : 'sent',
      },
    })
    if (error) console.error('[inquiries] confirmation failed', error)
  } catch (err) {
    console.error('[inquiries] confirmation failed', err)
  }
}
