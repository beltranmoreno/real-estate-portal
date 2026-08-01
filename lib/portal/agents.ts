import 'server-only'
import { client as sanityClient } from '@/sanity/lib/client'

export interface PortalAgent {
  _id: string
  name: string
  positionTitle_en?: string | null
  positionTitle_es?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  photo?: any
}

const QUERY = `*[_type == "agent" && isActive == true]
  | order(coalesce(order, 9999) asc, name asc){
    _id, name, positionTitle_en, positionTitle_es, email, phone, whatsapp, photo
  }`

/** Active agents (ordered) for the portal contact block. */
export async function getPortalAgents(): Promise<PortalAgent[]> {
  try {
    const rows = (await (sanityClient.fetch as unknown as (
      q: string
    ) => Promise<PortalAgent[]>)(QUERY)) as PortalAgent[]
    return Array.isArray(rows) ? rows : []
  } catch (err) {
    console.error('[portal/agents] getPortalAgents failed', err)
    return []
  }
}
