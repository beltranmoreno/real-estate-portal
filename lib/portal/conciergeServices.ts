import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'
import type { ConciergeServiceOption } from './conciergeServices.types'

// Re-export the client-safe types so server callers can keep using a
// single import path. Client components must import from
// `./conciergeServices.types` directly to avoid bundling server-only.
export type { ConciergeServiceOption } from './conciergeServices.types'
export { CATEGORY_LABELS } from './conciergeServices.types'

const ACTIVE_QUERY = `*[_type == "conciergeService" && isActive == true]
  | order(category asc, order asc, name_en asc) {
  _id,
  "slug": slug.current,
  name_en,
  name_es,
  shortDescription_en,
  shortDescription_es,
  category,
  icon,
  isFeatured,
  priceFrom
}`

export async function getConciergeServices(): Promise<ConciergeServiceOption[]> {
  try {
    const results = (await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<ConciergeServiceOption[]>)(ACTIVE_QUERY)) as ConciergeServiceOption[]
    return Array.isArray(results) ? results : []
  } catch (err) {
    console.error('[portal/conciergeServices] fetch failed', err)
    return []
  }
}

/**
 * Single-service lookup, used when a renter or admin submits a request
 * — we re-fetch the canonical name/category to snapshot onto the
 * ServiceRequest row instead of trusting the client.
 */
export async function getConciergeServiceById(
  id: string
): Promise<ConciergeServiceOption | null> {
  const query = `*[_type == "conciergeService" && _id == $id][0] {
    _id,
    "slug": slug.current,
    name_en,
    name_es,
    shortDescription_en,
    shortDescription_es,
    category,
    icon,
    isFeatured,
    priceFrom
  }`
  try {
    const result = (await (sanityClient.fetch as unknown as (
      q: string,
      params: Record<string, unknown>
    ) => Promise<ConciergeServiceOption | null>)(query, { id })) as
      | ConciergeServiceOption
      | null
    return result ?? null
  } catch (err) {
    console.error('[portal/conciergeServices] getById failed', err)
    return null
  }
}
