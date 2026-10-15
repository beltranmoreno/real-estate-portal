/**
 * How long Sanity query results are cached, in seconds.
 *
 * Production keeps results for an hour so pages stay fast. In `yarn dev`
 * caching is off (0), so edits published in Studio show up on the next
 * refresh instead of up to an hour later.
 */
export const SANITY_REVALIDATE = process.env.NODE_ENV === 'development' ? 0 : 3600
