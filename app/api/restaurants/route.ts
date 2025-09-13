import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export const revalidate = 3600 // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const area = searchParams.get('area')
    const vibes = searchParams.get('vibes')?.split(',').filter(Boolean) || []
    const cuisine = searchParams.get('cuisine')?.split(',').filter(Boolean) || []
    const priceRange = searchParams.get('priceRange')

    // Build filter conditions
    let filters = ['_type == "restaurant"', 'status == "published"']
    
    if (area && area !== 'all') {
      filters.push(`area == "${area}"`)
    }
    
    if (vibes.length > 0) {
      const vibeFilters = vibes.map(vibe => `"${vibe}" in vibes`).join(' || ')
      filters.push(`(${vibeFilters})`)
    }
    
    if (cuisine.length > 0) {
      const cuisineFilters = cuisine.map(c => `"${c}" in cuisine`).join(' || ')
      filters.push(`(${cuisineFilters})`)
    }
    
    if (priceRange) {
      filters.push(`pricing.priceRange == "${priceRange}"`)
    }

    const filterQuery = filters.join(' && ')

    const query = `*[${filterQuery}] | order(featured desc, area asc, order asc, name_en asc) {
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
        address_es
      },
      pricing {
        priceRange,
        averagePrice,
        currency
      },
      featured,
      order
    }`

    const restaurants = await client.fetch(query)

    // Group restaurants by area
    const restaurantsByArea = restaurants.reduce((acc: any, restaurant: any) => {
      const restaurantArea = restaurant.area
      if (!acc[restaurantArea]) acc[restaurantArea] = []
      acc[restaurantArea].push(restaurant)
      return acc
    }, {})

    // Get available filter options
    const filtersQuery = `{
      "areas": array::unique(*[_type == "restaurant" && status == "published"].area),
      "vibes": array::unique(*[_type == "restaurant" && status == "published"].vibes[]),
      "cuisines": array::unique(*[_type == "restaurant" && status == "published"].cuisine[]),
      "priceRanges": array::unique(*[_type == "restaurant" && status == "published"].pricing.priceRange)
    }`

    const availableFilters = await client.fetch(filtersQuery)

    return NextResponse.json({
      restaurants,
      total: restaurants.length,
      groupedByArea: restaurantsByArea,
      featured: restaurants.filter((restaurant: any) => restaurant.featured),
      filters: availableFilters
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}