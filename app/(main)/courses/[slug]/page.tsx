import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createSEOMetadata, generateStructuredData } from '@/components/SEOHead'
import { urlFor } from '@/sanity/lib/image'
import CourseDetailClient from './CourseDetailClient'

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

async function getGolfCourse(slug: string) {
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
        asset,
        caption_en,
        caption_es
      },
      videos[] {
        title_en,
        title_es,
        videoUrl,
        thumbnail {
          asset
        }
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

  const course = await client.fetch(query, { slug }, {
    next: { revalidate: 3600 }
  })

  return course
}

async function getRelatedCourses(slug: string, difficulty: string) {
  const query = `*[_type == "golfCourse" && slug.current != $slug && status == "published" && courseDetails.difficulty == $difficulty][0...3] {
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
    "featuredImage": media.images[0] {
      asset
    }
  }`

  return await client.fetch(query, { slug, difficulty }, {
    next: { revalidate: 3600 }
  })
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getGolfCourse(slug)
  
  if (!course) {
    return { title: 'Course Not Found' }
  }

  const locale = 'en'
  const images = course.media?.images?.[0] ? [urlFor(course.media.images[0]).width(1200).height(630).url()] : []

  return createSEOMetadata({
    seo: course.seo,
    title: locale === 'en' ? (`${course.name_en} | Leticia Coudray Real Estate`) : (`${course.name_es} | Leticia Coudray Real Estate`),
    description: locale === 'en' ? course.summary_en : course.summary_es,
    locale,
    type: 'website',
    images
  })
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const course = await getGolfCourse(slug)

  if (!course) {
    notFound()
  }

  const relatedCourses = await getRelatedCourses(
    slug, 
    course.courseDetails?.difficulty || 'intermediate'
  )

  const locale = 'en'
  const structuredData = generateStructuredData(course, 'golfCourse', locale)

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

      <CourseDetailClient course={course} relatedCourses={relatedCourses} />
    </>
  )
}

export async function generateStaticParams() {
  const query = `*[_type == "golfCourse" && status == "published"]{"slug": slug.current}`
  const courses = await client.fetch(query)

  return courses.map((course: any) => ({
    slug: course.slug
  }))
}