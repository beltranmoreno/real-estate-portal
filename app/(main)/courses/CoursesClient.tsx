'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'
import { PlayIcon } from '@heroicons/react/24/outline'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'

interface CoursesClientProps {
  courses: any[]
  recommendations: any[]
}

export default function CoursesClient({ courses, recommendations }: CoursesClientProps) {
  const { locale, t } = useLocale()
  
  const featuredCourses = courses.filter((course: any) => course.featured)
  const regularCourses = courses.filter((course: any) => !course.featured)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <PlayIcon className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {t({
                en: 'World-Class Golf Courses',
                es: 'Campos de Golf de Clase Mundial'
              })}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              {t({
                en: 'Experience championship golf in the heart of the Dominican Republic. Our courses offer challenging play for golfers of all skill levels.',
                es: 'Experimenta golf de campeonato en el corazón de República Dominicana. Nuestros campos ofrecen juego desafiante para golfistas de todos los niveles.'
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t({
                en: 'Featured Courses',
                es: 'Campos Destacados'
              })}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {featuredCourses.map((course) => (
                <FeaturedCourseCard
                  key={course._id}
                  course={course}
                  locale={locale}
                />
              ))}
            </div>

            {/* Leticia's Golf Recommendations */}
            {recommendations.length > 0 && (
              <div className="max-w-4xl mx-auto mt-16 space-y-8">
                {recommendations.map((rec: any) => (
                  <LeticiaRecommendation
                    key={rec._id}
                    recommendation={rec}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Courses */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t({
              en: 'All Golf Courses',
              es: 'Todos los Campos de Golf'
            })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                locale={locale}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function FeaturedCourseCard({ course, locale }: { course: any; locale: string }) {
  const name = locale === 'en' ? course.name_en : course.name_es
  const summary = locale === 'en' ? course.summary_en : course.summary_es
  const highlights = locale === 'en' ? course.highlights_en : course.highlights_es

  const difficultyLabels = {
    beginner: { en: 'Beginner', es: 'Principiante' },
    intermediate: { en: 'Intermediate', es: 'Intermedio' },
    advanced: { en: 'Advanced', es: 'Avanzado' },
    professional: { en: 'Professional', es: 'Profesional' }
  }

  const difficulty = course.courseDetails?.difficulty
  const difficultyLabel = difficulty 
    ? (locale === 'en' ? difficultyLabels[difficulty as keyof typeof difficultyLabels]?.en : difficultyLabels[difficulty as keyof typeof difficultyLabels]?.es)
    : null

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
      <div className="relative aspect-[16/10]">
        {course.media?.images?.[0] && (
          <Image
            src={urlFor(course.media.images[0]).width(600).height(375).url()}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute top-4 right-4">
          <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
            ⭐ Featured
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-light mb-3">{name}</h3>
        {summary && (
          <p className="text-gray-600 mb-4">{summary}</p>
        )}
        
        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {course.courseDetails?.holes && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {course.courseDetails.holes}
              </div>
              <div className="text-sm text-gray-600">Holes</div>
            </div>
          )}
          {course.courseDetails?.par && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {course.courseDetails.par}
              </div>
              <div className="text-sm text-gray-600">Par</div>
            </div>
          )}
        </div>

        {difficultyLabel && (
          <div className="mb-4">
            <span className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
              {difficultyLabel}
            </span>
          </div>
        )}

        {highlights && highlights.length > 0 && (
          <ul className="text-sm text-gray-600 mb-6 space-y-1">
            {highlights.slice(0, 3).map((highlight: string, index: number) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between">
          <Link
            href={`/courses/${course.slug}`}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Learn More
          </Link>
          
          {course.contact?.bookingUrl && (
            <a
              href={course.contact.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Book Tee Time
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function CourseCard({ course, locale }: { course: any; locale: string }) {
  const name = locale === 'en' ? course.name_en : course.name_es
  const summary = locale === 'en' ? course.summary_en : course.summary_es

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3]">
        {course.media?.images?.[0] && (
          <Image
            src={urlFor(course.media.images[0]).width(400).height(300).url()}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-light mb-2">{name}</h3>
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