'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'

interface CoursesClientProps {
  courses: any[]
  recommendations: any[]
}

const DIFFICULTY_LABELS: Record<string, { en: string; es: string }> = {
  beginner: { en: 'Beginner', es: 'Principiante' },
  intermediate: { en: 'Intermediate', es: 'Intermedio' },
  advanced: { en: 'Advanced', es: 'Avanzado' },
  professional: { en: 'Professional', es: 'Profesional' },
}

export default function CoursesClient({ courses, recommendations }: CoursesClientProps) {
  const { locale, t } = useLocale()

  const featuredCourses = courses.filter((course: any) => course.featured)
  const regularCourses = courses.filter((course: any) => !course.featured)

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero — editorial style, matches /about and /services/concierge. */}
      <section className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-6">
            {t({ en: 'Golf', es: 'Golf' })}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-stone-900 leading-[1.1] tracking-tight max-w-4xl">
            {t({ en: 'Championship rounds, ', es: 'Vueltas de campeonato, ' })}
            <span className="italic text-stone-700">
              {t({ en: 'walking distance.', es: 'a pasos de casa.' })}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 leading-relaxed font-light mt-8 max-w-3xl">
            {t({
              en: 'Casa de Campo is home to three of the Caribbean\'s most celebrated courses. Tee times, caddies, and lessons — all arranged by us.',
              es: 'Casa de Campo alberga tres de los campos más reconocidos del Caribe. Tee times, caddies y lecciones — todo lo coordinamos nosotros.',
            })}
          </p>
        </div>
      </section>

      {/* Featured Courses — large two-column cards */}
      {featuredCourses.length > 0 && (
        <section className="container mx-auto px-4 py-16 sm:py-20 max-w-7xl">
          <div className="space-y-8">
            {featuredCourses.map((course, idx) => (
              <FeaturedCourseCard
                key={course._id}
                course={course}
                locale={locale}
                reverse={idx % 2 === 1}
              />
            ))}
          </div>

          {recommendations.length > 0 && (
            <div className="max-w-4xl mx-auto mt-16 space-y-8">
              {recommendations.map((rec: any) => (
                <LeticiaRecommendation key={rec._id} recommendation={rec} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* All Courses */}
      {regularCourses.length > 0 && (
        <section className="container mx-auto px-4 py-16 sm:py-20 max-w-7xl">
          <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-2 leading-tight">
            {t({ en: 'All courses', es: 'Todos los campos' })}
          </h2>
          <div className="h-px bg-stone-200 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                locale={locale}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/**
 * Featured course — wide split-layout card with image + content.
 * Reversed every other one for visual rhythm.
 */
function FeaturedCourseCard({
  course,
  locale,
  reverse = false,
}: {
  course: any
  locale: string
  reverse?: boolean
}) {
  const name = locale === 'en' ? course.name_en : course.name_es
  const summary = locale === 'en' ? course.summary_en : course.summary_es
  const highlights = locale === 'en' ? course.highlights_en : course.highlights_es

  const difficulty = course.courseDetails?.difficulty
  const difficultyLabel = difficulty
    ? DIFFICULTY_LABELS[difficulty]?.[locale as 'en' | 'es']
    : null

  return (
    <article className="group bg-white border border-stone-200 rounded-xs overflow-hidden transition-all hover:border-stone-400">
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
        <div className={`relative aspect-[5/4] lg:aspect-auto bg-stone-100 overflow-hidden ${reverse ? 'lg:col-start-2' : ''}`}>
          {course.media?.images?.[0] && (
            <Image
              src={urlFor(course.media.images[0]).width(900).height(720).url()}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
            {locale === 'en' ? 'Featured course' : 'Campo destacado'}
          </p>
          <h3 className="text-3xl lg:text-4xl font-light text-stone-900 leading-tight tracking-tight mb-4">
            {name}
          </h3>
          {summary && (
            <p className="text-base text-stone-600 font-light leading-relaxed mb-6">
              {summary}
            </p>
          )}

          {/* Course stats — minimal numerical row, no card boxes */}
          {(course.courseDetails?.holes ||
            course.courseDetails?.par ||
            difficultyLabel) && (
            <dl className="grid grid-cols-3 gap-6 border-y border-stone-200 py-5 mb-6">
              {course.courseDetails?.holes && (
                <Stat
                  label={locale === 'en' ? 'Holes' : 'Hoyos'}
                  value={course.courseDetails.holes}
                />
              )}
              {course.courseDetails?.par && (
                <Stat
                  label="Par"
                  value={course.courseDetails.par}
                />
              )}
              {difficultyLabel && (
                <Stat
                  label={locale === 'en' ? 'Level' : 'Nivel'}
                  value={difficultyLabel}
                />
              )}
            </dl>
          )}

          {highlights && highlights.length > 0 && (
            <ul className="space-y-2 mb-8">
              {highlights.slice(0, 3).map((highlight: string, index: number) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-stone-700 font-light leading-relaxed"
                >
                  <span className="mt-2 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-stone-900 transition-colors"
            >
              {locale === 'en' ? 'View course' : 'Ver campo'}
            </Link>
            {course.contact?.bookingUrl && (
              <a
                href={course.contact.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-800 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
              >
                {locale === 'en' ? 'Book tee time' : 'Reservar tee time'}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * Compact course card. Image on top, lean meta below. Whole card is one tap target.
 */
function CourseCard({ course, locale }: { course: any; locale: string }) {
  const name = locale === 'en' ? course.name_en : course.name_es
  const summary = locale === 'en' ? course.summary_en : course.summary_es

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block bg-white border border-stone-200 rounded-xs overflow-hidden transition-all hover:border-stone-400"
    >
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {course.media?.images?.[0] && (
          <Image
            src={urlFor(course.media.images[0]).width(600).height(450).url()}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-light text-stone-900 leading-tight tracking-tight mb-2">
          {name}
        </h3>
        {summary && (
          <p className="text-sm text-stone-600 font-light leading-relaxed line-clamp-2 mb-4">
            {summary}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-stone-500 font-light tracking-wide">
          {course.courseDetails?.holes && (
            <span>{course.courseDetails.holes} {locale === 'en' ? 'holes' : 'hoyos'}</span>
          )}
          {course.courseDetails?.par && <span>Par {course.courseDetails.par}</span>}
        </div>
      </div>
    </Link>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-2xl font-light text-stone-900 tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mt-1">
        {label}
      </div>
    </div>
  )
}
