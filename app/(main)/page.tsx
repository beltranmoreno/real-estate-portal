import Hero, { type HeroBackground } from '@/components/Hero'
import PropertyRail from '@/components/PropertyRail'
import CollectionsRail from '@/components/CollectionsRail'
import HomepageMediaSection, { type HomepageMediaImage } from '@/components/HomepageMediaSection'
import EstateBand from '@/components/EstateBand'
import ConciergeHighlights, { type ConciergeHighlight } from '@/components/ConciergeHighlights'
import ForSaleBand from '@/components/ForSaleBand'
import CTASection from '@/components/CTASection'
import { searchProperties, getPublicCollections } from '@/lib/sanity/queries'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

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
      { next: { revalidate: 3600 } }
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
  const [featuredProperties, { heroBackground, carouselImages }, publicCollections, conciergeServices] =
    await Promise.all([
      getFeaturedProperties(),
      getHomepageMedia(),
      getPublicCollections(6),
      getFeaturedConcierge(),
    ])

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

      {/* Concierge — what booking through Leticia includes */}
      <ConciergeHighlights services={conciergeServices} />

      {/* The resort — editorial split band */}
      <EstateBand imageUrl={heroBackground?.images?.[1] ?? heroBackground?.images?.[0] ?? null} />

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
        primaryButton={{ text: { en: 'Enquire', es: 'Consultar' }, href: '/contact' }}
        secondaryButton={{ text: { en: 'Browse residences', es: 'Ver residencias' }, href: '/search' }}
        tertiaryLink={null}
      />
    </main>
  )
}
