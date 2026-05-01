import { notFound } from 'next/navigation'
import PropertyDetailClient from './PropertyDetailClient'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leticiacoudrayrealestate.com'

interface PropertyDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getProperty(slug: string) {
  const query = `*[_type == "property" && slug.current == $slug && status == "active"][0] {
    _id,
    "slug": slug.current,
    title_es,
    title_en,
    description_es,
    description_en,
    shortDescription_es,
    shortDescription_en,
    propertyCode,
    propertyType,
    themes,
    isFeatured,
    mainImage,
    gallery,
    virtualTourUrl,
    videoUrl,
    floorPlan,
    "area": location.area->{
      _id,
      title_es,
      title_en,
      "slug": slug.current,
      region
    },
    location {
      street,
      customArea,
      city,
      country,
      postcode,
      isPrivateAddress,
      coordinates,
      nearbyAttractions,
      distanceToBeach,
      distanceToLaMarina,
      distanceToChavon,
      distanceToAirport,
      isBeachfront,
      isGolfCourse,
      locationHighlights_es,
      locationHighlights_en
    },
    amenities,
    pricing,
    availability,
    houseRules,
    "agent": agent->{
      _id,
      name,
      email,
      phone,
      whatsapp,
      photo,
      bio_en,
      bio_es,
      yearsExperience,
      specializations,
      languages,
      responseTime,
      licenseNumber
    },
    contactInfo,
    reviews,
    seo {
      metaTitle_es,
      metaTitle_en,
      metaDescription_es,
      metaDescription_en,
      ogImage
    },
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

  try {
    const property = await client.fetch(query, { slug })
    return property
  } catch (error) {
    console.error('Error fetching property:', error)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PropertyDetailPageProps) {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) {
    return {
      title: 'Property Not Found',
      description: 'The requested property could not be found.',
      robots: { index: false, follow: false },
    }
  }

  const title =
    property.seo?.metaTitle_en || property.title_en || 'Property Details'
  const titleEs = property.seo?.metaTitle_es || property.title_es || title
  const description =
    property.seo?.metaDescription_en ||
    property.shortDescription_en ||
    property.description_en
  const descriptionEs =
    property.seo?.metaDescription_es ||
    property.shortDescription_es ||
    property.description_es ||
    description

  // Prefer the SEO-specific OG image, fall back to the main image.
  // We use Sanity's image URL builder to get a perfectly-sized 1200x630
  // JPEG which is what every major platform wants for link previews.
  const ogImageSource = property.seo?.ogImage || property.mainImage
  const ogImageUrl = ogImageSource
    ? urlFor(ogImageSource).width(1200).height(630).fit('crop').url()
    : `${SITE_URL}/Logo_LCS_Real_Estate.png`

  const canonical = `/property/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'en-US': `${canonical}?lang=en`,
        'es-DO': `${canonical}?lang=es`,
        'x-default': canonical,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['es_DO'],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    other: {
      // Spanish-language alternate title as an additional OG tag so
      // WhatsApp/Facebook can pick it up when sharing with Spanish users.
      'og:title:es': titleEs,
      'og:description:es': descriptionEs,
    },
  }
}

/**
 * Build VacationRental / Product JSON-LD. Real estate rentals sit at
 * the intersection of several schemas; using VacationRental unlocks
 * Google Travel and "Things to do" rich results, while the Product
 * Offer block gives price-snippet coverage on regular search.
 */
function buildPropertyJsonLd(property: any, slug: string) {
  const url = `${SITE_URL}/property/${slug}`
  const mainImageUrl = property.mainImage
    ? urlFor(property.mainImage).width(1600).height(900).fit('crop').url()
    : undefined
  const galleryUrls = Array.isArray(property.gallery)
    ? property.gallery
        .slice(0, 10)
        .map((img: any) => {
          try {
            return urlFor(img).width(1600).height(900).fit('crop').url()
          } catch {
            return null
          }
        })
        .filter(Boolean)
    : []

  const images = [mainImageUrl, ...galleryUrls].filter(Boolean)

  const amenityFeatures: Array<{ '@type': string; name: string; value: boolean }> = []
  const amenities = property.amenities || {}
  const amenityMap: Record<string, string> = {
    hasPool: 'Swimming pool',
    hasPrivatePool: 'Private pool',
    hasBeachAccess: 'Beach access',
    hasPrivateBeach: 'Private beach',
    hasWifi: 'WiFi',
    hasHighSpeedInternet: 'High-speed internet',
    hasAirConditioning: 'Air conditioning',
    hasFullKitchen: 'Full kitchen',
    hasParking: 'Parking',
    hasWasher: 'Washer',
    hasDryer: 'Dryer',
    hasGolfCart: 'Golf cart',
    hasGenerator: 'Backup generator',
    hasGym: 'Gym',
    hasHotTub: 'Hot tub',
    hasBBQ: 'BBQ grill',
    // Staff fields hold 'included' | 'onRequest' | undefined. We only
    // emit them as `value: true` amenityFeature when 'included', because
    // schema.org's `value: true` means it's part of the rental.
    hasHousekeeping: 'Housekeeping',
    hasChef: 'Private chef',
    hasButler: 'Butler',
    hasCook: 'Cook',
    hasSecuritySystem: 'Security system',
    hasSecurity: 'Private security',
  }
  // Staff fields use 'included' | 'onRequest' instead of boolean. Only
  // 'included' counts as a "yes, this is part of the rental" amenityFeature
  // for schema.org. 'onRequest' is intentionally omitted from JSON-LD so
  // we don't mislead Google into thinking it's bundled.
  const STAFF_KEYS = new Set([
    'hasHousekeeping',
    'hasChef',
    'hasCook',
    'hasButler',
  ])
  for (const [key, label] of Object.entries(amenityMap)) {
    const value = amenities[key]
    if (!value) continue
    if (STAFF_KEYS.has(key) && value !== 'included') continue
    amenityFeatures.push({
      '@type': 'LocationFeatureSpecification',
      name: label,
      value: true,
    })
  }

  const nightlyRate = property.pricing?.rentalPricing?.nightlyRate?.amount
  const salePrice = property.pricing?.salePricing?.salePrice?.amount
  const listingType = property.pricing?.type

  const offers: any[] = []
  if (listingType !== 'sale' && nightlyRate && !property.pricing?.rentalPricing?.priceOnRequest) {
    offers.push({
      '@type': 'Offer',
      name: 'Nightly rental rate',
      price: nightlyRate,
      priceCurrency: property.pricing?.rentalPricing?.nightlyRate?.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    })
  }
  if (listingType !== 'rental' && salePrice && !property.pricing?.salePricing?.priceOnRequest) {
    offers.push({
      '@type': 'Offer',
      name: 'Sale price',
      price: salePrice,
      priceCurrency: property.pricing?.salePricing?.salePrice?.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url,
    })
  }

  const reviews = property.reviews
  const aggregateRating =
    reviews?.averageRating && reviews?.totalReviews
      ? {
          '@type': 'AggregateRating',
          ratingValue: reviews.averageRating,
          reviewCount: reviews.totalReviews,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': listingType === 'sale' ? 'Product' : 'VacationRental',
    '@id': `${url}#property`,
    name: property.title_en || property.title_es,
    description:
      property.shortDescription_en ||
      property.description_en ||
      property.shortDescription_es,
    url,
    image: images.length > 0 ? images : undefined,
    identifier: property.propertyCode,
    numberOfRooms: amenities.bedrooms,
    occupancy: amenities.maxGuests
      ? {
          '@type': 'QuantitativeValue',
          maxValue: amenities.maxGuests,
          unitText: 'person',
        }
      : undefined,
    floorSize: amenities.squareMeters
      ? {
          '@type': 'QuantitativeValue',
          value: amenities.squareMeters,
          unitCode: 'MTK',
        }
      : undefined,
    amenityFeature: amenityFeatures.length > 0 ? amenityFeatures : undefined,
    address: {
      '@type': 'PostalAddress',
      // Omit the exact street from public structured data when the owner
      // has flagged it as private. City/region/country still appear so
      // search engines know the general area.
      streetAddress: property.location?.isPrivateAddress
        ? undefined
        : property.location?.street,
      addressLocality:
        property.location?.city ||
        property.area?.title_en ||
        'La Romana',
      addressRegion:
        property.area?.title_en || property.location?.customArea || property.area?.region,
      postalCode: property.location?.postcode,
      addressCountry: property.location?.country || 'Dominican Republic',
    },
    geo: property.location?.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.location.coordinates.lat,
          longitude: property.location.coordinates.lng,
        }
      : undefined,
    brand: {
      '@id': `${SITE_URL}#organization`,
    },
    offers: offers.length > 0 ? offers : undefined,
    aggregateRating,
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) {
    notFound()
  }

  const jsonLd = buildPropertyJsonLd(property, slug)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetailClient property={property} />
    </>
  )
}