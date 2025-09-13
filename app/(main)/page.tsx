import Hero from '@/components/Hero'
import PropertyRail from '@/components/PropertyRail'
import HomepageMediaSection from '@/components/HomepageMediaSection'

async function getProperties() {
  try {
    // Use the search API we already created
    const response = await fetch(`/api/search?limit=8`, {
      cache: 'no-store' // For development - in production use revalidate
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch properties')
    }
    
    const data = await response.json()
    return data.properties || []
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  }
}

export default async function Home() {
  const properties = await getProperties()
  
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
      <Hero />

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
          className="bg-slate-50"
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

      {/* Featured Media Gallery */}
      <HomepageMediaSection />

      {/* Golf Properties */}
      {golfProperties.length > 0 && (
        <PropertyRail
          title={{ 
            en: 'Golf & Country Club', 
            es: 'Golf y Club de Campo' 
          }}
          subtitle={{ 
            en: 'Properties with golf course access', 
            es: 'Propiedades con acceso al campo de golf' 
          }}
          properties={golfProperties}
          viewAllLink="/search?theme=golf"
          className="bg-green-900/10"
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
      <section className="py-20 bg-gradient-to-br from-blue-900/80 to-cyan-900/80">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-light mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl mb-8 text-blue-50 max-w-2xl mx-auto">
            Let us help you discover the perfect home in the Caribbean
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/search"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse All Properties
            </a>
            <a
              href="/contact"
              className="px-8 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
