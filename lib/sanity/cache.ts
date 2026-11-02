/**
 * How long Sanity query results are cached, in seconds.
 *
 * Publishing in Studio clears the cache straight away: Sanity calls
 * /api/revalidate, which expires everything tagged SANITY_TAG. The hour is
 * only a safety net in case a webhook call is missed. In `yarn dev` caching is
 * off (0), so edits show up on the next refresh.
 */
export const SANITY_REVALIDATE = process.env.NODE_ENV === 'development' ? 0 : 3600

/**
 * One tag for all Sanity data. Documents reference each other (an area's name
 * shows on every property card), so any publish clears everything — simple,
 * always correct, and cheap at this site's size.
 */
export const SANITY_TAG = 'sanity'

/** Fetch cache options for Sanity queries: `client.fetch(q, p, { next: SANITY_CACHE })`. */
export const SANITY_CACHE = { revalidate: SANITY_REVALIDATE, tags: [SANITY_TAG] }
