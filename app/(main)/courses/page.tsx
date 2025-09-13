import { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import CoursesClient from './CoursesClient'

export const metadata: Metadata = {
  title: 'Golf Courses | Casa de Campo Resort',
  description: 'Discover world-class golf courses at Casa de Campo Resort. Play on championship courses designed by legendary architects in the heart of the Dominican Republic.',
  openGraph: {
    title: 'Golf Courses | Casa de Campo Resort',
    description: 'Discover world-class golf courses at Casa de Campo Resort. Play on championship courses designed by legendary architects.',
    type: 'website'
  }
}

async function getGolfCourses() {
  const query = `*[_type == "golfCourse" && status == "published"] | order(featured desc, order asc, name_en asc) {
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
    media {
      images[] {
        asset
      }
    },
    contact {
      phone,
      email,
      website,
      bookingUrl
    },
    pricing {
      greenFees[0] {
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

  const courses = await client.fetch(query, {}, {
    next: { revalidate: 3600 }
  })

  return courses
}

async function getGolfRecommendations() {
  const query = `*[_type == "leticiaRecommendation" && type == "golf" && isActive == true] | order(order asc) {
    _id,
    title_en,
    title_es,
    type,
    recommendation_en,
    recommendation_es,
    highlight_en,
    highlight_es,
    variant
  }`

  const recommendations = await client.fetch(query, {}, {
    next: { revalidate: 3600 }
  })

  return recommendations
}

export default async function CoursesPage() {
  const courses = await getGolfCourses()
  const recommendations = await getGolfRecommendations()
  
  return <CoursesClient courses={courses} recommendations={recommendations} />
}