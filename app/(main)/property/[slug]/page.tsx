import { notFound } from 'next/navigation'
import PropertyDetailClient from './PropertyDetailClient'
import { client } from '@/sanity/lib/client'

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
      address_es,
      address_en,
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
      description: 'The requested property could not be found.'
    }
  }

  return {
    title: property.seo?.metaTitle_en || property.title_en || 'Property Details',
    description: property.seo?.metaDescription_en || property.shortDescription_en || property.description_en,
    openGraph: {
      title: property.title_en,
      description: property.shortDescription_en,
      images: property.seo?.ogImage ? [property.seo.ogImage] : property.mainImage ? [property.mainImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title_en,
      description: property.shortDescription_en,
    }
  }
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) {
    notFound()
  }

  return <PropertyDetailClient property={property} />
}