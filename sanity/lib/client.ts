import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disabled CDN to get fresh data
  token: process.env.NEXT_PUBLIC_SANITY_READ_TOKEN,
})
