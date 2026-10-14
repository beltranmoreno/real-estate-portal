'use client'

import { SWRConfig } from 'swr'
import { fetcher } from '@/lib/swr'

/**
 * App-wide SWR defaults: a shared JSON fetcher, no refetch-on-focus (this is
 * mostly read-mostly content), and a 1-minute dedupe window so repeated keys
 * (e.g. reopening the account menu) hit the cache instead of the network.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        dedupingInterval: 60_000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
