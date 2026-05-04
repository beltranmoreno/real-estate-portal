'use client'

import Image from 'next/image'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
import LeticiaRecommendation from '@/components/LeticiaRecommendation'
import { 
  PlayCircleIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface InfoPageClientProps {
  infoPage: any
}

export default function InfoPageClient({ infoPage }: InfoPageClientProps) {
  const { locale, t } = useLocale()
  
  const title = locale === 'en' ? infoPage.title_en : infoPage.title_es
  const intro = locale === 'en' ? infoPage.intro_en : infoPage.intro_es

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero — matches the editorial style used on /about and /services/concierge:
          white panel, eyebrow, oversized light headline. The optional hero image
          sits below the text rather than as a busy background. */}
      <section className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-20 sm:py-24 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500 mb-6">
            {t({ en: 'Discover Casa de Campo', es: 'Descubre Casa de Campo' })}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-stone-900 leading-[1.1] tracking-tight max-w-4xl">
            {title}
          </h1>
          {intro && (
            <p className="text-lg sm:text-xl text-stone-600 leading-relaxed font-light mt-8 max-w-3xl">
              {intro}
            </p>
          )}

          {infoPage.heroImage && (
            <div className="relative aspect-[16/9] w-full overflow-hidden mt-12">
              <Image
                src={urlFor(infoPage.heroImage).width(1920).height(1080).url()}
                alt={title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          )}
        </div>
      </section>

      {/* Leticia's Recommendation */}
      {infoPage.leticiaRecommendation && infoPage.leticiaRecommendation.isActive && (
        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <LeticiaRecommendation recommendation={infoPage.leticiaRecommendation} />
        </section>
      )}

      {/* Content Blocks — readable max-width, generous vertical rhythm. */}
      <section className="container mx-auto px-4 py-16 sm:py-20 max-w-5xl space-y-20">
        {infoPage.content?.map((block: any, index: number) => (
          <ContentBlock key={block._key || index} block={block} />
        ))}
      </section>
    </div>
  )
}

function ContentBlock({ block }: { block: any }) {
  const { locale } = useLocale()

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

function HeroBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const subtitle = locale === 'en' ? block.subtitle_en : block.subtitle_es
  const ctaText = locale === 'en' ? block.cta?.text_en : block.cta?.text_es

  return (
    <div className="relative overflow-hidden bg-stone-900">
      {block.image && (
        <div className="relative aspect-[21/9]">
          <Image
            src={urlFor(block.image).width(1600).height(686).url()}
            alt={title}
            fill
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
        </div>
      )}
      <div className="absolute inset-0 flex items-end p-8 sm:p-12">
        <div className="max-w-3xl text-stone-50">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 tracking-tight leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg sm:text-xl mb-6 text-stone-200 font-light leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
          {block.cta?.url && ctaText && (
            <a
              href={block.cta.url}
              className="inline-flex items-center px-6 py-3 bg-white text-stone-900 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function RichTextBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const content = locale === 'en' ? block.content_en : block.content_es

  // Editorial layout — left-aligned, no card chrome. The prose sits
  // directly on the page so it reads like an article, not a CMS widget.
  return (
    <div className="max-w-3xl mx-auto">
      {title && (
        <h2 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
          {title}
        </h2>
      )}
      {content && (
        <div className="prose prose-stone prose-lg max-w-none font-light leading-relaxed prose-headings:font-light prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-900 prose-a:underline prose-a:underline-offset-4 prose-strong:font-medium prose-strong:text-stone-900">
          <PortableText value={content} />
        </div>
      )}
    </div>
  )
}

function ImageGalleryBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es

  return (
    <div className="max-w-5xl mx-auto">
      {title && (
        <h2 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
          {title}
        </h2>
      )}
      <div
        className={`grid gap-3 ${
          block.layout === 'masonry'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        {block.images?.map((image: any, index: number) => {
          const caption = locale === 'en' ? image.caption_en : image.caption_es
          return (
            <figure
              key={index}
              className="group relative aspect-[4/3] overflow-hidden bg-stone-100"
            >
              <Image
                src={urlFor(image).width(800).height(600).url()}
                alt={caption || `Gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {caption && (
                <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-light text-sm leading-relaxed">
                    {caption}
                  </p>
                </figcaption>
              )}
            </figure>
          )
        })}
      </div>
    </div>
  )
}

function VideoBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const description = locale === 'en' ? block.description_en : block.description_es
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      {title && (
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight leading-tight mb-3">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-stone-600 font-light max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="relative aspect-video overflow-hidden bg-stone-100">
        {!isPlaying && block.thumbnail && (
          <button
            type="button"
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            <Image
              src={urlFor(block.thumbnail).width(1200).height(675).url()}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                <PlayCircleIcon className="w-10 h-10 text-stone-900" />
              </div>
            </div>
          </button>
        )}

        {(isPlaying || !block.thumbnail) && block.videoUrl && (
          <iframe
            src={block.videoUrl}
            title={title}
            className="w-full h-full"
            allowFullScreen
          />
        )}
      </div>
    </div>
  )
}

function FAQBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es

  return (
    <div className="max-w-3xl mx-auto">
      {title && (
        <h2 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight mb-8 leading-tight">
          {title}
        </h2>
      )}

      <Accordion type="single" collapsible className="w-full border-t border-stone-200">
        {block.questions?.map((item: any, index: number) => {
          const question = locale === 'en' ? item.question_en : item.question_es
          const answer = locale === 'en' ? item.answer_en : item.answer_es

          return (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-stone-200"
            >
              <AccordionTrigger className="py-5 text-left font-light text-stone-900 hover:no-underline hover:text-stone-700 transition-colors">
                <span className="text-base sm:text-lg">{question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="prose prose-stone max-w-none font-light text-stone-700">
                  <PortableText value={answer} />
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

function CTABannerBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const description = locale === 'en' ? block.description_en : block.description_es
  const primaryText = locale === 'en' ? block.primaryCta?.text_en : block.primaryCta?.text_es
  const secondaryText = locale === 'en' ? block.secondaryCta?.text_en : block.secondaryCta?.text_es

  return (
    <div className="relative overflow-hidden bg-stone-900 text-stone-50">
      {block.backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={urlFor(block.backgroundImage).width(1600).height(600).url()}
            alt={title}
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-stone-900/60" />
        </div>
      )}

      <div className="relative py-20 sm:py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light mb-6 leading-tight tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-stone-300 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              {description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {block.primaryCta?.url && primaryText && (
              <a
                href={block.primaryCta.url}
                className="inline-flex items-center px-6 py-3 bg-white text-stone-900 text-sm font-light tracking-wide rounded-sm hover:bg-stone-100 transition-colors"
              >
                {primaryText}
              </a>
            )}
            {block.secondaryCta?.url && secondaryText && (
              <a
                href={block.secondaryCta.url}
                className="inline-flex items-center px-6 py-3 border border-stone-700 text-stone-200 text-sm font-light tracking-wide rounded-sm hover:bg-stone-800 transition-colors"
              >
                {secondaryText}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}