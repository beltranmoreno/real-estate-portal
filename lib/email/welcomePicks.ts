import 'server-only'
import { prisma } from '@/lib/db'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

/**
 * The restaurants and activities shown at the bottom of the welcome (portal
 * invitation) email. Admins pick them on /admin/emails; the choice is stored
 * as Sanity ids in AppSetting. With nothing picked, the featured restaurants
 * and the first activities are shown so the email is never empty.
 */

export const WELCOME_PICKS_KEY = 'welcomeEmailPicks'
export const WELCOME_PICKS_MAX = 4

export interface WelcomePickIds {
  restaurantIds: string[]
  activityIds: string[]
}

/** One card in the email. */
export interface WelcomePick {
  id: string
  name: { en: string; es: string }
  /** Short line under the name: cuisine / area, or the activity's summary. */
  meta: { en: string; es: string }
  imageUrl: string | null
  url: string
}

export interface WelcomePicks {
  restaurants: WelcomePick[]
  activities: WelcomePick[]
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

const AREA: Record<string, { en: string; es: string }> = {
  'altos-de-chavon': { en: 'Altos de Chavón', es: 'Altos de Chavón' },
  marina: { en: 'La Marina', es: 'La Marina' },
  hotel: { en: 'Hotel Casa de Campo', es: 'Hotel Casa de Campo' },
  'golf-club': { en: 'Golf Club', es: 'Club de Golf' },
  'beach-club': { en: 'Minitas Beach', es: 'Playa Minitas' },
}

const CUISINE_ES: Record<string, string> = {
  italian: 'Italiana', mediterranean: 'Mediterránea', caribbean: 'Caribeña', dominican: 'Dominicana',
  asian: 'Asiática', japanese: 'Japonesa', mexican: 'Mexicana', american: 'Americana',
  international: 'Internacional', seafood: 'Mariscos', steakhouse: 'Carnes', french: 'Francesa',
  spanish: 'Española', fusion: 'Fusión',
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')

export async function getWelcomePickIds(): Promise<WelcomePickIds> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: WELCOME_PICKS_KEY } })
    const v = (row?.value ?? {}) as Partial<WelcomePickIds>
    return {
      restaurantIds: Array.isArray(v.restaurantIds) ? v.restaurantIds.slice(0, WELCOME_PICKS_MAX) : [],
      activityIds: Array.isArray(v.activityIds) ? v.activityIds.slice(0, WELCOME_PICKS_MAX) : [],
    }
  } catch (err) {
    console.error('[welcomePicks] read failed', err)
    return { restaurantIds: [], activityIds: [] }
  }
}

const RESTAURANT = `{ _id, name_en, name_es, "slug": slug.current, area, cuisine, "image": media.featuredImage }`
const ACTIVITY = `{ _id, name_en, name_es, summary_en, summary_es, image }`
const LIVE_RESTAURANT = `_type == "restaurant" && status == "published" && isActive != false && !(_id in path("drafts.**"))`
const LIVE_ACTIVITY = `_type == "activity" && isActive != false && defined(group) && !(_id in path("drafts.**"))`

/** Everything an admin can pick from, for the picker. */
export async function getWelcomePickOptions() {
  return client.fetch<{
    restaurants: { _id: string; name_en: string; area?: string; featured?: boolean }[]
    activities: { _id: string; name_en: string; group?: string }[]
  }>(
    `{
      "restaurants": *[${LIVE_RESTAURANT}] | order(name_en asc){ _id, name_en, area, featured },
      "activities": *[${LIVE_ACTIVITY}] | order(name_en asc){ _id, name_en, "group": group->name_en }
    }`
  )
}

/** The cards for the email, in the order they were picked. Never throws. */
export async function getWelcomePicks(): Promise<WelcomePicks> {
  try {
    const ids = await getWelcomePickIds()
    const d = await client.fetch(
      `{
        "restaurants": select(
          count($r) > 0 => *[${LIVE_RESTAURANT} && _id in $r]${RESTAURANT},
          *[${LIVE_RESTAURANT} && featured == true] | order(coalesce(order, 999) asc, name_en asc)[0...3]${RESTAURANT}
        ),
        "activities": select(
          count($a) > 0 => *[${LIVE_ACTIVITY} && _id in $a]${ACTIVITY},
          *[${LIVE_ACTIVITY}] | order(group->order asc, coalesce(order, 999) asc)[0...3]${ACTIVITY}
        )
      }`,
      { r: ids.restaurantIds, a: ids.activityIds }
    )
    // Keep the admin's order (GROQ `in` doesn't).
    const byPick = <T extends { _id: string }>(rows: T[], order: string[]) =>
      order.length ? order.map((id) => rows.find((x) => x._id === id)).filter((x): x is T => Boolean(x)) : rows
    const img = (i: any) => (i?.asset ? urlFor(i).width(240).height(240).fit('crop').quality(75).url() : null)

    return {
      restaurants: byPick(d.restaurants ?? [], ids.restaurantIds).map((r: any) => {
        const area = AREA[r.area]
        const cuisines: string[] = (r.cuisine ?? []).slice(0, 2)
        const cuisine = cuisines.map(cap).join(' · ')
        const cuisineEs = cuisines.map((c) => CUISINE_ES[c] ?? cap(c)).join(' · ')
        return {
          id: r._id,
          name: { en: r.name_en?.trim() ?? '', es: (r.name_es || r.name_en)?.trim() ?? '' },
          meta: {
            en: [cuisine, area?.en].filter(Boolean).join(' — '),
            es: [cuisineEs, area?.es].filter(Boolean).join(' — '),
          },
          imageUrl: img(r.image),
          url: r.slug ? `${SITE}/restaurants/${r.slug}` : `${SITE}/restaurants`,
        }
      }),
      activities: byPick(d.activities ?? [], ids.activityIds).map((a: any) => ({
        id: a._id,
        name: { en: a.name_en?.trim() ?? '', es: (a.name_es || a.name_en)?.trim() ?? '' },
        meta: { en: a.summary_en ?? '', es: a.summary_es || a.summary_en || '' },
        imageUrl: img(a.image),
        url: `${SITE}/info/activities`,
      })),
    }
  } catch (err) {
    console.error('[welcomePicks] failed', err)
    return { restaurants: [], activities: [] }
  }
}
