import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'
import {
  PLATE_PROJECTION,
  getPlatesForProperty,
  getPlatesByIds,
  type PortalPlate,
} from './presetPlates'

export interface PortalMenuCourse {
  courseName_en?: string | null
  courseName_es?: string | null
  items_en?: string[] | null
  items_es?: string[] | null
}

export interface PortalMenu {
  _id: string
  name_en: string | null
  name_es: string | null
  slug: string | null
  description_en: string | null
  description_es: string | null
  mealType: string | null
  cuisine: string | null
  image?: any
  dietaryOptions?: string[] | null
  allergenInfo_en?: string | null
  allergenInfo_es?: string | null
  courses?: PortalMenuCourse[] | null
  plates?: PortalPlate[] | null
  pricePerPerson?: { amount?: number | null; currency?: string | null } | null
  flatPrice?: { amount?: number | null; currency?: string | null } | null
  minGuests?: number | null
  maxGuests?: number | null
  leadTimeHours?: number | null
  isFeatured?: boolean | null
}

const MENU_PROJECTION = `{
  _id,
  name_en,
  name_es,
  "slug": slug.current,
  description_en,
  description_es,
  mealType,
  cuisine,
  image,
  dietaryOptions,
  allergenInfo_en,
  allergenInfo_es,
  courses[]{ courseName_en, courseName_es, items_en, items_es },
  plates[]->${PLATE_PROJECTION},
  pricePerPerson,
  flatPrice,
  minGuests,
  maxGuests,
  leadTimeHours,
  isFeatured,
  isActive,
  order
}`

/**
 * Active chef menus assigned to a property (via property.availableMenus),
 * ordered by meal type then display order. Empty when none are assigned.
 */
export async function getMenusForProperty(
  propertySanityId: string
): Promise<PortalMenu[]> {
  const query = `*[_type == "property" && _id == $id][0]{
    "menus": availableMenus[]->${MENU_PROJECTION}
  }`
  try {
    const res = (await (sanityClient.fetch as unknown as (
      q: string,
      p: Record<string, unknown>
    ) => Promise<{ menus?: (PortalMenu & { isActive?: boolean; order?: number })[] }>)(
      query,
      { id: propertySanityId }
    ))
    const menus = res?.menus ?? []
    return menus
      .filter((m) => m && m.isActive !== false)
      .sort((a, b) => {
        const mt = (a.mealType ?? '').localeCompare(b.mealType ?? '')
        if (mt !== 0) return mt
        return (a.order ?? 999) - (b.order ?? 999)
      })
  } catch (err) {
    console.error('[portal/presetMenus] getMenusForProperty failed', err)
    return []
  }
}

function sortMenus(
  menus: (PortalMenu & { isActive?: boolean; order?: number })[]
): PortalMenu[] {
  return menus
    .filter((m) => m && m.isActive !== false)
    .sort((a, b) => {
      const mt = (a.mealType ?? '').localeCompare(b.mealType ?? '')
      if (mt !== 0) return mt
      return (a.order ?? 999) - (b.order ?? 999)
    })
}

/** Active menus by id (used to resolve a booking's offeredMenuSanityIds). */
export async function getMenusByIds(ids: string[]): Promise<PortalMenu[]> {
  if (!ids.length) return []
  const query = `*[_type == "presetMenu" && _id in $ids]${MENU_PROJECTION}`
  try {
    const results = await (sanityClient.fetch as unknown as (
      q: string,
      p: Record<string, unknown>
    ) => Promise<(PortalMenu & { isActive?: boolean; order?: number })[]>)(query, {
      ids,
    })
    return sortMenus(results ?? [])
  } catch (err) {
    console.error('[portal/presetMenus] getMenusByIds failed', err)
    return []
  }
}

/**
 * The property's always-available dining ids (from Sanity). Used by the
 * admin picker to mark which menus/plates are already on for every booking.
 */
export async function getPropertyDiningDefaults(
  propertySanityId: string
): Promise<{ menuIds: string[]; plateIds: string[] }> {
  const query = `*[_type == "property" && _id == $id][0]{
    "menuIds": availableMenus[]->_id,
    "plateIds": availablePlates[]->_id
  }`
  try {
    const res = await (sanityClient.fetch as unknown as (
      q: string,
      p: Record<string, unknown>
    ) => Promise<{ menuIds?: string[]; plateIds?: string[] }>)(query, {
      id: propertySanityId,
    })
    return {
      menuIds: (res?.menuIds ?? []).filter(Boolean),
      plateIds: (res?.plateIds ?? []).filter(Boolean),
    }
  } catch (err) {
    console.error('[portal/presetMenus] getPropertyDiningDefaults failed', err)
    return { menuIds: [], plateIds: [] }
  }
}

/** Slim option for admin pickers — id + label + grouping only. */
export interface MenuOption {
  _id: string
  name_en: string | null
  name_es: string | null
  mealType: string | null
}

/** Every active menu in the catalog, for the admin dining-offering picker. */
export async function getAllActiveMenus(): Promise<MenuOption[]> {
  const query = `*[_type == "presetMenu" && isActive != false]
    | order(mealType asc, order asc, name_en asc){
    _id, name_en, name_es, mealType
  }`
  try {
    const results = await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<MenuOption[]>)(query)
    return Array.isArray(results) ? results : []
  } catch (err) {
    console.error('[portal/presetMenus] getAllActiveMenus failed', err)
    return []
  }
}

/** Full-detail active menus (with plates dereferenced) — for admin preview. */
export async function getAllActiveMenusFull(): Promise<PortalMenu[]> {
  const query = `*[_type == "presetMenu" && isActive != false]${MENU_PROJECTION}`
  try {
    const results = await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<(PortalMenu & { isActive?: boolean; order?: number })[]>)(query)
    return sortMenus(results ?? [])
  } catch (err) {
    console.error('[portal/presetMenus] getAllActiveMenusFull failed', err)
    return []
  }
}

export interface DiningOffering {
  menus: PortalMenu[]
  plates: PortalPlate[]
}

/**
 * The dining a specific booking can request. Everything is gated by the
 * admin's per-booking allow-list — the guest sees ONLY the menus/plates whose
 * ids are in offered*SanityIds (pre-filled from property defaults at creation,
 * then curated by the admin). Nothing is auto-available.
 */
export async function getDiningForBooking(params: {
  offeredMenuSanityIds?: string[]
  offeredPlateSanityIds?: string[]
}): Promise<DiningOffering> {
  const { offeredMenuSanityIds = [], offeredPlateSanityIds = [] } = params
  const [menus, plates] = await Promise.all([
    getMenusByIds(offeredMenuSanityIds),
    getPlatesByIds(offeredPlateSanityIds),
  ])
  return { menus, plates }
}

/** Single menu — used server-side to snapshot the name onto a request. */
export async function getPresetMenuById(id: string): Promise<PortalMenu | null> {
  const query = `*[_type == "presetMenu" && _id == $id][0]${MENU_PROJECTION}`
  try {
    return (await (sanityClient.fetch as unknown as (
      q: string,
      p: Record<string, unknown>
    ) => Promise<PortalMenu | null>)(query, { id })) ?? null
  } catch (err) {
    console.error('[portal/presetMenus] getPresetMenuById failed', err)
    return null
  }
}
