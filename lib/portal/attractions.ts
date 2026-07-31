import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'
import type { AttractionOption } from './attractions.types'

export type { AttractionOption } from './attractions.types'

const QUERY = `*[_type == "attraction" && isActive != false]
  | order(category asc, order asc, name_en asc){
    "id": _id, name_en, name_es, category
  }`

/**
 * Active attractions / points of interest as lightweight options for the
 * admin "attach a POI" picker (name + category only). Empty on error.
 */
export async function getAttractionOptions(): Promise<AttractionOption[]> {
  try {
    const rows = (await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<AttractionOption[]>)(QUERY)) as AttractionOption[]
    return Array.isArray(rows) ? rows : []
  } catch (err) {
    console.error('[portal/attractions] getAttractionOptions failed', err)
    return []
  }
}
