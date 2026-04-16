import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/studio',          // Sanity Studio admin UI
          '/studio/',
          '/complete-listing', // private owner completion links
          '/complete-listing/',
          '/api/',             // internal API routes
          '/favorites',        // user-specific, no indexable content
          '/*?*sort=',         // search permutations — avoid infinite crawl
          '/*?*page=',
        ],
      },
      // Block a couple of known badly-behaved crawlers. Remove if
      // you specifically want them to index the site.
      {
        userAgent: ['AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot'],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
