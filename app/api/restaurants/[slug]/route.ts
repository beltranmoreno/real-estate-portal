import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export const revalidate = 3600 // Revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

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
      order
    }`

    const restaurant = await client.fetch(query, { slug })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Fetch related restaurants (same area or similar vibes)
    const relatedQuery = `*[_type == "restaurant" && slug.current != $slug && status == "published" && (area == $area || count((vibes[])[@ in $vibes]) > 0)][0...3] {
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

    const relatedRestaurants = await client.fetch(relatedQuery, {
      slug,
      area: restaurant.area,
      vibes: restaurant.vibes || []
    })

    return NextResponse.json({
      ...restaurant,
      relatedRestaurants
    })
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    )
  }
}