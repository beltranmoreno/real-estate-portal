import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createSEOMetadata, generateStructuredData } from '@/components/SEOHead'
import RestaurantDetailClient from './RestaurantDetailClient'

interface RestaurantPageProps {
  params: Promise<{ slug: string }>
}

async function getRestaurant(slug: string) {
  const query = `*[_type == "restaurant" && slug.current == $slug && status == "published"][0] {
    _id,
    name_en,
    name_es,
    "slug": slug.current,
    area,
    cuisine,
    vibes,
    summary_en,
    summary_es,
    highlights_en,
    highlights_es,
    description_en,
    description_es,
    media {
      featuredImage,
      gallery[] {
        ...,
        caption_en,
        caption_es,
        category
      },
      videos[] {
        title_en,
        title_es,
        videoUrl,
        thumbnail
      }
    },
    hours {
      schedule[] {
        day_en,
        day_es,
        openTime,
        closeTime,
        closed
      },
      specialHours_en,
      specialHours_es
    },
    contact {
      phone,
      email,
      website,
      reservationUrl,
      address_en,
      address_es,
      coordinates {
        lat,
        lng
      }
    },
    pricing {
      priceRange,
      averagePrice,
      currency
    },
    features[] {
      feature_en,
      feature_es,
      icon
    },
    seo {
      metaTitle_en,
      metaTitle_es,
      metaDescription_en,
      metaDescription_es,
      canonicalUrl,
      ogImage,
      keywords_en,
      keywords_es,
      noIndex,
      noFollow
    },
    featured,
    order,
    leticiaRecommendation {
      title_en,
      title_es,
      type,
      recommendation_en,
      recommendation_es,
      highlight_en,
      highlight_es,
      variant,
      isActive
    }
  }`

  const restaurant = await client.fetch(query, { slug }, {
    next: { revalidate: 3600 }
  })

  return restaurant
}

async function getRelatedRestaurants(slug: string, area: string, vibes: string[]) {
  const query = `*[_type == "restaurant" && slug.current != $slug && status == "published" && (area == $area || count((vibes[])[@ in $vibes]) > 0)][0...3] {
    _id,
    name_en,
    name_es,
    "slug": slug.current,
    area,
    cuisine,
    vibes,
    summary_en,
    summary_es,
    "featuredImage": media.featuredImage,
    pricing {
      priceRange
    }
  }`

  return await client.fetch(query, { slug, area, vibes }, {
    next: { revalidate: 3600 }
  })
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const { slug } = await params
  const restaurant = await getRestaurant(slug)
  
  if (!restaurant) {
    return { title: 'Restaurant Not Found' }
  }

  const locale = 'en'
  const images = restaurant.media?.featuredImage ? [restaurant.media.featuredImage.asset.url] : []

  return createSEOMetadata({
    seo: restaurant.seo,
    title: locale === 'en' ? restaurant.name_en : restaurant.name_es,
    description: locale === 'en' ? restaurant.summary_en : restaurant.summary_es,
    locale,
    type: 'website',
    images
  })
}

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { slug } = await params
  const restaurant = await getRestaurant(slug)

  if (!restaurant) {
    notFound()
  }

  const relatedRestaurants = await getRelatedRestaurants(
    slug,
    restaurant.area,
    restaurant.vibes || []
  )

  const locale = 'en'
  const structuredData = generateStructuredData(restaurant, 'restaurant', locale)

  return (
    <>
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}

      <RestaurantDetailClient 
        restaurant={restaurant} 
        relatedRestaurants={relatedRestaurants} 
      />
    </>
  )
}

export async function generateStaticParams() {
  const query = `*[_type == "restaurant" && status == "published"]{"slug": slug.current}`
  const restaurants = await client.fetch(query)

  return restaurants.map((restaurant: any) => ({
    slug: restaurant.slug
  }))
}