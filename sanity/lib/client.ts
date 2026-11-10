import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disabled CDN to get fresh data
  // Server-only on purpose: a NEXT_PUBLIC_ variable is copied into the
  // browser bundle of anything that imports this client, and this token can
  // read drafts and owners' listing-completion links.
  token: process.env.SANITY_API_READ_TOKEN,
})
