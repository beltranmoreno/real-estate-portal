import { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import CoursesClient from './CoursesClient'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'
import { getPageHero } from '@/lib/pageHero'
import { GOLF_PAGE_ID } from '@/sanity/lib/golfPageDefaults'

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
    "mapsUrl": location.googleMapsUrl,
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
    next: { revalidate: SANITY_REVALIDATE }
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
    next: { revalidate: SANITY_REVALIDATE }
  })

  return recommendations
}

async function getGolfPage() {
  try {
    const d = await client.fetch(`*[_id == $id][0]`, { id: GOLF_PAGE_ID }, { next: { revalidate: SANITY_REVALIDATE } })
    return {
      about: {
        eyebrow: { en: d?.aboutEyebrow_en, es: d?.aboutEyebrow_es },
        title: { en: d?.aboutTitle_en, es: d?.aboutTitle_es },
        body: { en: d?.aboutBody_en, es: d?.aboutBody_es },
      },
    }
  } catch (err) {
    console.error('[courses] golf page fetch failed', err)
    return null
  }
}

export default async function CoursesPage() {
  const [courses, recommendations, hero, page] = await Promise.all([
    getGolfCourses(),
    getGolfRecommendations(),
    getPageHero('golf'),
    getGolfPage(),
  ])

  return (
    <CoursesClient
      courses={courses}
      recommendations={recommendations}
      hero={hero}
      page={page}
    />
  )
}