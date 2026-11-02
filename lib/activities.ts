import { client } from '@/sanity/lib/client'
import { SANITY_CACHE } from '@/lib/sanity/cache'

export type Bi = { en?: string | null; es?: string | null }

export interface GroupActivity {
  _id: string
  name_en?: string
  name_es?: string
  summary_en?: string
  summary_es?: string
  image?: any
  where?: { name_en?: string; name_es?: string } | null
  mapsUrl?: string | null
}

/** An Activity group with its active activities, as on the Activities page. */
export interface ActivityGroup {
  _id: string
  slug: string
  name_en?: string
  name_es?: string
  title_en?: string
  title_es?: string
  intro_en?: string
  intro_es?: string
  image?: any
  activities: GroupActivity[]
}

/** Active groups in order, each with its activities; empty groups left out. */
export async function getActivityGroups(): Promise<ActivityGroup[]> {
  try {
    const groups: ActivityGroup[] = await client.fetch(
      `*[_type == "activityGroup" && isActive != false && !(_id in path("drafts.**"))]
        | order(coalesce(order, 999) asc, name_en asc) {
          _id, "slug": slug.current, name_en, name_es, title_en, title_es, intro_en, intro_es, image,
          "activities": *[_type == "activity" && isActive != false && group._ref == ^._id]
            | order(coalesce(order, 999) asc, name_en asc) {
              _id, name_en, name_es, summary_en, summary_es, image,
              "where": location->{ name_en, name_es },
              "mapsUrl": location->googleMapsUrl
            }
        }`,
      {},
      { next: SANITY_CACHE }
    )
    return groups.filter((g) => g.activities.length > 0)
  } catch (err) {
    console.error('[activities] groups fetch failed', err)
    return []
  }
}
