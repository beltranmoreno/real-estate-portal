'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { useNavOverlay } from '@/contexts/NavOverlayContext'
import { cn } from '@/lib/utils'
import { HeroMedia } from '@/components/PageHero'
import { Paragraphs } from '@/components/resort/Paragraphs'
import { MapsLink } from '@/components/MapsLink'
import { RestaurantCard } from '@/components/RestaurantCard'
import type { Bi, GuideEntry, GuideSection, ResortGuide, ResortGuideLink } from '@/lib/resortGuides'

type T = (v: Bi) => string

const isExternal = (href: string) => /^https?:\/\//.test(href)

/** Internal paths and anchors use <Link>; full URLs open in a new tab. */
function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

/** Underlined text button; hidden unless it has both a label and a link. */
function TextButton({ label, href, onDark }: { label: string; href: string | null; onDark?: boolean }) {
  if (!label || !href) return null
  const Arrow = isExternal(href) ? ArrowUpRight : ArrowRight
  return (
    <SmartLink
      href={href}
      className={cn(
        'group mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] border-b pb-1 w-fit transition-colors',
        onDark ? 'text-surface border-white/40 hover:border-white' : 'text-ink border-line hover:border-ink'
      )}
    >
      {label}
      <Arrow className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </SmartLink>
  )
}

function SectionHeader({
  eyebrow,
  title,
  intro,
  t,
  children,
}: {
  eyebrow: Bi
  title: Bi
  intro?: Bi
  t: T
  /** Shown under the intro, in the same column. */
  children?: React.ReactNode
}) {
  const introText = intro ? t(intro) : ''
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
      <div className="lg:col-span-5">
        {t(eyebrow) && <span className="eyebrow">{t(eyebrow)}</span>}
        {t(title) && (
          <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">{t(title)}</h2>
        )}
      </div>
      {(introText || children) && (
        <div className="lg:col-span-7 lg:pt-9 measure-body">
          {introText && (
            <div className="space-y-4 text-lg text-body-strong font-light leading-relaxed">
              <Paragraphs text={introText} />
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

/** A name that links to its restaurant page / website when it has one. */
function EntryName({ entry, t, className }: { entry: GuideEntry; t: T; className?: string }) {
  const name = t(entry.name)
  if (!entry.href) return <span className={className}>{name}</span>
  return (
    <SmartLink href={entry.href} className={cn('group inline-flex items-baseline gap-1.5 hover:text-brand transition-colors', className)}>
      {name}
      {entry.external ? (
        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-muted-2 group-hover:text-brand" aria-hidden />
      ) : (
        <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-2 group-hover:text-brand" aria-hidden />
      )}
    </SmartLink>
  )
}

/** Plain names in a hairline list. */
function NameList({ items, t }: { items: GuideEntry[]; t: T }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 border-t border-line">
      {items.map((e) => (
        <li key={e.key} className="border-b border-line py-3 text-[15px] font-light text-body-strong">
          <EntryName entry={e} t={t} />
        </li>
      ))}
    </ul>
  )
}

/** Entries with a description (and maybe a photo or schedule) as cards. */
function EntryCards({ items, t }: { items: GuideEntry[]; t: T }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {items.map((e) => (
        <article key={e.key}>
          {e.imageUrl && (
            <div className="relative aspect-[4/3] mb-5 overflow-hidden bg-sand">
              <Image src={e.imageUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
            </div>
          )}
          <h3 className="font-title text-xl text-ink">
            <EntryName entry={e} t={t} />
          </h3>
          {t(e.note) && (
            <div className="mt-3 space-y-3 text-[15px] text-body-strong font-light leading-relaxed">
              <Paragraphs text={t(e.note)} />
            </div>
          )}
          {e.details.length > 0 && (
            <dl className="mt-4 border-t border-line pt-3 space-y-1 text-sm font-light text-body-strong">
              {e.details.map((d, i) => (
                <div key={i} className="flex gap-2">
                  {t(d.label) && <dt className="eyebrow pt-0.5">{t(d.label)}</dt>}
                  <dd>{t(d.value)}</dd>
                </div>
              ))}
            </dl>
          )}
          {e.mapsUrl && <MapsLink href={e.mapsUrl} className="mt-4" />}
        </article>
      ))}
    </div>
  )
}

/** Published restaurants as the same cards as the restaurants page. */
function RestaurantGrid({ items }: { items: GuideEntry[] }) {
  const { locale } = useLocale()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
      {items.map((e) => (
        <RestaurantCard key={e.key} restaurant={e.restaurant} locale={locale} />
      ))}
    </div>
  )
}

function Section({ section, index, t }: { section: GuideSection; index: number; t: T }) {
  const tinted = index % 2 === 1
  const wrap = (children: React.ReactNode) => (
    <section id={section.anchor || undefined} className={cn('scroll-mt-24', tinted && 'bg-sand/40 border-y border-line')}>
      <div className="container mx-auto px-4 py-20 lg:py-28">{children}</div>
    </section>
  )
  const btn = <TextButton label={t(section.button.label)} href={section.button.href} />

  if (section.kind === 'feature') {
    const body = t(section.body)
    // Photos alternate sides down the page.
    const imageRight = index % 2 === 0
    const details = section.details.filter((d) => t(d.value))
    const extras = (
      <>
        {section.highlights.length > 0 && (
          <div className="mt-8">
            {t(section.highlightsLabel) && <span className="eyebrow block mb-3">{t(section.highlightsLabel)}</span>}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 border-t border-line">
              {section.highlights.map((e) => (
                <li key={e.key} className="border-b border-line py-2.5 text-[15px] font-light text-body-strong">
                  <EntryName entry={e} t={t} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {details.length > 0 && (
          <dl className="mt-6 space-y-1 text-sm font-light text-muted leading-relaxed">
            {details.map((d, i) => (
              <div key={i} className="flex gap-2">
                {t(d.label) && <dt className="eyebrow pt-0.5">{t(d.label)}</dt>}
                <dd>{t(d.value)}</dd>
              </div>
            ))}
          </dl>
        )}
        {section.mapsUrl && (
          <div className={details.length > 0 ? 'mt-3' : 'mt-6'}>
            <MapsLink href={section.mapsUrl} />
          </div>
        )}
      </>
    )
    if (!section.imageUrl) {
      return wrap(
        <SectionHeader eyebrow={section.eyebrow} title={section.title} intro={section.body} t={t}>
          {extras}
          {btn}
        </SectionHeader>
      )
    }
    return wrap(
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className={cn('lg:col-span-6 relative aspect-[4/3] overflow-hidden bg-sand', imageRight && 'lg:order-2')}>
          <Image src={section.imageUrl} alt={section.imageAlt || ''} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="lg:col-span-6">
          {t(section.eyebrow) && <span className="eyebrow">{t(section.eyebrow)}</span>}
          {t(section.title) && (
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">{t(section.title)}</h2>
          )}
          {body && (
            <div className="mt-6 space-y-4 text-lg text-body-strong font-light leading-relaxed measure-body">
              <Paragraphs text={body} />
            </div>
          )}
          {extras}
          {btn}
        </div>
      </div>
    )
  }

  if (section.kind === 'venues') {
    // Restaurants get restaurant cards. Of the rest, bare names read best as a
    // list; entries with a description get cards.
    const restaurants = section.items.filter((e) => e.restaurant)
    const others = section.items.filter((e) => !e.restaurant)
    const rich = others.filter((e) => t(e.note) || e.details.length > 0)
    const plain = others.filter((e) => !rich.includes(e))
    return wrap(
      <>
        <SectionHeader eyebrow={section.eyebrow} title={section.title} intro={section.intro} t={t} />
        {section.items.length > 0 && (
          <div className="mt-12">
            {t(section.listLabel) && <span className="eyebrow block mb-4">{t(section.listLabel)}</span>}
            <div className="space-y-10">
              {restaurants.length > 0 && <RestaurantGrid items={restaurants} />}
              {plain.length > 0 && <NameList items={plain} t={t} />}
              {rich.length > 0 && <EntryCards items={rich} t={t} />}
            </div>
          </div>
        )}
        {btn}
      </>
    )
  }

  // A group with restaurants spans the full width so they fit as cards; its
  // other entries stay a list underneath.
  const isDining = (g: (typeof section.groups)[number]) => g.items.some((e) => e.restaurant)
  return wrap(
    <>
      <SectionHeader eyebrow={section.eyebrow} title={section.title} intro={section.intro} t={t} />
      {section.groups.filter(isDining).map((g) => {
        const rest = g.items.filter((e) => !e.restaurant)
        return (
          <div key={g.key} className="mt-14 border-t border-ink/80 pt-5">
            <h3 className="font-title text-xl text-ink">{t(g.title)}</h3>
            {t(g.description) && <p className="mt-2 text-sm text-muted font-light leading-relaxed measure-body">{t(g.description)}</p>}
            {t(g.listLabel) && <span className="eyebrow block mt-5">{t(g.listLabel)}</span>}
            <div className="mt-8">
              <RestaurantGrid items={g.items.filter((e) => e.restaurant)} />
            </div>
            {rest.length > 0 && (
              <div className="mt-10">
                <NameList items={rest} t={t} />
              </div>
            )}
          </div>
        )
      })}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
        {section.groups.filter((g) => !isDining(g)).map((g) => (
          <div key={g.key} className="border-t border-ink/80 pt-5">
            <h3 className="font-title text-xl text-ink">{t(g.title)}</h3>
            {t(g.description) && <p className="mt-2 text-sm text-muted font-light leading-relaxed">{t(g.description)}</p>}
            {t(g.listLabel) && <span className="eyebrow block mt-5">{t(g.listLabel)}</span>}
            <ul className="mt-2">
              {g.items.map((e) => (
                <li key={e.key} className="py-1.5 text-[15px] font-light text-body-strong">
                  <EntryName entry={e} t={t} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {btn}
    </>
  )
}

/** One resort guide page (The Marina, Altos de Chavón, Hotel, Nightlife…). */
export default function ResortGuideClient({ guide, others }: { guide: ResortGuide; others: ResortGuideLink[] }) {
  const { t: tr } = useLocale()
  // Studio text in the visitor's language, falling back to the other one.
  const t: T = (v) => tr({ en: v?.en?.trim() || v?.es?.trim() || '', es: v?.es?.trim() || v?.en?.trim() || '' })

  const onPhoto = guide.heroImages.length > 0
  const navOverlayProps = useNavOverlay(onPhoto)
  const overlay = Math.min(70, Math.max(0, guide.heroOverlay)) / 100
  const intro = t(guide.intro)

  return (
    <div>
      {onPhoto ? (
        <section {...navOverlayProps} className="relative overflow-hidden bg-ink text-surface min-h-[75svh] sm:min-h-[640px] flex items-end">
          <HeroMedia images={guide.heroImages} video={null} />
          {overlay > 0 && <div className="absolute inset-0 bg-ink" style={{ opacity: overlay }} />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <div className="relative container mx-auto px-4 pt-32 pb-10 sm:pb-14">
            {t(guide.eyebrow) && <p className="eyebrow !text-white/70 mb-6">{t(guide.eyebrow)}</p>}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl max-w-4xl leading-[1.05] whitespace-pre-line">{t(guide.title)}</h1>
            {intro && (
              <div className="mt-8 max-w-2xl space-y-4 text-base sm:text-lg text-white/85 font-light leading-relaxed">
                <Paragraphs text={intro} />
              </div>
            )}
            <TextButton label={t(guide.button.label)} href={guide.button.href} onDark />
          </div>
        </section>
      ) : (
        <section className="bg-canvas border-b border-line">
          <div className="container mx-auto px-4 pt-12 sm:pt-24 pb-12 sm:pb-16">
            {t(guide.eyebrow) && <p className="eyebrow mb-6">{t(guide.eyebrow)}</p>}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink max-w-4xl whitespace-pre-line">{t(guide.title)}</h1>
            {intro && (
              <div className="mt-8 max-w-2xl space-y-4 text-base sm:text-lg text-muted font-light leading-relaxed">
                <Paragraphs text={intro} />
              </div>
            )}
            <TextButton label={t(guide.button.label)} href={guide.button.href} />
          </div>
        </section>
      )}

      {/* "#explore" — the default target of the intro button. */}
      <div id="explore" className="scroll-mt-20">
        {guide.sections.map((section, i) => (
          <Section key={section.key} section={section} index={i} t={t} />
        ))}
      </div>

      {others.length > 0 && (
        <section className="border-t border-line">
          <div className="container mx-auto px-4 py-20">
            <span className="eyebrow">{tr({ en: 'More of the resort', es: 'Más del resort' })}</span>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 border-t border-line">
              {[{ slug: '', label: { en: 'Casa de Campo', es: 'Casa de Campo' } }, ...others].map((o) => (
                <li key={o.slug || 'cdc'} className="border-b border-line">
                  <Link
                    href={o.slug ? `/casa-de-campo/${o.slug}` : '/casa-de-campo'}
                    className="group flex items-center justify-between py-4 font-title text-xl text-ink hover:text-brand transition-colors"
                  >
                    {t(o.label)}
                    <ArrowRight className="w-4 h-4 text-muted-2 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
