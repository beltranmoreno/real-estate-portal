import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

/**
 * Server-only Sanity client with write access.
 * NEVER import this from client components or browser code.
 * Uses SANITY_API_WRITE_TOKEN (not NEXT_PUBLIC_) so the token
 * stays on the server.
 *
 * `perspective: 'raw'` returns documents with their real `_id`
 * (including the `drafts.` prefix for draft documents). We need
 * this so the completion endpoints can patch the correct document
 * regardless of its publish state.
 */
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'raw',
})
