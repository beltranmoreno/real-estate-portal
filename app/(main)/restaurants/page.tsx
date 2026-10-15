import { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import RestaurantsClient from './RestaurantsClient'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'

export const metadata: Metadata = {
  title: 'Restaurants | Casa de Campo Resort',
  description: 'Discover exceptional dining at Casa de Campo Resort. From beachfront casual to fine dining, experience the best restaurants in the Dominican Republic.',
  openGraph: {
    title: 'Restaurants | Casa de Campo Resort',
    description: 'Discover exceptional dining at Casa de Campo Resort. From beachfront casual to fine dining, experience the best restaurants.',
    type: 'website'
  }
}

async function getRestaurants() {
  const query = `*[_type == "restaurant" && status == "published"] | order(featured desc, area asc, order asc, name_en asc) {
    _id,
    name_en,
    name_es,
    "slug": slug.current,
    "venueType": coalesce(venueType, "restaurant"),
    area,
    cuisine,
    vibes,
    summary_en,
    summary_es,
    highlights_en,
    highlights_es,
    "featuredImage": media.featuredImage,
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
    featured,
    order
  }`

  const restaurants = await client.fetch(query, {}, {
    next: { revalidate: SANITY_REVALIDATE }
  })

  return restaurants
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants()
  
  return <RestaurantsClient restaurants={restaurants} />
}