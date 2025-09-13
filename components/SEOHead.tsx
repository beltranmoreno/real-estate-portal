import { Metadata } from 'next'

interface SEOData {
  metaTitle_en?: string
  metaTitle_es?: string
  metaDescription_en?: string
  metaDescription_es?: string
  canonicalUrl?: string
  ogImage?: any
  keywords_en?: string[]
  keywords_es?: string[]
  noIndex?: boolean
  noFollow?: boolean
}

interface SEOHeadProps {
  seo?: SEOData
  title?: string
  description?: string
  locale: 'en' | 'es'
  type?: 'website' | 'article'
  structuredData?: any
  images?: string[]
}

export function generateMetadata({
  seo,
  title,
  description,
  locale = 'en',
  type = 'website',
  structuredData,
  images = []
}: SEOHeadProps): Metadata {
  const metaTitle = locale === 'en' 
    ? seo?.metaTitle_en || title 
    : seo?.metaTitle_es || title
  
  const metaDescription = locale === 'en' 
    ? seo?.metaDescription_en || description 
    : seo?.metaDescription_es || description

  const keywords = locale === 'en' 
    ? seo?.keywords_en || [] 
    : seo?.keywords_es || []

  const ogImageUrl = seo?.ogImage?.asset?.url || images[0]
  const canonicalUrl = seo?.canonicalUrl

  const metadata: Metadata = {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords.join(', '),
    robots: {
      index: !seo?.noIndex,
      follow: !seo?.noFollow,
      googleBot: {
        index: !seo?.noIndex,
        follow: !seo?.noFollow
      }
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: type,
      locale: locale === 'en' ? 'en_US' : 'es_ES',
      images: ogImageUrl ? [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: metaTitle
      }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: ogImageUrl ? [ogImageUrl] : undefined
    },
    alternates: canonicalUrl ? {
      canonical: canonicalUrl
    } : undefined
  }

  return metadata
}

export function generateStructuredData(data: any, type: string, locale: 'en' | 'es') {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casadecampo.com'
  
  switch (type) {
    case 'infoPage':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: locale === 'en' ? data.title_en : data.title_es,
        description: locale === 'en' ? data.intro_en : data.intro_es,
        url: `${baseUrl}/info/${data.slug}`,
        image: data.heroImage?.asset?.url,
        publisher: {
          '@type': 'Organization',
          name: 'Casa de Campo Resort',
          logo: `${baseUrl}/logo.png`
        }
      }

    case 'golfCourse':
      return {
        '@context': 'https://schema.org',
        '@type': 'GolfCourse',
        name: locale === 'en' ? data.name_en : data.name_es,
        description: locale === 'en' ? data.summary_en : data.summary_es,
        url: `${baseUrl}/courses/${data.slug}`,
        image: data.media?.images?.[0]?.asset?.url,
        address: {
          '@type': 'PostalAddress',
          streetAddress: locale === 'en' ? data.location?.address_en : data.location?.address_es,
          addressCountry: 'DO'
        },
        geo: data.location?.coordinates ? {
          '@type': 'GeoCoordinates',
          latitude: data.location.coordinates.lat,
          longitude: data.location.coordinates.lng
        } : undefined,
        telephone: data.contact?.phone,
        email: data.contact?.email,
        priceRange: data.pricing?.greenFees?.length > 0 ? '$$$' : undefined,
        amenityFeature: data.amenities?.map((amenity: any) => ({
          '@type': 'LocationFeatureSpecification',
          name: locale === 'en' ? amenity.name_en : amenity.name_es
        }))
      }

    case 'restaurant':
      return {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: locale === 'en' ? data.name_en : data.name_es,
        description: locale === 'en' ? data.summary_en : data.summary_es,
        url: `${baseUrl}/restaurants/${data.slug}`,
        image: data.media?.featuredImage?.asset?.url,
        servesCuisine: data.cuisine,
        priceRange: data.pricing?.priceRange,
        address: {
          '@type': 'PostalAddress',
          streetAddress: locale === 'en' ? data.contact?.address_en : data.contact?.address_es,
          addressCountry: 'DO'
        },
        geo: data.contact?.coordinates ? {
          '@type': 'GeoCoordinates',
          latitude: data.contact.coordinates.lat,
          longitude: data.contact.coordinates.lng
        } : undefined,
        telephone: data.contact?.phone,
        email: data.contact?.email,
        openingHours: data.hours?.schedule?.map((day: any) => {
          if (day.closed) return null
          return `${day.day_en} ${day.openTime}-${day.closeTime}`
        }).filter(Boolean),
        acceptsReservations: !!data.contact?.reservationUrl,
        aggregateRating: data.rating ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating.average,
          reviewCount: data.rating.count
        } : undefined
      }

    default:
      return null
  }
}