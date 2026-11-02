'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import { HeroMedia } from '@/components/PageHero'
import { Paragraphs } from '@/components/resort/Paragraphs'
import type { ResortGuideLink } from '@/lib/resortGuides'
import { CASA_DE_CAMPO_DEFAULTS as D } from '@/sanity/lib/casaDeCampoDefaults'

type Bi = { en?: string | null; es?: string | null }

export interface DatedPhoto {
  url: string
  year: string | null
  caption: Bi
}

export interface CasaDeCampoData {
  hero: { eyebrow: Bi; title: Bi; intro: Bi; images: string[]; overlay: number }
  story: { eyebrow: Bi; title: Bi; body: Bi; image: string | null; imageAlt: string | null }
  archive: { eyebrow: Bi; title: Bi; intro: Bi; photos: DatedPhoto[] }
  personal: { eyebrow: Bi; title: Bi; body: Bi; photos: DatedPhoto[]; name: string | null; role: Bi }
  cta: {
    eyebrow: Bi
    title: Bi
    body: Bi
    buttonLabel: Bi
    buttonHref: string | null
    image: string | null
    imageAlt: string | null
  }
}

/** A photo with its year set on the image and an optional caption below. */
function DatedFigure({ photo, aspect, sizes }: { photo: DatedPhoto; aspect: string; sizes: string }) {
  const { t } = useLocale()
  const caption = t({ en: photo.caption.en || photo.caption.es || '', es: photo.caption.es || photo.caption.en || '' })
  return (
    <figure>
      <div className={cn('relative overflow-hidden bg-sand', aspect)}>
        <Image src={photo.url} alt={caption || photo.year || ''} fill sizes={sizes} className="object-cover" />
        {photo.year && (
          <span className="absolute left-3 bottom-3 bg-ink/70 px-2.5 py-1 font-serif text-sm text-surface">
            {photo.year}
          </span>
        )}
      </div>
      {caption && <figcaption className="mt-2.5 text-sm font-light text-muted-2">{caption}</figcaption>}
    </figure>
  )
}

/**
 * The Casa de Campo page: intro, the resort's story, archive photos,
 * Leticia's personal connection and a closing call to action. All copy and
 * photos come from Studio (Page Heroes → Casa de Campo page), with the launch
 * copy as the fallback for any empty field.
 */
export default function CasaDeCampoClient({ data, guides = [] }: { data: CasaDeCampoData; guides?: ResortGuideLink[] }) {
  const { t } = useLocale()
  // Studio value (other language if only one is filled), else the launch copy.
  const pick = (v: Bi, d: { en: string; es: string }) =>
    t({ en: v.en?.trim() || v.es?.trim() || d.en, es: v.es?.trim() || v.en?.trim() || d.es })

  const { hero, story, archive, personal, cta } = data
  const onPhoto = hero.images.length > 0
  const overlay = Math.min(70, Math.max(0, hero.overlay)) / 100
  const [leadPhoto, ...morePhotos] = personal.photos

  return (
    <div>
      {/* ── Intro ─────────────────────────────────────────────────────── */}
      {onPhoto ? (
        <section
          data-hero
          className="relative overflow-hidden bg-ink text-surface min-h-[75svh] sm:min-h-[640px] flex items-end"
        >
          <HeroMedia images={hero.images} video={null} />
          {overlay > 0 && <div className="absolute inset-0 bg-ink" style={{ opacity: overlay }} />}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <div className="relative container mx-auto px-4 pt-32 pb-10 sm:pb-14">
            <p className="eyebrow !text-white/70 mb-6">{pick(hero.eyebrow, D.hero.eyebrow)}</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl max-w-4xl leading-[1.05] whitespace-pre-line">
              {pick(hero.title, D.hero.title)}
            </h1>
            <p className="text-base sm:text-lg text-white/85 font-light mt-8 max-w-2xl leading-relaxed whitespace-pre-line">
              {pick(hero.intro, D.hero.intro)}
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-canvas border-b border-line">
          <div className="container mx-auto px-4 pt-32 sm:pt-44 pb-12 sm:pb-16">
            <p className="eyebrow mb-6">{pick(hero.eyebrow, D.hero.eyebrow)}</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink max-w-4xl whitespace-pre-line">
              {pick(hero.title, D.hero.title)}
            </h1>
            <p className="text-base sm:text-lg text-muted font-light mt-8 max-w-2xl leading-relaxed whitespace-pre-line">
              {pick(hero.intro, D.hero.intro)}
            </p>
          </div>
        </section>
      )}

      {/* ── The story ─────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="eyebrow">{pick(story.eyebrow, D.story.eyebrow)}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">
              {pick(story.title, D.story.title)}
            </h2>
            {story.image && (
              <div className="relative mt-10 aspect-[4/5] overflow-hidden bg-sand">
                <Image src={story.image} alt={story.imageAlt || ''} fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
              </div>
            )}
          </div>
          <div className="lg:col-span-7 lg:pt-12 space-y-5 text-lg text-body-strong font-light leading-relaxed measure-body">
            <Paragraphs text={pick(story.body, D.story.body)} />
          </div>
        </div>
      </section>

      {/* ── From the archives ─────────────────────────────────────────── */}
      <section className="bg-sand/40 border-y border-line">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <span className="eyebrow">{pick(archive.eyebrow, D.archive.eyebrow)}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">
              {pick(archive.title, D.archive.title)}
            </h2>
            <div className="mt-5 text-lg text-body-strong font-light leading-relaxed">
              <Paragraphs text={pick(archive.intro, D.archive.intro)} />
            </div>
          </div>
          {archive.photos.length > 0 && (
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {archive.photos.map((photo, i) => (
                <DatedFigure key={i} photo={photo} aspect="aspect-[4/3]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── A personal connection ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {leadPhoto && (
            <div className="lg:col-span-5 space-y-4">
              <DatedFigure photo={leadPhoto} aspect="aspect-[4/5]" sizes="(max-width: 1024px) 100vw, 40vw" />
              {morePhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {morePhotos.map((photo, i) => (
                    <DatedFigure key={i} photo={photo} aspect="aspect-square" sizes="(max-width: 1024px) 50vw, 20vw" />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className={cn(leadPhoto ? 'lg:col-span-7 lg:pt-12' : 'lg:col-span-8')}>
            <span className="eyebrow">{pick(personal.eyebrow, D.personal.eyebrow)}</span>
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">
              {pick(personal.title, D.personal.title)}
            </h2>
            <div className="mt-8 space-y-5 text-lg text-body-strong font-light leading-relaxed measure-body">
              <Paragraphs text={pick(personal.body, D.personal.body)} />
            </div>
            <div className="mt-10 pt-6 border-t border-line measure-body">
              <div className="font-serif text-xl text-ink">{personal.name?.trim() || D.personal.name}</div>
              <div className="eyebrow mt-1.5">{pick(personal.role, D.personal.role)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The resort guides (from Studio) ───────────────────────────── */}
      {guides.length > 0 && (
        <section className="bg-sand/40 border-t border-line">
          <div className="container mx-auto px-4 py-20 lg:py-24">
            <span className="eyebrow">{t({ en: 'Discover the resort', es: 'Descubre el resort' })}</span>
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
              {guides.map((g) => {
                const label = t({ en: g.label.en || g.label.es || '', es: g.label.es || g.label.en || '' })
                const title = t({ en: g.title.en || g.title.es || '', es: g.title.es || g.title.en || '' })
                return (
                  <Link key={g.slug} href={`/casa-de-campo/${g.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-brand-deep">
                      {g.imageUrl && (
                        <Image
                          src={g.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>
                    <div className="mt-4 eyebrow">{label}</div>
                    <div className="mt-1.5 font-title text-lg sm:text-xl text-ink leading-snug group-hover:text-brand transition-colors">
                      {title}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Closing ───────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 bg-ink text-surface">
        <div className="relative min-h-[360px] md:min-h-[480px] bg-brand-deep overflow-hidden">
          {cta.image && (
            <Image src={cta.image} alt={cta.imageAlt || ''} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          )}
        </div>
        <div className="flex flex-col justify-center gap-6 px-8 py-16 sm:px-14 lg:px-16">
          <span className="eyebrow !text-white/55">{pick(cta.eyebrow, D.cta.eyebrow)}</span>
          <h2 className="font-title text-3xl sm:text-4xl text-surface measure-display whitespace-pre-line">
            {pick(cta.title, D.cta.title)}
          </h2>
          <p className="text-base font-light leading-relaxed text-white/70 measure-lede whitespace-pre-line">
            {pick(cta.body, D.cta.body)}
          </p>
          <Link
            href={cta.buttonHref || D.cta.buttonHref}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-surface border-b border-white/40 pb-1 w-fit hover:border-white transition-colors"
          >
            {pick(cta.buttonLabel, D.cta.buttonLabel)}
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}
