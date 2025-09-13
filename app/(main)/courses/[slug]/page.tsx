import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { generateMetadata as createSEOMetadata, generateStructuredData } from '@/components/SEOHead'
import { LocaleContextProvider, useLocale } from '@/contexts/LocaleContext'
import { PortableText } from '@portabletext/react'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  CalendarIcon,
  StarIcon,
  PlayIcon 
} from '@heroicons/react/24/outline'

interface CoursePageProps {
  params: { slug: string }
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
    "featuredImage": media.images[0]
  }`

  return await client.fetch(query, { slug, difficulty }, {
    next: { revalidate: 3600 }
  })
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = await getGolfCourse(params.slug)
  
  if (!course) {
    return { title: 'Course Not Found' }
  }

  const locale = 'en'
  const images = course.media?.images?.[0] ? [urlFor(course.media.images[0]).width(1200).height(630).url()] : []

  return createSEOMetadata({
    seo: course.seo,
    title: locale === 'en' ? course.name_en : course.name_es,
    description: locale === 'en' ? course.summary_en : course.summary_es,
    locale,
    type: 'business.business',
    images
  })
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getGolfCourse(params.slug)

  if (!course) {
    notFound()
  }

  const relatedCourses = await getRelatedCourses(
    params.slug, 
    course.courseDetails?.difficulty || 'intermediate'
  )

  const locale = 'en'
  const structuredData = generateStructuredData(course, 'golfCourse', locale)

  return (
    <LocaleContextProvider>
      <div className="min-h-screen bg-white">
        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData)
            }}
          />
        )}

        <CourseContent course={course} relatedCourses={relatedCourses} />
      </div>
    </LocaleContextProvider>
  )
}

function CourseContent({ course, relatedCourses }: { course: any; relatedCourses: any[] }) {
  const { locale, t } = useLocale()
  
  const name = locale === 'en' ? course.name_en : course.name_es
  const summary = locale === 'en' ? course.summary_en : course.summary_es
  const highlights = locale === 'en' ? course.highlights_en : course.highlights_es
  const description = locale === 'en' ? course.description_en : course.description_es
  const address = locale === 'en' ? course.location?.address_en : course.location?.address_es

  const difficultyLabels = {
    beginner: { en: 'Beginner Friendly', es: 'Para Principiantes' },
    intermediate: { en: 'Intermediate Level', es: 'Nivel Intermedio' },
    advanced: { en: 'Advanced Challenge', es: 'Desafío Avanzado' },
    professional: { en: 'Professional Standard', es: 'Estándar Profesional' }
  }

  const difficulty = course.courseDetails?.difficulty
  const difficultyLabel = difficulty 
    ? (locale === 'en' ? difficultyLabels[difficulty]?.en : difficultyLabels[difficulty]?.es)
    : null

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px]">
        {course.media?.images?.[0] && (
          <>
            <Image
              src={urlFor(course.media.images[0]).width(1920).height(1080).url()}
              alt={name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{name}</h1>
              {summary && (
                <p className="text-xl md:text-2xl mb-6 opacity-90">{summary}</p>
              )}
              <div className="flex flex-wrap gap-4 mb-8">
                {course.courseDetails?.holes && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="font-semibold">{course.courseDetails.holes} Holes</span>
                  </div>
                )}
                {course.courseDetails?.par && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="font-semibold">Par {course.courseDetails.par}</span>
                  </div>
                )}
                {difficultyLabel && (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <span className="font-semibold">{difficultyLabel}</span>
                  </div>
                )}
              </div>
              {course.contact?.bookingUrl && (
                <a
                  href={course.contact.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  {t({ en: 'Book Tee Time', es: 'Reservar Hora de Salida' })}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {course.courseDetails?.holes && (
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <PlayIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {course.courseDetails.holes}
                    </div>
                    <div className="text-sm text-gray-600">Holes</div>
                  </div>
                )}
                {course.courseDetails?.par && (
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <StarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {course.courseDetails.par}
                    </div>
                    <div className="text-sm text-gray-600">Par</div>
                  </div>
                )}
                {course.courseDetails?.yardage && (
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {course.courseDetails.yardage.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Yards</div>
                  </div>
                )}
                {course.courseDetails?.designer && (
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600 mb-1">
                      {course.courseDetails.designer}
                    </div>
                    <div className="text-sm text-gray-600">Designer</div>
                  </div>
                )}
              </div>

              {/* Highlights */}
              {highlights && highlights.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">
                    {t({ en: 'Course Highlights', es: 'Características Destacadas' })}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highlights.map((highlight: string, index: number) => (
                      <div key={index} className="flex items-start p-4 bg-slate-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {description && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">
                    {t({ en: 'About the Course', es: 'Acerca del Campo' })}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <PortableText value={description} />
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {course.media?.images && course.media.images.length > 1 && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold mb-6">
                    {t({ en: 'Photo Gallery', es: 'Galería de Fotos' })}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {course.media.images.slice(1, 7).map((image: any, index: number) => {
                      const caption = locale === 'en' ? image.caption_en : image.caption_es
                      return (
                        <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                          <Image
                            src={urlFor(image).width(400).height(300).url()}
                            alt={caption || `Course photo ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Contact Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 sticky top-24">
                <h3 className="text-xl font-bold mb-4">
                  {t({ en: 'Course Information', es: 'Información del Campo' })}
                </h3>
                
                {address && (
                  <div className="flex items-start mb-4">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{address}</span>
                  </div>
                )}

                {course.contact?.phone && (
                  <div className="flex items-center mb-4">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a 
                      href={`tel:${course.contact.phone}`}
                      className="text-gray-600 hover:text-green-600"
                    >
                      {course.contact.phone}
                    </a>
                  </div>
                )}

                {course.contact?.email && (
                  <div className="flex items-center mb-4">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a 
                      href={`mailto:${course.contact.email}`}
                      className="text-gray-600 hover:text-green-600"
                    >
                      {course.contact.email}
                    </a>
                  </div>
                )}

                {course.contact?.website && (
                  <div className="flex items-center mb-6">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <a 
                      href={course.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-green-600"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {course.contact?.bookingUrl && (
                  <a
                    href={course.contact.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {t({ en: 'Book Tee Time', es: 'Reservar Hora' })}
                  </a>
                )}

                {/* Pricing */}
                {course.pricing?.greenFees && course.pricing.greenFees.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold mb-4">
                      {t({ en: 'Green Fees', es: 'Tarifas' })}
                    </h4>
                    <div className="space-y-2">
                      {course.pricing.greenFees.map((fee: any, index: number) => {
                        const category = locale === 'en' ? fee.category_en : fee.category_es
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{category}</span>
                            <span className="font-semibold">
                              ${fee.price} {fee.currency}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {course.amenities && course.amenities.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold mb-4">
                      {t({ en: 'Amenities', es: 'Amenidades' })}
                    </h4>
                    <div className="space-y-2">
                      {course.amenities.map((amenity: any, index: number) => {
                        const name = locale === 'en' ? amenity.name_en : amenity.name_es
                        return (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            {amenity.icon && <span className="mr-2">{amenity.icon}</span>}
                            <span>{name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t({ en: 'Similar Courses', es: 'Campos Similares' })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedCourses.map((relatedCourse) => (
                <RelatedCourseCard
                  key={relatedCourse._id}
                  course={relatedCourse}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function RelatedCourseCard({ course, locale }: { course: any; locale: string }) {
  const name = locale === 'en' ? course.name_en : course.name_es
  const summary = locale === 'en' ? course.summary_en : course.summary_es

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3]">
        {course.featuredImage && (
          <Image
            src={urlFor(course.featuredImage).width(400).height(300).url()}
            alt={name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        {summary && (
          <p className="text-gray-600 mb-4 line-clamp-2">{summary}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          {course.courseDetails?.holes && (
            <span>{course.courseDetails.holes} holes</span>
          )}
          {course.courseDetails?.par && (
            <span>Par {course.courseDetails.par}</span>
          )}
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  const query = `*[_type == "golfCourse" && status == "published"]{"slug": slug.current}`
  const courses = await client.fetch(query)

  return courses.map((course: any) => ({
    slug: course.slug
  }))
}