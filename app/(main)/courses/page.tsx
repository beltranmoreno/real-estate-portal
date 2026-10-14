import { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import type { HeroBackground } from '@/components/Hero'
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

export interface CoursesHeroConfig {
  background: HeroBackground | null
  eyebrow?: { en?: string; es?: string }
  heading?: { en?: string; es?: string }
  subheading?: { en?: string; es?: string }
}

async function getCoursesHeroConfig(): Promise<CoursesHeroConfig | null> {
  try {
    // Target the singleton by id — the Studio "Golf Page" doc.
    const cfg = await client.fetch(
      `*[_id == "coursesPageConfig"][0]{
        heroMediaType, heroImages, heroVideoUrl, heroOverlay,
        eyebrow_en, eyebrow_es, heading_en, heading_es, subheading_en, subheading_es
      }`,
      {},
      { next: { revalidate: 3600 } }
    )
    if (!cfg) return null

    const mediaType = cfg.heroMediaType
    const background: HeroBackground | null =
      mediaType === 'image' || mediaType === 'video'
        ? {
            type: mediaType === 'video' ? 'video' : 'image',
            images: (cfg.heroImages ?? [])
              .filter((i: any) => i?.asset)
              .map((i: any) => urlFor(i).width(2000).quality(80).url()),
            videoUrl: cfg.heroVideoUrl ?? null,
            overlay: typeof cfg.heroOverlay === 'number' ? cfg.heroOverlay : 35,
          }
        : null

    return {
      background,
      eyebrow: { en: cfg.eyebrow_en, es: cfg.eyebrow_es },
      heading: { en: cfg.heading_en, es: cfg.heading_es },
      subheading: { en: cfg.subheading_en, es: cfg.subheading_es },
    }
  } catch (err) {
    console.error('Error fetching courses hero config:', err)
    return null
  }
}

export default async function CoursesPage() {
  const [courses, recommendations, heroConfig] = await Promise.all([
    getGolfCourses(),
    getGolfRecommendations(),
    getCoursesHeroConfig(),
  ])

  return (
    <CoursesClient
      courses={courses}
      recommendations={recommendations}
      heroConfig={heroConfig}
    />
  )
}