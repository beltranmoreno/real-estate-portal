import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export const revalidate = 3600 // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const query = `*[_type == "golfCourse" && status == "published"] | order(order asc, name_en asc) {
      _id,
      name_en,
      name_es,
      "slug": slug.current,
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
      "featuredImage": media.images[0],
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
      featured,
      order
    }`

    const courses = await client.fetch(query)

    // Group courses by difficulty for easier filtering on frontend
    const coursesByDifficulty = courses.reduce((acc: any, course: any) => {
      const difficulty = course.courseDetails?.difficulty || 'intermediate'
      if (!acc[difficulty]) acc[difficulty] = []
      acc[difficulty].push(course)
      return acc
    }, {})

    return NextResponse.json({
      courses,
      total: courses.length,
      groupedByDifficulty: coursesByDifficulty,
      featured: courses.filter((course: any) => course.featured)
    })
  } catch (error) {
    console.error('Error fetching golf courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch golf courses' },
      { status: 500 }
    )
  }
}