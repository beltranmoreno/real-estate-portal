import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'
import type { RestaurantOption } from './restaurants.types'

export type { RestaurantOption } from './restaurants.types'

const QUERY = `*[_type == "restaurant" && status == "published"]
  | order(area asc, name_en asc){
    "id": _id, name_en, name_es, area
  }`

/**
 * Published restaurants as lightweight options for the reservation venue
 * dropdown (name + area only). Empty on error.
 */
export async function getRestaurantOptions(): Promise<RestaurantOption[]> {
  try {
    const rows = (await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<RestaurantOption[]>)(QUERY)) as RestaurantOption[]
    return Array.isArray(rows) ? rows : []
  } catch (err) {
    console.error('[portal/restaurants] getRestaurantOptions failed', err)
    return []
  }
}
