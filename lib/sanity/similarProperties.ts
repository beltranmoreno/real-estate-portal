import { client } from '@/sanity/lib/client'

export interface SimilarTo {
  /** Houses never to suggest (the one being viewed, or those already inquired about). */
  excludeIds: string[]
  listingType?: 'rental' | 'sale' | 'both' | string | null
  areaRef?: string | null
  bedrooms?: number | null
  themes?: string[] | null
}

/**
 * Houses like a given one, each at most once. Candidates share the listing
 * side (rent / sale; "both" matches either) and are ranked here: same area
 * first, then bedrooms within ±1, then shared themes. Used by the property
 * page's "Similar houses" rail and the inquiry confirmation email.
 */
export async function getSimilarProperties(to: SimilarTo, limit = 8) {
  const types =
    to.listingType === 'sale' ? ['sale', 'both'] : to.listingType === 'rental' ? ['rental', 'both'] : ['rental', 'sale', 'both']

  const query = `*[_type == "property" && status == "active" && !(_id in $exclude) && pricing.type in $types] {
    _id,
    "slug": slug.current,
    title_es,
    title_en,
    shortDescription_es,
    shortDescription_en,
    themes,
    isFeatured,
    mainImage,
    "gallery": gallery[0...3],
    "photoCount": count(gallery) + 1,
    "areaRef": location.area._ref,
    "area": location.area->{ title_es, title_en, "slug": slug.current },
    "bedrooms": amenities.bedrooms,
    "bathrooms": amenities.bathrooms,
    "maxGuests": amenities.maxGuests,
    "hasGolfCart": amenities.hasGolfCart,
    "hasPool": amenities.hasPool,
    "isBeachfront": location.isBeachfront,
    "isGolfCourse": location.isGolfCourse,
    "listingType": pricing.type,
    "nightlyRate": pricing.rentalPricing.nightlyRate,
    "salePrice": pricing.salePricing.salePrice,
    "priceOnRequest": pricing.rentalPricing.priceOnRequest || pricing.salePricing.priceOnRequest
  }`

  try {
    const candidates: any[] = await client.fetch(query, { exclude: to.excludeIds, types })
    const themes = new Set<string>(to.themes ?? [])

    const score = (p: any) => {
      let s = 0
      if (to.areaRef && p.areaRef === to.areaRef) s += 3
      if (typeof to.bedrooms === 'number' && typeof p.bedrooms === 'number') {
        const diff = Math.abs(p.bedrooms - to.bedrooms)
        if (diff === 0) s += 2
        else if (diff === 1) s += 1
      }
      s += Math.min(2, (p.themes ?? []).filter((th: string) => themes.has(th)).length)
      return s
    }

    return candidates
      .map((p) => ({ p, s: score(p) }))
      .sort((a, b) => b.s - a.s || Number(!!b.p.isFeatured) - Number(!!a.p.isFeatured))
      .slice(0, limit)
      .map(({ p }) => p)
  } catch (error) {
    console.error('Error fetching similar properties:', error)
    return []
  }
}
