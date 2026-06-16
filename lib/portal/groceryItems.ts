import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'
import type { GroceryItemOption } from './groceryItems.types'

export type { GroceryItemOption, GroceryLineItem } from './groceryItems.types'
export {
  GROCERY_CATEGORY_LABELS,
  GROCERY_CATEGORY_ORDER,
} from './groceryItems.types'

const ACTIVE_QUERY = `*[_type == "groceryItem" && isActive == true]
  | order(category asc, order asc, name_en asc) {
  _id,
  "slug": slug.current,
  name_en,
  name_es,
  category,
  defaultUnit,
  brand,
  shopperNote_en,
  shopperNote_es,
  isPopular
}`

export async function getGroceryItems(): Promise<GroceryItemOption[]> {
  try {
    const results = (await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<GroceryItemOption[]>)(ACTIVE_QUERY)) as GroceryItemOption[]
    return Array.isArray(results) ? results : []
  } catch (err) {
    console.error('[portal/groceryItems] fetch failed', err)
    return []
  }
}

/**
 * Resolve a list of slugs back to canonical catalog rows. Used at
 * submission time to snapshot the renter's selection with the latest
 * EN/ES names from Sanity (in case they typed a search and clicked
 * an item that's been renamed since the page loaded).
 */
export async function resolveGroceryBySlugs(
  slugs: string[]
): Promise<Map<string, GroceryItemOption>> {
  if (!slugs.length) return new Map()
  const query = `*[_type == "groceryItem" && slug.current in $slugs] {
    _id,
    "slug": slug.current,
    name_en,
    name_es,
    category,
    defaultUnit,
    brand,
    shopperNote_en,
    shopperNote_es,
    isPopular
  }`
  try {
    const results = (await (sanityClient.fetch as unknown as (
      q: string,
      params: Record<string, unknown>
    ) => Promise<GroceryItemOption[]>)(query, { slugs })) as GroceryItemOption[]
    const map = new Map<string, GroceryItemOption>()
    for (const r of results) if (r.slug) map.set(r.slug, r)
    return map
  } catch (err) {
    console.error('[portal/groceryItems] resolveGroceryBySlugs failed', err)
    return new Map()
  }
}
