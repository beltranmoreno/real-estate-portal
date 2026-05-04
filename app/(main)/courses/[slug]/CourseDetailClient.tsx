'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
import {
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'

interface CourseDetailClientProps {
  course: any
  relatedCourses: any[]
}

const DIFFICULTY_LABELS: Record<string, { en: string; es: string }> = {
  beginner: { en: 'Beginner', es: 'Principiante' },
  intermediate: { en: 'Intermediate', es: 'Intermedio' },
  advanced: { en: 'Advanced', es: 'Avanzado' },
  professional: { en: 'Professional', es: 'Profesional' },
}

export default function CourseDetailClient({ course, relatedCourses }: CourseDetailClientProps) {
  const { locale, t } = useLocale()

  const name = locale === 'en' ? course.name_en : course.name_es
  const summary = locale === 'en' ? course.summary_en : course.summary_es
  const highlights = locale === 'en' ? course.highlights_en : course.highlights_es
  const description = locale === 'en' ? course.description_en : course.description_es
  const address = locale === 'en' ? course.location?.address_en : course.location?.address_es

  const difficulty = course.courseDetails?.difficulty
  const difficultyLabel = difficulty
    ? DIFFICULTY_LABELS[difficulty]?.[locale as 'en' | 'es']
    : null

  return (
    <div className="bg-stone-50">
      {/* Hero — image with text overlay; tighter, more cinematic. */}
      <section className="relative h-[55vh] min-h-[440px]">
        {course.media?.images?.[0] && (
          <>
            <Image
              src={urlFor(course.media.images[0]).width(1920).height(1080).url()}
              alt={name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
          </>
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 max-w-7xl">
            <div className="max-w-3xl text-stone-50">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-300 mb-4">
                {t({ en: 'Golf course', es: 'Campo de golf' })}
              </p>
              <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.1] mb-4">
                {name}
              </h1>
              {summary && (
                <p className="text-lg md:text-xl text-stone-200 font-light leading-relaxed max-w-2xl">
                  {summary}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="container mx-auto px-4 py-16 sm:py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Course stats — minimal numerical row, no card boxes */}
            {(course.courseDetails?.holes ||
              course.courseDetails?.par ||
              course.courseDetails?.yardage ||
              course.courseDetails?.designer ||
              difficultyLabel) && (
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 border-y border-stone-200 py-6">
                {course.courseDetails?.holes && (
                  <Stat
                    label={locale === 'en' ? 'Holes' : 'Hoyos'}
                    value={course.courseDetails.holes}
                  />
                )}
                {course.courseDetails?.par && (
                  <Stat label="Par" value={course.courseDetails.par} />
                )}
                {course.courseDetails?.yardage && (
                  <Stat
                    label={locale === 'en' ? 'Yards' : 'Yardas'}
                    value={course.courseDetails.yardage.toLocaleString()}
                  />
                )}
                {course.courseDetails?.designer && (
                  <Stat
                    label={locale === 'en' ? 'Designer' : 'Diseñador'}
                    value={course.courseDetails.designer}
                  />
                )}
                {difficultyLabel && !course.courseDetails?.designer && (
                  <Stat
                    label={locale === 'en' ? 'Level' : 'Nivel'}
                    value={difficultyLabel}
                  />
                )}
              </dl>
            )}

            {/* Highlights — editorial list */}
            {highlights && highlights.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
                  {t({ en: 'Highlights', es: 'Destacados' })}
                </p>
                <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
                  {t({ en: 'What stands out', es: 'Lo que destaca' })}
                </h2>
                <ul className="border-t border-stone-200">
                  {highlights.map((highlight: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-4 py-4 border-b border-stone-200"
                    >
                      <span className="mt-2 w-1 h-1 rounded-full bg-stone-400 shrink-0" />
                      <span className="text-stone-700 leading-relaxed font-light">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* About — editorial prose, no card */}
            {description && (
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-3">
                  {t({ en: 'About', es: 'Acerca de' })}
                </p>
                <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
                  {t({ en: 'About this course', es: 'Acerca del campo' })}
                </h2>
                <div className="prose prose-stone prose-lg max-w-none font-light leading-relaxed prose-headings:font-light prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-900 prose-a:underline prose-a:underline-offset-4 prose-strong:font-medium prose-strong:text-stone-900">
                  <PortableText value={description} />
                </div>
              </div>
            )}

            {/* Photo Gallery */}
            {course.media?.images && course.media.images.length > 1 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
                  {t({ en: 'Gallery', es: 'Galería' })}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {course.media.images.slice(1, 7).map((image: any, index: number) => {
                    const caption = locale === 'en' ? image.caption_en : image.caption_es
                    return (
                      <div
                        key={index}
                        className="relative aspect-[4/3] overflow-hidden bg-stone-100 group"
                      >
                        <Image
                          src={urlFor(image).width(600).height(450).url()}
                          alt={caption || `Course photo ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-stone-200 rounded-xs p-6 sm:sticky sm:top-24 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
                  {t({ en: 'Course information', es: 'Información del campo' })}
                </p>

                <ul className="space-y-3 text-sm text-stone-700 font-light">
                  {address && (
                    <li className="flex items-start gap-3">
                      <MapPinIcon className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                      <span>{address}</span>
                    </li>
                  )}
                  {course.contact?.phone && (
                    <li className="flex items-center gap-3">
                      <PhoneIcon className="w-4 h-4 text-stone-400 shrink-0" />
                      <a
                        href={`tel:${course.contact.phone}`}
                        className="hover:text-stone-900 transition-colors"
                      >
                        {course.contact.phone}
                      </a>
                    </li>
                  )}
                  {course.contact?.email && (
                    <li className="flex items-center gap-3">
                      <EnvelopeIcon className="w-4 h-4 text-stone-400 shrink-0" />
                      <a
                        href={`mailto:${course.contact.email}`}
                        className="hover:text-stone-900 transition-colors break-all"
                      >
                        {course.contact.email}
                      </a>
                    </li>
                  )}
                  {course.contact?.website && (
                    <li className="flex items-center gap-3">
                      <GlobeAltIcon className="w-4 h-4 text-stone-400 shrink-0" />
                      <a
                        href={course.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-stone-900 transition-colors"
                      >
                        {locale === 'en' ? 'Visit website' : 'Visitar sitio web'}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              {course.contact?.bookingUrl && (
                <a
                  href={course.contact.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-stone-800 text-white text-sm font-light tracking-wide rounded-sm py-3 hover:bg-stone-900 transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {t({ en: 'Book tee time', es: 'Reservar tee time' })}
                </a>
              )}

              {/* Pricing */}
              {course.pricing?.greenFees && course.pricing.greenFees.length > 0 && (
                <div className="pt-4 border-t border-stone-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
                    {t({ en: 'Green fees', es: 'Tarifas' })}
                  </p>
                  <ul className="space-y-2 text-sm font-light">
                    {course.pricing.greenFees.map((fee: any, index: number) => {
                      const category = locale === 'en' ? fee.category_en : fee.category_es
                      return (
                        <li key={index} className="flex justify-between text-stone-700">
                          <span>{category}</span>
                          <span className="tabular-nums">
                            ${fee.price} {fee.currency}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Amenities */}
              {course.amenities && course.amenities.length > 0 && (
                <div className="pt-4 border-t border-stone-200">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">
                    {t({ en: 'Amenities', es: 'Amenidades' })}
                  </p>
                  <ul className="space-y-1.5 text-sm text-stone-700 font-light">
                    {course.amenities.map((amenity: any, index: number) => {
                      const aname = locale === 'en' ? amenity.name_en : amenity.name_es
                      return (
                        <li key={index} className="flex items-center gap-2">
                          {amenity.icon && <span>{amenity.icon}</span>}
                          <span>{aname}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <section className="border-t border-stone-200 bg-white">
          <div className="container mx-auto px-4 py-16 sm:py-20 max-w-7xl">
            <h2 className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight mb-2 leading-tight">
              {t({ en: 'Other courses', es: 'Otros campos' })}
            </h2>
            <div className="h-px bg-stone-200 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light mt-1">
        {label}
      </div>
    </div>
  )
}

function RelatedCourseCard({ course, locale }: { course: any; locale: string }) {
  const name = locale === 'en' ? course.name_en : course.name_es
  const summary = locale === 'en' ? course.summary_en : course.summary_es

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block bg-white border border-stone-200 rounded-xs overflow-hidden transition-all hover:border-stone-400"
    >
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {(course.featuredImage || course.media?.images?.[0]) && (
          <Image
            src={urlFor(course.featuredImage || course.media.images[0]).width(600).height(450).url()}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
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
