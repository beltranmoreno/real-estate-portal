import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

/**
 * Server-only Sanity client with write access.
 * NEVER import this from client components or browser code.
 * Uses SANITY_API_WRITE_TOKEN (not NEXT_PUBLIC_) so the token
 * stays on the server.
 *
 * `perspective: 'drafts'` makes lookups see draft documents too,
 * so the owner-completion flow works on properties that the agent
 * has saved but not yet published.
 */
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'drafts',
})
