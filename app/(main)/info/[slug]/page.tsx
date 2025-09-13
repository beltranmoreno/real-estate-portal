import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createSEOMetadata, generateStructuredData } from '@/components/SEOHead'
import InfoPageClient from './InfoPageClient'

interface InfoPageProps {
  params: Promise<{ slug: string }>
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getInfoPage(slug: string) {
  const query = `*[_type == "infoPage" && slug.current == $slug && status == "published"][0] {
    _id,
    title_en,
    title_es,
    "slug": slug.current,
    heroImage,
    intro_en,
    intro_es,
    content[] {
      _type,
      _key,
      _type == "hero" => {
        title_en,
        title_es,
        subtitle_en,
        subtitle_es,
        image,
        cta {
          text_en,
          text_es,
          url
        }
      },
      _type == "richText" => {
        title_en,
        title_es,
        content_en,
        content_es
      },
      _type == "imageGallery" => {
        title_en,
        title_es,
        layout,
        images[] {
          ...,
          caption_en,
          caption_es
        }
      },
      _type == "video" => {
        title_en,
        title_es,
        videoUrl,
        thumbnail,
        description_en,
        description_es
      },
      _type == "faq" => {
        title_en,
        title_es,
        questions[] {
          question_en,
          question_es,
          answer_en,
          answer_es
        }
      },
      _type == "ctaBanner" => {
        title_en,
        title_es,
        description_en,
        description_es,
        backgroundImage,
        primaryCta {
          text_en,
          text_es,
          url
        },
        secondaryCta {
          text_en,
          text_es,
          url
        }
      }
    },
    seo {
      metaTitle_en,
      metaTitle_es,
      metaDescription_en,
      metaDescription_es,
      canonicalUrl,
      ogImage,
      keywords_en,
      keywords_es,
      noIndex,
      noFollow
    },
    publishedAt,
    leticiaRecommendation {
      title_en,
      title_es,
      type,
      recommendation_en,
      recommendation_es,
      highlight_en,
      highlight_es,
      variant,
      isActive
    }
  }`

  const infoPage = await client.fetch(query, { slug }, {
    next: { revalidate: 3600 } // Revalidate every hour
  })

  return infoPage
}

export async function generateMetadata(
  { params }: InfoPageProps
): Promise<Metadata> {
  const { slug } = await params
  const infoPage = await getInfoPage(slug)
  
  if (!infoPage) {
    return {
      title: 'Page Not Found'
    }
  }

  const locale = 'en' // You might want to get this from searchParams or cookies
  const images = infoPage.heroImage ? [infoPage.heroImage.asset.url] : []

  return createSEOMetadata({
    seo: infoPage.seo,
    title: locale === 'en' ? infoPage.title_en : infoPage.title_es,
    description: locale === 'en' ? infoPage.intro_en : infoPage.intro_es,
    locale,
    type: 'article',
    images
  })
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params
  const infoPage = await getInfoPage(slug)

  if (!infoPage) {
    notFound()
  }

  const locale = 'en'
  const structuredData = generateStructuredData(infoPage, 'article', locale)

  return (
    <>
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}

      <InfoPageClient infoPage={infoPage} />
    </>
  )
}

export async function generateStaticParams() {
  const query = `*[_type == "infoPage" && status == "published"]{"slug": slug.current}`
  const pages = await client.fetch(query)

  return pages.map((page: any) => ({
    slug: page.slug
  }))
}