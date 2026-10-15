import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { generateMetadata as createSEOMetadata, generateStructuredData } from '@/components/SEOHead'
import InfoPageClient from './InfoPageClient'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'

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
 * The Activities guide lists the Activity docs (Local Guide → Activities)
 * under its own content, and still renders when no Activities info page has
 * been written yet, so the menu link never 404s.
 */
const ACTIVITIES_SLUG = 'activities'
const ACTIVITIES_FALLBACK = {
  _id: 'activities-fallback',
  slug: ACTIVITIES_SLUG,
  title_en: 'Activities',
  title_es: 'Actividades',
  intro_en:
    'Golf, tennis, the shooting center, days on the water and island trips — everything there is to do in and around Casa de Campo.',
  intro_es:
    'Golf, tenis, el centro de tiro, días en el agua y excursiones a las islas — todo lo que hay para hacer en Casa de Campo y sus alrededores.',
  content: [],
}

async function getActivities() {
  try {
    return await client.fetch(
      `*[_type == "activity" && isActive != false] | order(coalesce(order, 999) asc, name_en asc) {
        _id, name_en, name_es, category, summary_en, summary_es, image,
        "where": location->{ name_en, name_es }
      }`,
      {},
      { next: { revalidate: SANITY_REVALIDATE } }
    )
  } catch (err) {
    console.error('[info] activities fetch failed', err)
    return []
  }
}

/**
 * The Beaches guide is "Minitas & beyond": the resort's own beach, built
 * from the Minitas restaurants/bars, activities and shops in Studio, plus the
 * beaches guests go to beyond the resort.
 */
const BEACHES_SLUG = 'beaches'
const BEACHES_FALLBACK = {
  _id: 'beaches-fallback',
  slug: BEACHES_SLUG,
  title_en: 'Playa Minitas',
  title_es: 'Playa Minitas',
  intro_en:
    'The resort has one beach, and it’s a good one. Here’s what’s on at Minitas — and the beaches worth the short trip beyond it.',
  intro_es:
    'El resort tiene una playa, y es muy buena. Esto es lo que hay en Minitas — y las playas que valen el corto viaje más allá.',
  content: [],
}

async function getBeachData() {
  try {
    return await client.fetch(
      `{
        "venues": *[_type == "restaurant" && status == "published" && area == "beach-club"]
          | order(coalesce(order, 999) asc, name_en asc) {
            _id, "slug": slug.current, name_en, name_es, summary_en, summary_es, venueType
          },
        "activities": *[_type == "activity" && isActive != false && location->category == "beach_club"]
          | order(coalesce(order, 999) asc, name_en asc) {
            _id, name_en, name_es, summary_en, summary_es
          },
        "shops": *[_type == "shop" && isActive != false && location == "beach"]
          | order(coalesce(order, 999) asc, name asc) {
            _id, name, summary_en, summary_es
          }
      }`,
      {},
      { next: { revalidate: SANITY_REVALIDATE } }
    )
  } catch (err) {
    console.error('[info] beach data fetch failed', err)
    return { venues: [], activities: [], shops: [] }
  }
}

async function getShops() {
  try {
    return await client.fetch(
      `*[_type == "shop" && isActive != false] | order(coalesce(order, 999) asc, name asc) {
        _id, name, location, category, summary_en, summary_es, hours, website
      }`,
      {},
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
      // Nightlife and yacht charters are retired guides (redirected elsewhere).
      `*[_type == "infoPage" && status == "published" && slug.current != $slug
          && !(slug.current in ["nightlife", "yacht-charters"])]
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
    (slug === ACTIVITIES_SLUG ? ACTIVITIES_FALLBACK : slug === BEACHES_SLUG ? BEACHES_FALLBACK : null)

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
  const isBeaches = slug === BEACHES_SLUG
  const [doc, otherGuides, activities, shops, beach] = await Promise.all([
    getInfoPage(slug),
    getOtherGuides(slug),
    isActivities ? getActivities() : Promise.resolve([]),
    isActivities ? getShops() : Promise.resolve([]),
    isBeaches ? getBeachData() : Promise.resolve(null),
  ])
  const infoPage = doc ?? (isActivities ? ACTIVITIES_FALLBACK : isBeaches ? BEACHES_FALLBACK : null)

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
        activities={activities}
        shops={shops}
        beach={beach}
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