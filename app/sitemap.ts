import type { MetadataRoute } from 'next'
import {
  getActivePropertySlugs,
  getAreaSlugs,
  getCollectionSlugs,
  getGolfCourseSlugs,
  getInfoPageSlugs,
  getRestaurantSlugs,
} from '@/lib/sanity/sitemapQueries'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

// Rebuild sitemap at most once an hour. Sanity updates don't need
// to be reflected instantly for crawlers.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1.0, lastModified: now },
    { url: `${SITE_URL}/search`, changeFrequency: 'daily', priority: 0.8, lastModified: now },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5, lastModified: now },
    { url: `${SITE_URL}/golf-cart-rental`, changeFrequency: 'monthly', priority: 0.6, lastModified: now },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2, lastModified: now },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2, lastModified: now },
    { url: `${SITE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.2, lastModified: now },
  ]

  // Fetch all dynamic slugs in parallel.
  const [properties, areas, collections, info, courses, restaurants] = await Promise.all([
    getActivePropertySlugs(),
    getAreaSlugs(),
    getCollectionSlugs(),
    getInfoPageSlugs(),
    getGolfCourseSlugs(),
    getRestaurantSlugs(),
  ])

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${SITE_URL}/property/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/selection/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const infoRoutes: MetadataRoute.Sitemap = info.map((i) => ({
    url: `${SITE_URL}/info/${i.slug}`,
    lastModified: i.updatedAt ? new Date(i.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}/courses/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const restaurantRoutes: MetadataRoute.Sitemap = restaurants.map((r) => ({
    url: `${SITE_URL}/restaurants/${r.slug}`,
    lastModified: r.updatedAt ? new Date(r.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // Areas are indirectly represented as filters on /search. Still
  // useful to expose them so area-specific landing pages can be
  // picked up if you add them later.
  const areaRoutes: MetadataRoute.Sitemap = areas.map((a) => ({
    url: `${SITE_URL}/search?area=${encodeURIComponent(a.slug)}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...propertyRoutes,
    ...collectionRoutes,
    ...infoRoutes,
    ...courseRoutes,
    ...restaurantRoutes,
    ...areaRoutes,
  ]
}
