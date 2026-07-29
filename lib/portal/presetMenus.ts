import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'

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
