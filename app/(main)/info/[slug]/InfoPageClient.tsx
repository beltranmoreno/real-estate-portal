'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { RichText } from '@/components/RichText'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'
import { ActivitiesList, type ActivityItem } from '@/components/ActivitiesList'
import { ShopsList, type ShopItem } from '@/components/ShopsList'
import { BeachGuide, type BeachVenue, type BeachActivity, type BeachShop } from '@/components/BeachGuide'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface OtherGuide {
  _id: string
  slug: string
  title_en?: string
  title_es?: string
  intro_en?: string
  intro_es?: string
}

interface InfoPageClientProps {
  infoPage: any
  otherGuides?: OtherGuide[]
  /** Only passed on the Activities guide. */
  activities?: ActivityItem[]
  shops?: ShopItem[]
  /** Only passed on the Beaches guide. */
  beach?: { venues: BeachVenue[]; activities: BeachActivity[]; shops: BeachShop[] } | null
}

type Locale = 'en' | 'es'

/** Locale field with EN fallback, so a half-translated doc never renders blank. */
function pick(obj: any, field: string, locale: Locale): string | undefined {
  if (!obj) return undefined
  return (locale === 'es' ? obj[`${field}_es`] : obj[`${field}_en`]) || obj[`${field}_en`] || undefined
}

const primaryBtn =
  'inline-flex items-center justify-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.16em] rounded-[2px] transition-colors'

export default function InfoPageClient({
  infoPage,
  otherGuides = [],
  activities = [],
  shops = [],
  beach = null,
}: InfoPageClientProps) {
  const { locale, t } = useLocale()

  const title = pick(infoPage, 'title', locale)
  const intro = pick(infoPage, 'intro', locale)

  return (
    <div className="bg-canvas">
      {/* HERO — same editorial frame as /about: headline beside the intro,
          optional photograph full-bleed beneath. */}
      <section className="border-b border-line">
        <div className="container mx-auto px-4 pt-24 sm:pt-36 pb-16 sm:pb-28">
          {/* Top-aligned: the intro starts level with the title (lg:pt-9 clears
              the eyebrow) and grows downward, so it never rises above it. */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <span className="eyebrow">{t({ en: 'The resort · Guide', es: 'El resort · Guía' })}</span>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] measure-display">
                {title}
              </h1>
            </div>
            {intro && (
              <div className="lg:col-span-5 lg:pt-9">
                <p className="text-lg text-body-strong font-light leading-relaxed">{intro}</p>
              </div>
            )}
          </div>
        </div>

        {infoPage.heroImage?.asset && (
          <div className="relative aspect-[4/3] sm:aspect-[21/9] w-full bg-sand">
            <Image
              src={urlFor(infoPage.heroImage).width(2400).height(1030).url()}
              alt={title || ''}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
      </section>

      {/* Leticia's recommendation */}
      {infoPage.leticiaRecommendation?.isActive && (
        <section className="container mx-auto px-4 pt-16 sm:pt-20 max-w-3xl">
          <LeticiaRecommendation recommendation={infoPage.leticiaRecommendation} />
        </section>
      )}

      {/* Activities (Activities guide only) */}
      {activities.length > 0 && <ActivitiesList activities={activities} />}
      {shops.length > 0 && <ShopsList shops={shops} />}

      {/* Beaches guide: Minitas + beyond */}
      {beach && <BeachGuide venues={beach.venues} activities={beach.activities} shops={beach.shops} />}

      {/* Content blocks */}
      {infoPage.content?.length > 0 && (
        <div className="container mx-auto px-4 py-16 sm:py-24 space-y-20 sm:space-y-24">
          {infoPage.content.map((block: any, index: number) => (
            <ContentBlock key={block._key || index} block={block} locale={locale} />
          ))}
        </div>
      )}

      {/* More of Casa de Campo — the other guides, plus the concierge */}
      <section className="border-t border-line bg-sand/40">
        <div className="container mx-auto px-4 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <span className="eyebrow">{t({ en: 'Keep exploring', es: 'Sigue explorando' })}</span>
            <h2 className="mt-3 font-title text-3xl text-ink leading-tight">
              {t({ en: 'More of Casa de Campo', es: 'Más de Casa de Campo' })}
            </h2>
            <p className="mt-4 text-body-strong font-light leading-relaxed">
              {t({
                en: 'Staying with us? Leticia’s concierge can book any of it for you.',
                es: '¿Te hospedas con nosotros? La conserjería de Leticia puede reservarlo por ti.',
              })}
            </p>
            <Link
              href="/services/concierge"
              className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink border-b border-line pb-1 hover:border-ink transition-colors"
            >
              {t({ en: 'Concierge services', es: 'Servicios de conserjería' })}
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>

          <ul className="lg:col-span-8 border-t border-line">
            {[
              ...otherGuides.map((g) => ({
                key: g._id,
                href: `/info/${g.slug}`,
                title: pick(g, 'title', locale),
                body: pick(g, 'intro', locale),
              })),
              {
                key: 'restaurants',
                href: '/restaurants',
                title: t({ en: 'Restaurants', es: 'Restaurantes' }),
                body: t({
                  en: 'Where to book dinner, from the marina to Altos de Chavón.',
                  es: 'Dónde reservar la cena, desde la marina hasta Altos de Chavón.',
                }),
              },
              {
                key: 'courses',
                href: '/courses',
                title: t({ en: 'Golf', es: 'Golf' }),
                body: t({
                  en: 'The courses, and how to get a tee time.',
                  es: 'Los campos, y cómo conseguir una salida.',
                }),
              },
            ].map((item) => (
              <li key={item.key} className="border-b border-line">
                <Link href={item.href} className="group grid grid-cols-[1fr_auto] gap-6 items-start py-6">
                  <span>
                    <span className="block font-title text-xl text-ink decoration-1 underline-offset-4 group-hover:underline">
                      {item.title}
                    </span>
                    {item.body && (
                      <span className="mt-1.5 text-sm text-muted font-light leading-relaxed line-clamp-2 max-w-2xl">
                        {item.body}
                      </span>
                    )}
                  </span>
                  <ArrowRight className="mt-2 h-4 w-4 text-muted-2 group-hover:text-ink transition-colors" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function ContentBlock({ block, locale }: { block: any; locale: Locale }) {
  switch (block._type) {
    case 'hero':
      return <HeroBlock block={block} locale={locale} />
    case 'richText':
      return <RichTextBlock block={block} locale={locale} />
    case 'imageGallery':
      return <ImageGalleryBlock block={block} locale={locale} />
    case 'video':
      return <VideoBlock block={block} locale={locale} />
    case 'faq':
      return <FAQBlock block={block} locale={locale} />
    case 'ctaBanner':
      return <CTABannerBlock block={block} locale={locale} />
    default:
      return null
  }
}

function BlockTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-title text-3xl sm:text-4xl text-ink leading-tight mb-8">{children}</h2>
}

function HeroBlock({ block, locale }: { block: any; locale: Locale }) {
  const title = pick(block, 'title', locale)
  const subtitle = pick(block, 'subtitle', locale)
  const ctaText = pick(block.cta, 'text', locale)

  return (
    <div className="relative -mx-4 sm:mx-0 overflow-hidden bg-ink text-surface">
      {block.image?.asset && (
        <div className="relative aspect-[4/3] sm:aspect-[21/9]">
          <Image
            src={urlFor(block.image).width(2000).height(860).url()}
            alt={title || ''}
            fill
            className="object-cover opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}
      <div className={block.image?.asset ? 'absolute inset-0 flex items-end p-8 sm:p-12' : 'p-8 sm:p-12'}>
        <div className="max-w-2xl">
          {title && <h2 className="font-title text-3xl sm:text-4xl leading-tight">{title}</h2>}
          {subtitle && <p className="mt-4 text-lg text-white/75 font-light leading-relaxed">{subtitle}</p>}
          {block.cta?.url && ctaText && (
            <a href={block.cta.url} className={`mt-6 ${primaryBtn} bg-surface text-ink hover:bg-brand hover:text-surface`}>
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function RichTextBlock({ block, locale }: { block: any; locale: Locale }) {
  const title = pick(block, 'title', locale)
  const content = locale === 'es' ? block.content_es || block.content_en : block.content_en

  return (
    <div className="max-w-3xl mx-auto">
      {title && <BlockTitle>{title}</BlockTitle>}
      <RichText value={content} />
    </div>
  )
}

function ImageGalleryBlock({ block, locale }: { block: any; locale: Locale }) {
  const title = pick(block, 'title', locale)
  const images = (block.images ?? []).filter((i: any) => i?.asset)
  if (images.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto">
      {title && <BlockTitle>{title}</BlockTitle>}
      <div
        className={`grid gap-x-6 gap-y-8 ${
          block.layout === 'masonry' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        {images.map((image: any, index: number) => {
          const caption = pick(image, 'caption', locale)
          return (
            <figure key={image._key || index}>
              <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                <Image
                  src={urlFor(image).width(1000).height(750).url()}
                  alt={caption || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              {caption && (
                <figcaption className="mt-3 text-sm text-muted font-light leading-relaxed">{caption}</figcaption>
              )}
            </figure>
          )
        })}
      </div>
    </div>
  )
}

function VideoBlock({ block, locale }: { block: any; locale: Locale }) {
  const title = pick(block, 'title', locale)
  const description = pick(block, 'description', locale)
  const [isPlaying, setIsPlaying] = useState(false)
  const playLabel = locale === 'es' ? 'Reproducir video' : 'Play video'

  if (!block.videoUrl) return null

  return (
    <div className="max-w-4xl mx-auto">
      {title && <BlockTitle>{title}</BlockTitle>}
      {description && (
        <p className="-mt-4 mb-8 text-lg text-body-strong font-light leading-relaxed max-w-3xl">{description}</p>
      )}

      <div className="relative aspect-video overflow-hidden bg-sand">
        {!isPlaying && block.thumbnail?.asset ? (
          <button
            type="button"
            className="group relative w-full h-full"
            onClick={() => setIsPlaying(true)}
            aria-label={playLabel}
          >
            <Image
              src={urlFor(block.thumbnail).width(1400).height(788).url()}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
            <span className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface/95 text-ink group-hover:bg-surface transition-colors">
                <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
              </span>
            </span>
          </button>
        ) : (
          <iframe
            src={block.videoUrl}
            title={title || playLabel}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  )
}

function FAQBlock({ block, locale }: { block: any; locale: Locale }) {
  const title = pick(block, 'title', locale)
  const questions = block.questions ?? []
  if (questions.length === 0) return null

  return (
    <div className="max-w-3xl mx-auto">
      {title && <BlockTitle>{title}</BlockTitle>}
      <Accordion type="single" collapsible className="w-full border-t border-line">
        {questions.map((item: any, index: number) => {
          const question = pick(item, 'question', locale)
          const answer = locale === 'es' ? item.answer_es || item.answer_en : item.answer_en
          return (
            <AccordionItem key={item._key || index} value={`item-${index}`} className="border-b border-line">
              <AccordionTrigger className="py-5 text-left hover:no-underline">
                <span className="font-title text-lg sm:text-xl text-ink">{question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <RichText value={answer} className="text-base" />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

function CTABannerBlock({ block, locale }: { block: any; locale: Locale }) {
  const title = pick(block, 'title', locale)
  const description = pick(block, 'description', locale)
  const primaryText = pick(block.primaryCta, 'text', locale)
  const secondaryText = pick(block.secondaryCta, 'text', locale)

  // White panel with dark type — light and calm, rather than a dark band.
  return (
    <div className="border border-line bg-surface">
      <div className="py-16 sm:py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          {title && <h2 className="font-display text-3xl sm:text-4xl text-ink leading-tight">{title}</h2>}
          {description && (
            <p className="mt-5 text-lg text-body-strong font-light leading-relaxed">{description}</p>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {block.primaryCta?.url && primaryText && (
              <a href={block.primaryCta.url} className={`${primaryBtn} bg-ink text-surface hover:bg-brand`}>
                {primaryText}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </a>
            )}
            {block.secondaryCta?.url && secondaryText && (
              <a href={block.secondaryCta.url} className={`${primaryBtn} border border-control-border text-ink hover:border-ink`}>
                {secondaryText}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
