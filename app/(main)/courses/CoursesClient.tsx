'use client'

import { useLocale } from '@/contexts/LocaleContext'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'
import { PageHero } from '@/components/PageHero'
import type { PageHeroDoc } from '@/lib/pageHero'
import { Paragraphs } from '@/components/resort/Paragraphs'
import { CourseFeatureCard } from '@/components/golf/CourseFeatureCard'
import { GOLF_PAGE_DEFAULTS } from '@/sanity/lib/golfPageDefaults'

interface CoursesClientProps {
  courses: any[]
  recommendations: any[]
  hero: PageHeroDoc | null
  /** The Studio "Golf page" doc; empty fields use the shipped copy. */
  page: { about: { eyebrow: Bi; title: Bi; body: Bi } } | null
}

type Bi = { en?: string | null; es?: string | null }


export default function CoursesClient({ courses, recommendations, hero, page }: CoursesClientProps) {
  const { locale, t } = useLocale()
  const D = GOLF_PAGE_DEFAULTS
  // Studio value first (other language if only one is filled), then the default.
  const pick = (v: Bi | undefined, d: { en: string; es: string }) =>
    t({ en: v?.en?.trim() || v?.es?.trim() || d.en, es: v?.es?.trim() || v?.en?.trim() || d.es })
  const about = page?.about
  const [lead, ...rest] = courses

  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero — editable in Studio (Page Heroes → Golf) */}
      <PageHero page="golf" doc={hero} />

      {/* The lead course (first in Studio order — Teeth of the Dog) right
          under the hero, then the About section, then the other courses. */}
      {lead && (
        <section className="container mx-auto px-4 py-16 sm:py-20">
          <CourseFeatureCard course={lead} locale={locale} />
        </section>
      )}

      {/* About — editable in Studio (Page Heroes → Golf page · About) */}
      <section className="container mx-auto px-4 py-20 lg:py-28 border-t border-line">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="eyebrow">{pick(about?.eyebrow, D.about.eyebrow)}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">
              {pick(about?.title, D.about.title)}
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-9 space-y-4 text-lg text-body-strong font-light leading-relaxed measure-body">
            <Paragraphs text={pick(about?.body, D.about.body)} />
          </div>
        </div>
      </section>

      {/* Other courses — the wide split layout, alternating sides. */}
      {(rest.length > 0 || recommendations.length > 0) && (
        <section className="border-t border-line">
          <div className="container mx-auto px-4 py-16 sm:py-20">
            {rest.length > 0 && (
              <div className="space-y-16">
                {rest.map((course, idx) => (
                  <CourseFeatureCard
                    key={course._id}
                    course={course}
                    locale={locale}
                    reverse={idx % 2 === 0}
                  />
                ))}
              </div>
            )}

            {recommendations.length > 0 && (
              <div className={`max-w-4xl mx-auto space-y-8 ${rest.length > 0 ? 'mt-16' : ''}`}>
                {recommendations.map((rec: any) => (
                  <LeticiaRecommendation key={rec._id} recommendation={rec} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
