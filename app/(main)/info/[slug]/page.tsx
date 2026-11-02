import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createSEOMetadata, generateStructuredData } from '@/components/SEOHead'
import InfoPageClient from './InfoPageClient'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'
import { getActivityGroups } from '@/lib/activities'
import { getPageHero } from '@/lib/pageHero'

interface InfoPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getInfoPage(slug: string) {
  const query = `*[_type == "infoPage" && slug.current == $slug && status == "published"][0] {
    _id,
    title_en,
    title_es,
    "slug": slug.current,
    heroImage {
      asset -> {
        ...,
        url
      }
    },
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
    next: { revalidate: SANITY_REVALIDATE } // Revalidate every hour
  })

  return infoPage
}

/**
 * The Activities guide: its hero is Page Heroes → Activities, then one
 * section per Activity group (Local Guide → Activity groups). It still
 * renders when no Activities info page has been written, so the menu link
 * never 404s; the info page's title and intro are only used for SEO.
 */
const ACTIVITIES_SLUG = 'activities'
const ACTIVITIES_FALLBACK = {
  _id: 'activities-fallback',
  slug: ACTIVITIES_SLUG,
  title_en: 'Activities',
  title_es: 'Actividades',
  intro_en:
    'Tennis, padel, polo, horseback riding, sport fishing, the shooting center and wellness — one of the Caribbean’s most complete collections of sporting and outdoor experiences.',
  intro_es:
    'Tenis, pádel, polo, equitación, pesca deportiva, el centro de tiro y bienestar — una de las propuestas deportivas y al aire libre más completas del Caribe.',
  content: [],
}

async function getShops() {
  try {
    return await client.fetch(
      `*[_type == "shop" && isActive != false && !(category in $services)] | order(coalesce(order, 999) asc, name asc) {
        _id, name, location, category, summary_en, summary_es, hours, website, googleMapsUrl
      }`,
      // Everyday services (banks, pharmacies…) live on the resort guides, not under Shopping.
      { services: ['pharmacy', 'banking', 'marine', 'hardware'] },
      { next: { revalidate: SANITY_REVALIDATE } }
    )
  } catch (err) {
    console.error('[info] shops fetch failed', err)
    return []
  }
}

/** The other published guides, for the "More of Casa de Campo" list. */
async function getOtherGuides(slug: string) {
  try {
    return await client.fetch(
      // Nightlife, yacht charters and beaches are retired guides (redirected elsewhere).
      `*[_type == "infoPage" && status == "published" && slug.current != $slug
          && !(slug.current in ["nightlife", "yacht-charters", "beaches"])]
        | order(title_en asc) {
          _id, title_en, title_es, intro_en, intro_es, "slug": slug.current
        }`,
      { slug },
      { next: { revalidate: SANITY_REVALIDATE } }
    )
  } catch (err) {
    console.error('[info] other guides fetch failed', err)
    return []
  }
}

export async function generateMetadata(
  { params }: InfoPageProps
): Promise<Metadata> {
  const { slug } = await params
  const infoPage =
    (await getInfoPage(slug)) ??
    (slug === ACTIVITIES_SLUG ? ACTIVITIES_FALLBACK : null)

  if (!infoPage) {
    return {
      title: 'Page Not Found'
    }
  }

  const locale = 'en' // You might want to get this from searchParams or cookies
  const images = (infoPage as any).heroImage?.asset?.url ? [(infoPage as any).heroImage.asset.url] : []

  return createSEOMetadata({
    seo: (infoPage as any).seo,
    title: locale === 'en' ? infoPage.title_en : infoPage.title_es,
    description: locale === 'en' ? infoPage.intro_en : infoPage.intro_es,
    locale,
    type: 'article',
    images
  })
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = await params
  const isActivities = slug === ACTIVITIES_SLUG
  const [doc, otherGuides, activityGroups, shops, activitiesHero] = await Promise.all([
    getInfoPage(slug),
    getOtherGuides(slug),
    isActivities ? getActivityGroups() : Promise.resolve([]),
    isActivities ? getShops() : Promise.resolve([]),
    isActivities ? getPageHero('activities') : Promise.resolve(null),
  ])
  const infoPage = doc ?? (isActivities ? ACTIVITIES_FALLBACK : null)

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

      <InfoPageClient
        infoPage={infoPage}
        otherGuides={otherGuides}
        activityGroups={activityGroups}
        heroPage={isActivities ? 'activities' : undefined}
        heroDoc={activitiesHero}
        shops={shops}
      />
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