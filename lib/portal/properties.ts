import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'

/**
 * Lightweight property summary for the admin booking-creation form.
 * Fetches all properties (including pending stubs) so admins can create
 * a booking even before the property is fully set up.
 */
export interface PropertyOption {
  _id: string
  title_en: string | null
  title_es: string | null
  propertyCode: string | null
  status: string | null
  mainImage?: any
}

export async function getPropertyOptions(): Promise<PropertyOption[]> {
  const query = `*[_type == "property"] | order(coalesce(status, "z") asc, title_en asc) {
    _id,
    title_en,
    title_es,
    propertyCode,
    status,
    mainImage
  }`
  try {
    const results = (await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<PropertyOption[]>)(query)) as PropertyOption[]
    return Array.isArray(results) ? results : []
  } catch (err) {
    console.error('[portal/properties] getPropertyOptions failed', err)
    return []
  }
}

/**
 * Single-property fetch for the renter portal — pulls the data the
 * portal cares about (title, location, house manual, contact info).
 * Sanity remains the source of truth; we never copy this into Postgres.
 */
export interface PortalPropertyDetail {
  _id: string
  title_en: string | null
  title_es: string | null
  propertyCode: string | null
  mainImage?: any
  gallery?: any[]
  location?: {
    street?: string
    city?: string
    country?: string
    coordinates?: { lat: number; lng: number }
    isPrivateAddress?: boolean
  }
  contactInfo?: {
    hostName?: string
    phone?: string
    whatsapp?: string
    email?: string
  }
  amenities?: any
  houseRules?: any
}

export async function getPropertyForPortal(
  sanityId: string
): Promise<PortalPropertyDetail | null> {
  // Strip any `drafts.` prefix so we always look up the published doc.
  const id = sanityId.replace(/^drafts\./, '')

  const query = `*[_type == "property" && _id == $id][0] {
    _id,
    title_en,
    title_es,
    propertyCode,
    mainImage,
    gallery,
    location {
      street,
      city,
      country,
      coordinates,
      isPrivateAddress
    },
    contactInfo,
    amenities,
    houseRules
  }`

  try {
    const result = (await (sanityClient.fetch as unknown as (
      q: string,
      params: Record<string, unknown>
    ) => Promise<PortalPropertyDetail | null>)(query, { id })) as
      | PortalPropertyDetail
      | null
    return result ?? null
  } catch (err) {
    console.error('[portal/properties] getPropertyForPortal failed', err)
    return null
  }
}
