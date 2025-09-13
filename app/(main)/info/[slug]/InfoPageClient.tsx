'use client'

import Image from 'next/image'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { PortableText } from '@portabletext/react'
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
    <div className="min-h-screen bg-white">
      {/* Luxury Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/luxury-pattern.svg')] opacity-5"></div>
        
        {/* Hero Image Background */}
        {infoPage.heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={urlFor(infoPage.heroImage).width(1920).height(1080).url()}
              alt={title}
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/60 to-white/40"></div>
          </div>
        )}
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium tracking-wide uppercase">
                {t({ en: 'Discover Casa de Campo', es: 'Descubre Casa de Campo' })}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-light text-slate-900 mb-8 tracking-tight leading-tight">
              {title}
            </h1>
            {intro && (
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto font-light">
                {intro}
              </p>
            )}
            <div className="mt-12 flex items-center justify-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
              <div className="mx-4 w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Blocks */}
      <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-20">
            {infoPage.content?.map((block: any, index: number) => (
              <ContentBlock key={block._key || index} block={block} />
            ))}
          </div>
        </div>
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
    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
      {block.image && (
        <div className="relative aspect-[21/9]">
          <Image
            src={urlFor(block.image).width(1200).height(514).url()}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center text-center text-white p-8">
        <div className="max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-light mb-6 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-xl md:text-2xl mb-8 text-white/90 font-light">{subtitle}</p>
          )}
          {block.cta?.url && ctaText && (
            <a
              href={block.cta.url}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
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

  return (
    <div className="max-w-4xl mx-auto">
      {title && (
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">
            {title}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto"></div>
        </div>
      )}
      {content && (
        <div className="bg-white p-8 md:p-12 rounded-2xl">
          <div className="prose prose-lg prose-slate max-w-none font-light leading-relaxed">
            <PortableText value={content} />
          </div>
        </div>
      )}
    </div>
  )
}

function ImageGalleryBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es

  return (
    <div>
      {title && (
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">
            {title}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto"></div>
        </div>
      )}
      
      <div className={`grid gap-6 ${
        block.layout === 'masonry' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {block.images?.map((image: any, index: number) => {
          const caption = locale === 'en' ? image.caption_en : image.caption_es
          return (
            <div key={index} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
              <Image
                src={urlFor(image).width(600).height(450).url()}
                alt={caption || `Gallery image ${index + 1}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-light text-sm leading-relaxed">
                      {caption}
                    </p>
                  </div>
                </div>
              )}
            </div>
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
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-xl text-slate-600 font-light max-w-3xl mx-auto">
              {description}
            </p>
          )}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto mt-6"></div>
        </div>
      )}
      
      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
        {!isPlaying && block.thumbnail && (
          <div className="relative w-full h-full cursor-pointer" onClick={() => setIsPlaying(true)}>
            <Image
              src={urlFor(block.thumbnail).width(800).height(450).url()}
              alt={title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                <PlayCircleIcon className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </div>
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
    <div className="max-w-4xl mx-auto">
      {title && (
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight mb-4">
            {title}
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto"></div>
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {block.questions?.map((item: any, index: number) => {
            const question = locale === 'en' ? item.question_en : item.question_es
            const answer = locale === 'en' ? item.answer_en : item.answer_es
            
            return (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-slate-200"
              >
                <AccordionTrigger className="px-8 py-6 text-left font-medium text-slate-900 hover:no-underline hover:bg-slate-50 transition-colors">
                  <span className="text-lg">{question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-8 pb-6">
                  <div className="prose prose-slate max-w-none font-light text-slate-700">
                    <PortableText value={answer} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}

function CTABannerBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const description = locale === 'en' ? block.description_en : block.description_es
  const primaryText = locale === 'en' ? block.primaryCta?.text_en : block.primaryCta?.text_es
  const secondaryText = locale === 'en' ? block.secondaryCta?.text_en : block.secondaryCta?.text_es

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
      {block.backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={urlFor(block.backgroundImage).width(1200).height(400).url()}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80"></div>
        </div>
      )}
      
      <div className={`relative py-16 px-8 text-center text-white ${
        !block.backgroundImage ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''
      }`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xl text-white/90 mb-8 font-light leading-relaxed">
              {description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {block.primaryCta?.url && primaryText && (
              <a
                href={block.primaryCta.url}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {primaryText}
              </a>
            )}
            
            {block.secondaryCta?.url && secondaryText && (
              <a
                href={block.secondaryCta.url}
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
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