import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/sanity/lib/image'
import { useLocale } from '@/contexts/LocaleContext'

interface PageBlockRendererProps {
  blocks: any[]
}

export default function PageBlockRenderer({ blocks }: PageBlockRendererProps) {
  const { locale, t } = useLocale()

  const renderBlock = (block: any) => {
    switch (block._type) {
      case 'hero':
        return (
          <HeroBlock
            key={block._key}
            block={block}
            locale={locale}
          />
        )
      
      case 'richText':
        return (
          <RichTextBlock
            key={block._key}
            block={block}
            locale={locale}
          />
        )
      
      case 'imageGallery':
        return (
          <ImageGalleryBlock
            key={block._key}
            block={block}
            locale={locale}
          />
        )
      
      case 'video':
        return (
          <VideoBlock
            key={block._key}
            block={block}
            locale={locale}
          />
        )
      
      case 'faq':
        return (
          <FAQBlock
            key={block._key}
            block={block}
            locale={locale}
          />
        )
      
      case 'ctaBanner':
        return (
          <CTABannerBlock
            key={block._key}
            block={block}
            locale={locale}
          />
        )
      
      default:
        console.warn(`Unknown block type: ${block._type}`)
        return null
    }
  }

  return (
    <div className="space-y-16">
      {blocks?.map(renderBlock)}
    </div>
  )
}

function HeroBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const subtitle = locale === 'en' ? block.subtitle_en : block.subtitle_es
  const ctaText = locale === 'en' ? block.cta?.text_en : block.cta?.text_es

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center text-white overflow-hidden">
      {block.image && (
        <Image
          src={urlFor(block.image).width(1920).height(1080).url()}
          alt={title || ''}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center max-w-4xl px-4">
        {title && (
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xl md:text-2xl mb-8 opacity-90">{subtitle}</p>
        )}
        {block.cta?.url && ctaText && (
          <Link
            href={block.cta.url}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </section>
  )
}

function RichTextBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const content = locale === 'en' ? block.content_en : block.content_es

  return (
    <section className="container mx-auto px-4 py-16">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h2>
      )}
      {content && (
        <div className="prose prose-lg max-w-4xl mx-auto">
          <PortableText
            value={content}
            components={{
              types: {
                image: ({ value }) => (
                  <div className="my-8">
                    <Image
                      src={urlFor(value).width(800).height(600).url()}
                      alt={value.alt || ''}
                      width={800}
                      height={600}
                      className="rounded-lg shadow-lg mx-auto"
                    />
                  </div>
                )
              }
            }}
          />
        </div>
      )}
    </section>
  )
}

function ImageGalleryBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const { images = [], layout = 'grid' } = block

  if (!images.length) return null

  return (
    <section className="container mx-auto px-4 py-16">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h2>
      )}
      <div className={`
        ${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}
        ${layout === 'carousel' ? 'flex gap-6 overflow-x-auto pb-4' : ''}
        ${layout === 'masonry' ? 'columns-1 md:columns-2 lg:columns-3 gap-6' : ''}
      `}>
        {images.map((image: any, index: number) => {
          const caption = locale === 'en' ? image.caption_en : image.caption_es
          
          return (
            <div 
              key={index} 
              className={`
                ${layout === 'carousel' ? 'flex-none w-80' : ''}
                ${layout === 'masonry' ? 'break-inside-avoid mb-6' : ''}
                group cursor-pointer
              `}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={urlFor(image).width(600).height(450).url()}
                  alt={caption || `Gallery image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {caption && (
                <p className="mt-2 text-sm text-gray-600 text-center">{caption}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function VideoBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const description = locale === 'en' ? block.description_en : block.description_es

  const getVideoId = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    
    if (youtubeMatch) return { platform: 'youtube', id: youtubeMatch[1] }
    if (vimeoMatch) return { platform: 'vimeo', id: vimeoMatch[1] }
    return null
  }

  const video = getVideoId(block.videoUrl || '')

  return (
    <section className="container mx-auto px-4 py-16">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h2>
      )}
      {description && (
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">{description}</p>
      )}
      
      {video && (
        <div className="relative aspect-video max-w-4xl mx-auto rounded-lg overflow-hidden shadow-xl">
          {video.platform === 'youtube' && (
            <iframe
              src={`https://www.youtube.com/embed/${video.id}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
          {video.platform === 'vimeo' && (
            <iframe
              src={`https://player.vimeo.com/video/${video.id}`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
      )}
    </section>
  )
}

function FAQBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const { questions = [] } = block

  return (
    <section className="container mx-auto px-4 py-16">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{title}</h2>
      )}
      <div className="max-w-3xl mx-auto space-y-4">
        {questions.map((item: any, index: number) => {
          const question = locale === 'en' ? item.question_en : item.question_es
          const answer = locale === 'en' ? item.answer_en : item.answer_es

          return (
            <details key={index} className="group bg-white rounded-lg shadow-md p-6">
              <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors">
                {question}
              </summary>
              <div className="mt-4 text-gray-600 prose prose-sm">
                <p>{answer}</p>
              </div>
            </details>
          )
        })}
      </div>
    </section>
  )
}

function CTABannerBlock({ block, locale }: { block: any; locale: string }) {
  const title = locale === 'en' ? block.title_en : block.title_es
  const description = locale === 'en' ? block.description_en : block.description_es
  const primaryCtaText = locale === 'en' ? block.primaryCta?.text_en : block.primaryCta?.text_es
  const secondaryCtaText = locale === 'en' ? block.secondaryCta?.text_en : block.secondaryCta?.text_es

  return (
    <section className="relative py-24 text-white overflow-hidden">
      {block.backgroundImage && (
        <>
          <Image
            src={urlFor(block.backgroundImage).width(1920).height(600).url()}
            alt={title || ''}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </>
      )}
      <div className="relative z-10 container mx-auto px-4 text-center">
        {title && (
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{title}</h2>
        )}
        {description && (
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">{description}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {block.primaryCta?.url && primaryCtaText && (
            <Link
              href={block.primaryCta.url}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              {primaryCtaText}
            </Link>
          )}
          {block.secondaryCta?.url && secondaryCtaText && (
            <Link
              href={block.secondaryCta.url}
              className="border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}