import Hero, { type HeroBackground } from '@/components/Hero'
import PropertyRail from '@/components/PropertyRail'
import CollectionsRail from '@/components/CollectionsRail'
import HomepageMediaSection from '@/components/HomepageMediaSection'
import EstateBand from '@/components/EstateBand'
import CTASection from '@/components/CTASection'
import { searchProperties, getPublicCollections } from '@/lib/sanity/queries'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

async function getProperties() {
  try {
    const result = await searchProperties({ limit: 8 })
    return result.properties || []
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  }
}

/** Editor-controlled hero background from the Homepage Media config. */
async function getHeroBackground(): Promise<HeroBackground | null> {
  try {
    // Target the singleton by id — the Studio "Homepage Media" doc. There can
    // be more than one doc of this type, so filtering by _type alone is wrong.
    const cfg = await client.fetch(
      `*[_id == "homepageMediaConfig"][0]{ heroMediaType, heroImages, heroVideoUrl, heroOverlay }`
    )
    if (!cfg) return null
    return {
      type: cfg.heroMediaType === 'video' ? 'video' : 'image',
      images: (cfg.heroImages ?? [])
        .filter((i: any) => i?.asset)
        .map((i: any) => urlFor(i).width(2000).quality(80).url()),
      videoUrl: cfg.heroVideoUrl ?? null,
      overlay: typeof cfg.heroOverlay === 'number' ? cfg.heroOverlay : 20,
    }
  } catch (err) {
    console.error('Error fetching hero background:', err)
    return null
  }
}

export default async function Home() {
  const [properties, heroBackground, publicCollections] = await Promise.all([
    getProperties(),
    getHeroBackground(),
    getPublicCollections(6),
  ])
  
  // Filter properties by theme for different rails
  const featuredProperties = properties.filter((p: any) => p.isFeatured)
  const beachfrontProperties = properties.filter((p: any) => 
    p.themes?.includes('beachfront') || p.hasBeachAccess
  )
  const golfProperties = properties.filter((p: any) => 
    p.themes?.includes('golf') || p.hasGolfCart
  )
  const familyProperties = properties.filter((p: any) => 
    p.themes?.includes('family') || p.bedrooms >= 3
  )

  return (
    <main>
      {/* Hero Section */}
      <Hero background={heroBackground} />

      {/* All Properties Section (showing your single listing) */}
      {properties.length > 0 && (
        <PropertyRail
          title={{ 
            en: 'Available Properties', 
            es: 'Propiedades Disponibles' 
          }}
          subtitle={{ 
            en: 'Discover our exclusive selection', 
            es: 'Descubre nuestra selección exclusiva' 
          }}
          properties={properties}
          viewAllLink="/search"
        />
      )}

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <PropertyRail
          title={{ 
            en: 'Featured Properties', 
            es: 'Propiedades Destacadas' 
          }}
          subtitle={{ 
            en: 'Hand-picked selections for you', 
            es: 'Selecciones elegidas para ti' 
          }}
          properties={featuredProperties}
          viewAllLink="/search?featured=true"
          className="bg-sand/40"
        />
      )}

      {/* Beachfront Properties */}
      {beachfrontProperties.length > 0 && (
        <PropertyRail
          title={{ 
            en: 'Beachfront Paradise', 
            es: 'Paraíso Frente al Mar' 
          }}
          subtitle={{ 
            en: 'Wake up to ocean views', 
            es: 'Despierta con vistas al océano' 
          }}
          properties={beachfrontProperties}
          viewAllLink="/search?theme=beachfront"
        />
      )}

      {/* Curated public collections */}
      <CollectionsRail
        collections={publicCollections}
        title={{ en: 'Curated collections', es: 'Colecciones curadas' }}
        subtitle={{ en: 'Handpicked by Leticia', es: 'Elegidas por Leticia' }}
        className="bg-sand/40"
      />

      {/* The resort — editorial split band */}
      <EstateBand imageUrl={heroBackground?.images?.[1] ?? heroBackground?.images?.[0] ?? null} />

      {/* Featured Media Gallery */}
      <HomepageMediaSection />

      {/* Golf Properties */}
      {golfProperties.length > 0 && (
        <PropertyRail
          title={{ 
            en: 'Golf', 
            es: 'Golf' 
          }}
          subtitle={{ 
            en: 'Properties with golf course access', 
            es: 'Propiedades con acceso al campo de golf' 
          }}
          properties={golfProperties}
          viewAllLink="/search?theme=golf"
          className=""
        />
      )}

      {/* Family Properties */}
      {familyProperties.length > 0 && (
        <PropertyRail
          title={{ 
            en: 'Perfect for Families', 
            es: 'Perfecto para Familias' 
          }}
          subtitle={{ 
            en: 'Spacious homes for the whole family', 
            es: 'Hogares espaciosos para toda la familia' 
          }}
          properties={familyProperties}
          viewAllLink="/search?theme=family"
        />
      )}

      {/* CTA Section */}
      <CTASection />
    </main>
  )
}
