import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'

export interface PortalPlate {
  _id: string
  name_en: string | null
  name_es: string | null
  slug: string | null
  description_en?: string | null
  description_es?: string | null
  courseType?: string | null
  mealType?: string | null
  cuisine?: string | null
  image?: any
  dietaryOptions?: string[] | null
  allergenInfo_en?: string | null
  allergenInfo_es?: string | null
  pricePerPerson?: { amount?: number | null; currency?: string | null } | null
  isActive?: boolean | null
  order?: number | null
}

/** Snapshotted plate stored on a kind=PLATE ServiceRequest (plateItems[]). */
export interface PlateLineItem {
  plateSanityId: string
  name_en: string | null
  name_es: string | null
  courseType?: string | null
  mealType?: string | null
  dietary?: string[] | null
  price?: { amount?: number | null; currency?: string | null } | null
}

export const PLATE_PROJECTION = `{
  _id,
  name_en,
  name_es,
  "slug": slug.current,
  description_en,
  description_es,
  courseType,
  mealType,
  cuisine,
  image,
  dietaryOptions,
  allergenInfo_en,
  allergenInfo_es,
  pricePerPerson,
  isActive,
  order
}`

function sortPlates(plates: PortalPlate[]): PortalPlate[] {
  return plates
    .filter((p) => p && p.isActive !== false)
    .sort((a, b) => {
      const ct = (a.courseType ?? '').localeCompare(b.courseType ?? '')
      if (ct !== 0) return ct
      return (a.order ?? 999) - (b.order ?? 999)
    })
}

/**
 * Active à-la-carte plates assigned to a property via property.availablePlates.
 * Ordered by course type then display order. Empty when none are assigned.
 */
export async function getPlatesForProperty(
  propertySanityId: string
): Promise<PortalPlate[]> {
  const query = `*[_type == "property" && _id == $id][0]{
    "plates": availablePlates[]->${PLATE_PROJECTION}
  }`
  try {
    const res = await (sanityClient.fetch as unknown as (
      q: string,
      p: Record<string, unknown>
    ) => Promise<{ plates?: PortalPlate[] }>)(query, { id: propertySanityId })
    return sortPlates(res?.plates ?? [])
  } catch (err) {
    console.error('[portal/presetPlates] getPlatesForProperty failed', err)
    return []
  }
}

/**
 * Resolve a list of plate ids back to their catalog rows — used at submission
 * time to snapshot the renter's à-la-carte selection with the latest content.
 */
export async function resolvePlatesByIds(
  ids: string[]
): Promise<Map<string, PortalPlate>> {
  if (!ids.length) return new Map()
  const query = `*[_type == "presetPlate" && _id in $ids]${PLATE_PROJECTION}`
  try {
    const results = await (sanityClient.fetch as unknown as (
      q: string,
      p: Record<string, unknown>
    ) => Promise<PortalPlate[]>)(query, { ids })
    const map = new Map<string, PortalPlate>()
    for (const r of results ?? []) if (r?._id) map.set(r._id, r)
    return map
  } catch (err) {
    console.error('[portal/presetPlates] resolvePlatesByIds failed', err)
    return new Map()
  }
}

/** Slim option for admin pickers — id + label + grouping only. */
export interface PlateOption {
  _id: string
  name_en: string | null
  name_es: string | null
  courseType: string | null
  mealType: string | null
}

/** Every active plate in the catalog, for the admin dining-offering picker. */
export async function getAllActivePlates(): Promise<PlateOption[]> {
  const query = `*[_type == "presetPlate" && isActive != false]
    | order(courseType asc, order asc, name_en asc){
    _id, name_en, name_es, courseType, mealType
  }`
  try {
    const results = await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<PlateOption[]>)(query)
    return Array.isArray(results) ? results : []
  } catch (err) {
    console.error('[portal/presetPlates] getAllActivePlates failed', err)
    return []
  }
}

/** Full-detail active plates — for admin preview. */
export async function getAllActivePlatesFull(): Promise<PortalPlate[]> {
  const query = `*[_type == "presetPlate" && isActive != false]${PLATE_PROJECTION}`
  try {
    const results = await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<PortalPlate[]>)(query)
    return sortPlates(results ?? [])
  } catch (err) {
    console.error('[portal/presetPlates] getAllActivePlatesFull failed', err)
    return []
  }
}

/**
 * Fetch a set of plates by id (active only), preserving no particular order.
 * Used to resolve a booking's per-booking `offeredPlateSanityIds`.
 */
export async function getPlatesByIds(ids: string[]): Promise<PortalPlate[]> {
  if (!ids.length) return []
  const query = `*[_type == "presetPlate" && _id in $ids]${PLATE_PROJECTION}`
  try {
    const results = await (sanityClient.fetch as unknown as (
      q: string,
      p: Record<string, unknown>
    ) => Promise<PortalPlate[]>)(query, { ids })
    return sortPlates(results ?? [])
  } catch (err) {
    console.error('[portal/presetPlates] getPlatesByIds failed', err)
    return []
  }
}
