'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'
import { PageHero } from '@/components/PageHero'
import type { PageHeroDoc } from '@/lib/pageHero'

interface CoursesClientProps {
  courses: any[]
  recommendations: any[]
  hero: PageHeroDoc | null
}

const DIFFICULTY_LABELS: Record<string, { en: string; es: string }> = {
  beginner: { en: 'Beginner', es: 'Principiante' },
  intermediate: { en: 'Intermediate', es: 'Intermedio' },
  advanced: { en: 'Advanced', es: 'Avanzado' },
  professional: { en: 'Professional', es: 'Profesional' },
}

export default function CoursesClient({ courses, recommendations, hero }: CoursesClientProps) {
  const { locale, t } = useLocale()

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero — editable in Studio (Page Heroes → Golf) */}
      <PageHero page="golf" doc={hero} />

      {/* Courses — every course uses the wide editorial split layout,
          alternating sides for visual rhythm. */}
      {courses.length > 0 && (
        <section className="container mx-auto px-4 py-16 sm:py-20">
          <div className="space-y-16">
            {courses.map((course, idx) => (
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

      <BeyondTheResort t={t} />
    </div>
  )
}

/**
 * Golf beyond Casa de Campo — nearby championship courses Leticia can
 * arrange tee times and transport for.
 */
function BeyondTheResort({ t }: { t: (s: { en: string; es: string }) => string }) {
  const places = [
    {
      name: 'Punta Cana',
      body: t({
        en: 'The east coast’s championship courses, an easy day trip.',
        es: 'Los campos de campeonato de la costa este, una excursión de un día.',
      }),
    },
    {
      name: 'Playa Nueva Romana',
      body: t({
        en: 'A seaside golf community a short drive west of the resort.',
        es: 'Una comunidad de golf junto al mar, a poca distancia al oeste del resort.',
      }),
    },
    {
      name: 'La Estancia',
      body: t({
        en: 'Golf in La Romana, minutes from Casa de Campo.',
        es: 'Golf en La Romana, a minutos de Casa de Campo.',
      }),
    },  
  ]

  return (
    <section className="border-t border-line bg-sand/40">
      <div className="container mx-auto px-4 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <span className="eyebrow">{t({ en: 'Beyond the resort', es: 'Más allá del resort' })}</span>
          <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight">
            {t({
              en: 'Want to play outside Casa de Campo?',
              es: '¿Quieres jugar fuera de Casa de Campo?',
            })}
          </h2>
          <p className="mt-5 text-body-strong font-light leading-relaxed measure-lede">
            {t({
              en: 'Some of the Caribbean’s best championship golf is a short drive away. Tee times and transport can be arranged for you, so all you bring is your clubs.',
              es: 'Parte del mejor golf de campeonato del Caribe está a poca distancia. Podemos organizar las salidas y el transporte, para que solo tengas que llevar tus palos.',
            })}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 bg-ink text-surface text-xs uppercase tracking-[0.16em] rounded-[2px] hover:bg-brand transition-colors"
          >
            {t({ en: 'Arrange a round', es: 'Organizar una salida' })}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <ul className="lg:col-span-7 border-t border-line">
          {places.map((p) => (
            <li key={p.name} className="py-6 border-b border-line">
              <p className="font-title text-2xl text-ink leading-tight">{p.name}</p>
              <p className="mt-1.5 text-muted font-light leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/**
 * Course card — wide split-layout with image + content. Reversed every other
 * one for visual rhythm. Featured courses carry a "Featured course" eyebrow.
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
