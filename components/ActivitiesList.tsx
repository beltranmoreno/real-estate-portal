'use client'

import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import { Paragraphs } from '@/components/resort/Paragraphs'
import { MapsLink } from '@/components/MapsLink'
import type { ActivityGroup } from '@/lib/activities'

/**
 * The Activities page body: one section per Activity group (Studio → Local
 * Guide → Activity groups), each with its label, title and intro, then its
 * activities as cards. "#experiences" is the hero button's target; each
 * group is reachable at "#<group slug>".
 */
export function ActivitiesList({ groups }: { groups: ActivityGroup[] }) {
  const { locale } = useLocale()
  // Studio text in the visitor's language, falling back to the other one.
  const pick = (a: any, f: string) =>
    ((locale === 'es' ? a?.[`${f}_es`] : a?.[`${f}_en`]) || a?.[`${f}_en`] || a?.[`${f}_es`] || '').trim()

  if (groups.length === 0) return null

  return (
    <div id="experiences" className="scroll-mt-24">
      {groups.map((g, index) => {
        const title = pick(g, 'title')
        const intro = pick(g, 'intro')
        return (
          <section
            key={g._id}
            id={g.slug || undefined}
            className={cn('scroll-mt-24', index % 2 === 1 && 'bg-sand/40 border-y border-line')}
          >
            <div className="container mx-auto px-4 py-20 lg:py-28">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
                <div className="lg:col-span-5">
                  <span className="eyebrow">{pick(g, 'name')}</span>
                  {title && (
                    <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">{title}</h2>
                  )}
                </div>
                {intro && (
                  <div className="lg:col-span-7 lg:pt-9 space-y-4 text-lg text-body-strong font-light leading-relaxed measure-body">
                    <Paragraphs text={intro} />
                  </div>
                )}
              </div>

              {g.image?.asset && (
                <div className="relative mt-12 aspect-[4/3] sm:aspect-[21/9] w-full overflow-hidden bg-sand">
                  <Image
                    src={urlFor(g.image).width(2000).height(860).fit('crop').url()}
                    alt={g.image?.alt || ''}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              )}

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                {g.activities.map((a) => {
                  const where = pick(a.where, 'name')
                  const summary = pick(a, 'summary')
                  return (
                    <article key={a._id} className="border-t border-line pt-5">
                      {a.image?.asset && (
                        <div className="relative aspect-[3/2] w-full overflow-hidden bg-sand mb-5">
                          <Image
                            src={urlFor(a.image).width(900).height(600).fit('crop').url()}
                            alt={a.image?.alt || pick(a, 'name')}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <h3 className="font-title text-xl text-ink leading-tight">{pick(a, 'name')}</h3>
                      {where && <p className="mt-1.5 eyebrow !tracking-[0.16em]">{where}</p>}
                      {summary && <p className="mt-3 text-[15px] text-body-strong font-light leading-relaxed">{summary}</p>}
                      {a.mapsUrl && <MapsLink href={a.mapsUrl} className="mt-3" />}
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
