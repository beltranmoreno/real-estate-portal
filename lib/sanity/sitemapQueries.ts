import { client } from '@/sanity/lib/client'

export interface SitemapEntry {
  slug: string
  updatedAt?: string
}

/**
 * Lightweight queries that return only what the sitemap needs:
 * slug + _updatedAt. Kept separate from the main query file so
 * sitemap generation doesn't pull megabytes of property data per
 * rebuild.
 */

async function fetchSlugs(filter: string): Promise<SitemapEntry[]> {
  const query = `*[${filter} && defined(slug.current)]{
    "slug": slug.current,
    "updatedAt": _updatedAt
  }`
  try {
    const results = await client.fetch(query)
    return Array.isArray(results) ? results : []
  } catch (err) {
    console.error('[sitemap] query failed', filter, err)
    return []
  }
}

export const getActivePropertySlugs = () =>
  fetchSlugs(`_type == "property" && status == "active"`)

export const getAreaSlugs = () => fetchSlugs(`_type == "area"`)

export const getCollectionSlugs = () => fetchSlugs(`_type == "collection"`)

export const getInfoPageSlugs = () => fetchSlugs(`_type == "infoPage"`)

export const getGolfCourseSlugs = () => fetchSlugs(`_type == "golfCourse"`)

export const getRestaurantSlugs = () => fetchSlugs(`_type == "restaurant"`)
