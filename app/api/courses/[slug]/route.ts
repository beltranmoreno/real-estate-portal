import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export const revalidate = 3600 // Revalidate every hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const query = `*[_type == "golfCourse" && slug.current == $slug && status == "published"][0] {
      _id,
      name_en,
      name_es,
      "slug": slug.current,
      location {
        address_en,
        address_es,
        coordinates {
          lat,
          lng
        }
      },
      courseDetails {
        holes,
        par,
        difficulty,
        yardage,
        designer
      },
      summary_en,
      summary_es,
      highlights_en,
      highlights_es,
      description_en,
      description_es,
      media {
        images[] {
          ...,
          caption_en,
          caption_es
        },
        videos[] {
          title_en,
          title_es,
          videoUrl,
          thumbnail
        }
      },
      contact {
        phone,
        email,
        website,
        bookingUrl
      },
      pricing {
        greenFees[] {
          category_en,
          category_es,
          price,
          currency
        }
      },
      amenities[] {
        name_en,
        name_es,
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

    const course = await client.fetch(query, { slug })

    if (!course) {
      return NextResponse.json(
        { error: 'Golf course not found' },
        { status: 404 }
      )
    }

    // Fetch related courses (other courses with similar difficulty)
    const relatedQuery = `*[_type == "golfCourse" && slug.current != $slug && status == "published" && courseDetails.difficulty == $difficulty][0...3] {
      _id,
      name_en,
      name_es,
      "slug": slug.current,
      courseDetails {
        holes,
        par,
        difficulty
      },
      summary_en,
      summary_es,
      "featuredImage": media.images[0]
    }`

    const relatedCourses = await client.fetch(relatedQuery, {
      slug,
      difficulty: course.courseDetails?.difficulty
    })

    return NextResponse.json({
      ...course,
      relatedCourses
    })
  } catch (error) {
    console.error('Error fetching golf course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch golf course' },
      { status: 500 }
    )
  }
}