import Hero, { type HeroBackground } from '@/components/Hero'
import PropertyRail from '@/components/PropertyRail'
import CollectionsRail from '@/components/CollectionsRail'
import HomepageMediaSection, { type HomepageMediaImage } from '@/components/HomepageMediaSection'
import EstateBand from '@/components/EstateBand'
import ConciergeHighlights, { type ConciergeHighlight } from '@/components/ConciergeHighlights'
import ForSaleBand from '@/components/ForSaleBand'
import { ActivitiesHighlights, type HighlightActivity } from '@/components/ActivitiesHighlights'
import CTASection from '@/components/CTASection'
import { searchProperties, getPublicCollections } from '@/lib/sanity/queries'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'

/** Houses flagged "featured" in Studio: the "Leticia's picks" rail. */
async function getFeaturedProperties() {
  try {
    const result = await searchProperties({ limit: 8, featured: true })
    return result.properties || []
  } catch (error) {
    console.error('Error fetching featured properties:', error)
    return []
  }
}

/**
 * Houses by size: big ones for large families and celebrations, smaller ones
 * for a quieter stay. Houses already shown in Leticia's picks are skipped so
 * the rails don't repeat each other — unless that would leave fewer than 3.
 */
const BIG_HOUSE_MIN_BEDROOMS = 6
const SMALL_HOUSE_MAX_BEDROOMS = 4

async function getHousesBySize(excludeIds: string[]) {
  const without = (list: any[]) => {
    const rest = list.filter((p) => !excludeIds.includes(p._id))
    return rest.length >= 3 ? rest : list
  }
  try {
    const [big, small] = await Promise.all([
      searchProperties({ limit: 12, bedrooms: String(BIG_HOUSE_MIN_BEDROOMS), sortBy: 'bedrooms' }),
      searchProperties({ limit: 12, maxBedrooms: SMALL_HOUSE_MAX_BEDROOMS }),
    ])
    return {
      big: without(big.properties || []).slice(0, 8),
      small: without(small.properties || []).slice(0, 8),
    }
  } catch (error) {
    console.error('Error fetching houses by size:', error)
    return { big: [], small: [] }
  }
}

/** Active activities for the homepage "Things to do" teaser. */
async function getActivities(): Promise<HighlightActivity[]> {
  try {
    return await client.fetch(
      `*[_type == "activity" && isActive != false] | order(coalesce(order, 999) asc, name_en asc) {
        _id, name_en, name_es, category
      }`,
      {},
      { next: { revalidate: SANITY_REVALIDATE } }
    )
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}

/** Concierge services flagged "featured" in Studio, in their catalog order. */
async function getFeaturedConcierge(): Promise<ConciergeHighlight[]> {
  try {
    return await client.fetch(
      `*[_type == "conciergeService" && isActive == true && isFeatured == true && defined(slug.current)]
        | order(coalesce(order, 999) asc, name_en asc) [0...6] {
          _id,
          "slug": slug.current,
          name_en,
          name_es,
          shortDescription_en,
          shortDescription_es,
          icon
        }`,
      {},
      { next: { revalidate: SANITY_REVALIDATE } }
    )
  } catch (error) {
    console.error('Error fetching featured concierge services:', error)
    return []
  }
}

/**
 * Editor-controlled homepage media: the hero background and the carousel
 * photos, both driven by the Homepage Media config singleton.
 */
async function getHomepageMedia(): Promise<{
  heroBackground: HeroBackground | null
  carouselImages: HomepageMediaImage[]
}> {
  try {
    // Target the singleton by id — the Studio "Homepage Media" doc. There can
    // be more than one doc of this type, so filtering by _type alone is wrong.
    const cfg = await client.fetch(
      `*[_id == "homepageMediaConfig"][0]{ heroMediaType, heroImages, heroVideoUrl, heroOverlay, maxItems }`
    )

    const limit = Number.isInteger(cfg?.maxItems) ? cfg.maxItems : 12
    const carouselImages: HomepageMediaImage[] = await client.fetch(
      `*[_type == "featuredMedia" && defined(image.asset)] | order(coalesce(order, 9999) asc, _createdAt desc) [0...${limit}] {
        _id, image, "location": location->{ name_en, name_es }
      }`
    )

    const heroBackground: HeroBackground | null = cfg
      ? {
          type: cfg.heroMediaType === 'video' ? 'video' : 'image',
          images: (cfg.heroImages ?? [])
            .filter((i: any) => i?.asset)
            .map((i: any) => urlFor(i).width(2000).quality(80).url()),
          videoUrl: cfg.heroVideoUrl ?? null,
          overlay: typeof cfg.heroOverlay === 'number' ? cfg.heroOverlay : 20,
        }
      : null

    return { heroBackground, carouselImages: carouselImages ?? [] }
  } catch (err) {
    console.error('Error fetching homepage media:', err)
    return { heroBackground: null, carouselImages: [] }
  }
}

export default async function Home() {
  const [featuredProperties, { heroBackground, carouselImages }, publicCollections, conciergeServices, activities] =
    await Promise.all([
      getFeaturedProperties(),
      getHomepageMedia(),
      getPublicCollections(6),
      getFeaturedConcierge(),
      getActivities(),
    ])

  const { big: bigHouses, small: smallHouses } = await getHousesBySize(
    featuredProperties.map((p: any) => p._id)
  )

  return (
    <main>
      {/* Hero Section */}
      <Hero background={heroBackground} />

      {/* Curated public collections: the reason to book through Leticia */}
      <CollectionsRail collections={publicCollections} />

      {/* Leticia's picks — the only rail of individual houses on the page */}
      <PropertyRail
        title={{ en: 'This season', es: 'Esta temporada' }}
        subtitle={{ en: 'Leticia’s picks', es: 'Las favoritas de Leticia' }}
        properties={featuredProperties}
        viewAllLink="/search"
        className="bg-sand/40"
      />

      {/* Big houses — large families and celebrations */}
      <PropertyRail
        title={{ en: 'Room for everyone', es: 'Espacio para todos' }}
        subtitle={{ en: 'Big houses for big occasions', es: 'Casas grandes para grandes ocasiones' }}
        properties={bigHouses}
        viewAllLink={`/search?bedrooms=${BIG_HOUSE_MIN_BEDROOMS}`}
      />

      {/* Smaller houses — a quieter stay */}
      <PropertyRail
        title={{ en: 'Low-key', es: 'Sin prisas' }}
        subtitle={{ en: 'Smaller houses, slower days', es: 'Casas más pequeñas, días más tranquilos' }}
        properties={smallHouses}
        viewAllLink="/search"
        className="bg-sand/40"
      />

      {/* Concierge — what booking through Leticia includes */}
      <ConciergeHighlights services={conciergeServices} />

      {/* The resort — editorial split band */}
      <EstateBand imageUrl={heroBackground?.images?.[1] ?? heroBackground?.images?.[0] ?? null} />

      {/* Things to do — teaser for the Activities guide */}
      <ActivitiesHighlights activities={activities} />

      {/* Life at the resort — photo carousel */}
      <HomepageMediaSection images={carouselImages} />

      {/* For buyers */}
      <ForSaleBand />

      <CTASection
        eyebrow={{ en: 'Your stay', es: 'Tu estancia' }}
        title={{ en: 'Tell Leticia your dates.', es: 'Cuéntale a Leticia tus fechas.' }}
        description={{
          en: 'Who’s coming, what matters most, and anything you’d like waiting when you arrive. Leticia will come back with the houses that fit, and take care of the rest.',
          es: 'Quiénes vienen, qué es lo más importante y lo que te gustaría encontrar al llegar. Leticia te responderá con las casas que encajan y se encargará del resto.',
        }}
        primaryButton={{ text: { en: 'Inquire', es: 'Consultar' }, href: '/contact' }}
        secondaryButton={{ text: { en: 'Browse residences', es: 'Ver residencias' }, href: '/search' }}
        tertiaryLink={null}
      />
    </main>
  )
}
