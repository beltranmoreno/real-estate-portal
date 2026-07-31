import { NextResponse } from 'next/server'
import { client as sanityClient } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

/**
 * GET /api/map/attractions
 *
 * Public read-only list of map pins for the property maps, merged from two
 * sources: curated `attraction` landmarks and published `restaurant` docs
 * that have coordinates. Each pin gets a display `group` (restaurants / beach
 * / golf / activities / poi) that drives its colour and the toggle controls.
 * Edge-cached — changes rarely.
 */
export const revalidate = 3600

// attraction.category → toggle group.
const GROUP_BY_CATEGORY: Record<string, string> = {
  dining: 'restaurants',
  beach_club: 'beach',
  golf: 'golf',
  activity: 'activities',
  marina: 'poi',
  culture: 'poi',
  shopping: 'poi',
  airport: 'poi',
  other: 'poi',
}

const ATTRACTIONS_QUERY = `*[_type == "attraction" && isActive != false
  && defined(coordinates.lat) && defined(coordinates.lng)]
  | order(category asc, order asc, name_en asc){
    _id, name_en, name_es, category,
    "lat": coordinates.lat, "lng": coordinates.lng,
    shortDescription_en, shortDescription_es, image, link
  }`

const RESTAURANTS_QUERY = `*[_type == "restaurant" && status == "published"
  && defined(contact.coordinates.lat) && defined(contact.coordinates.lng)]
  | order(name_en asc){
    _id, name_en, name_es,
    "lat": contact.coordinates.lat, "lng": contact.coordinates.lng,
    summary_en, summary_es,
    "image": media.featuredImage,
    "link": coalesce(contact.reservationUrl, contact.website)
  }`

function img(image: any): string | null {
  return image?.asset ? urlFor(image).width(320).height(180).fit('crop').url() : null
}

export async function GET() {
  try {
    const [attractions, restaurants] = await Promise.all([
      (sanityClient.fetch as unknown as (q: string) => Promise<any[]>)(
        ATTRACTIONS_QUERY
      ),
      (sanityClient.fetch as unknown as (q: string) => Promise<any[]>)(
        RESTAURANTS_QUERY
      ),
    ])

    const pins = [
      ...(attractions ?? []).map((r) => ({
        id: r._id,
        name_en: r.name_en ?? null,
        name_es: r.name_es ?? null,
        group: GROUP_BY_CATEGORY[r.category] ?? 'poi',
        lat: r.lat,
        lng: r.lng,
        description_en: r.shortDescription_en ?? null,
        description_es: r.shortDescription_es ?? null,
        image: img(r.image),
        link: r.link ?? null,
      })),
      ...(restaurants ?? []).map((r) => ({
        id: r._id,
        name_en: r.name_en ?? null,
        name_es: r.name_es ?? null,
        group: 'restaurants',
        lat: r.lat,
        lng: r.lng,
        description_en: r.summary_en ?? null,
        description_es: r.summary_es ?? null,
        image: img(r.image),
        link: r.link ?? null,
      })),
    ].filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')

    return NextResponse.json({ pins })
  } catch (err) {
    console.error('[api/map/attractions] failed', err)
    return NextResponse.json({ pins: [] })
  }
}
