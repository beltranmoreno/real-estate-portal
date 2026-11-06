'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/lib/image'
import { MapsLink } from '@/components/MapsLink'

const DIFFICULTY_LABELS: Record<string, { en: string; es: string }> = {
  beginner: { en: 'Beginner', es: 'Principiante' },
  intermediate: { en: 'Intermediate', es: 'Intermedio' },
  advanced: { en: 'Advanced', es: 'Avanzado' },
  professional: { en: 'Professional', es: 'Profesional' },
}

/**
 * Course card — wide split-layout with image + content. Reversed every other
 * one for visual rhythm. Featured courses carry a "Featured course" eyebrow.
 */
export function CourseFeatureCard({
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

  const eyebrow = course.featured
    ? locale === 'en'
      ? 'Featured course'
      : 'Campo destacado'
    : course.courseDetails?.designer
      ? course.courseDetails.designer
      : locale === 'en'
        ? 'Golf course'
        : 'Campo de golf'

  return (
    <article className="group">
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
        <div className={`relative aspect-[5/4] lg:aspect-auto bg-sand overflow-hidden ${reverse ? 'lg:col-start-2' : ''}`}>
          {course.media?.images?.[0] && (
            <Image
              src={urlFor(course.media.images[0]).width(900).height(720).url()}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </div>

        <div className={`pt-6 lg:pt-0 flex flex-col justify-center ${reverse ? 'lg:pr-12' : 'lg:pl-12'}`}>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h3 className="font-display text-3xl lg:text-4xl text-ink leading-tight mb-4">
            {name}
          </h3>
          {summary && (
            <p className="text-base text-muted font-light leading-relaxed mb-6">
              {summary}
            </p>
          )}

          {/* Course stats — minimal numerical row, no card boxes */}
          {(course.courseDetails?.holes ||
            course.courseDetails?.par ||
            difficultyLabel) && (
            <dl className="grid grid-cols-3 gap-6 border-y border-line py-5 mb-6">
              {course.courseDetails?.holes && (
                <Stat
                  label={locale === 'en' ? 'Holes' : 'Hoyos'}
                  value={course.courseDetails.holes}
                />
              )}
              {course.courseDetails?.par && (
                <Stat label="Par" value={course.courseDetails.par} />
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
                  className="flex items-start gap-3 text-sm text-body-strong font-light leading-relaxed"
                >
                  <span className="mt-2 w-1 h-1 rounded-full bg-brand shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-surface text-sm font-light tracking-wide rounded-[2px] hover:bg-brand transition-colors"
            >
              {locale === 'en' ? 'View course' : 'Ver campo'}
            </Link>
            {course.contact?.bookingUrl && (
              <a
                href={course.contact.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-control-border text-ink text-sm font-light tracking-wide rounded-[2px] hover:bg-sand transition-colors"
              >
                {locale === 'en' ? 'Book tee time' : 'Reservar tee time'}
              </a>
            )}
            {course.mapsUrl && <MapsLink href={course.mapsUrl} className="ml-2" />}
          </div>
        </div>
      </div>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-serif text-2xl text-ink">{value}</div>
      <div className="text-[11px] uppercase tracking-[0.15em] text-muted-2 font-light mt-1">
        {label}
      </div>
    </div>
  )
}
