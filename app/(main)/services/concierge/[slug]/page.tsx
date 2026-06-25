import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import ConciergeDetailClient from './ConciergeDetailClient'

export const revalidate = 3600

interface ConciergeServiceImage {
  asset?: {
    _ref?: string
  }
  alt?: string
  caption_en?: string
  caption_es?: string
}

export interface ConciergeServiceDetail {
  _id: string
  slug: string
  name_en?: string
  name_es?: string
  shortDescription_en?: string
  shortDescription_es?: string
  longDescription_en?: string
  longDescription_es?: string
  category:
    | 'arrival'
    | 'dining'
    | 'wellness'
    | 'family'
    | 'ocean'
    | 'events'
    | 'private'
    | 'sports'
  icon: string
  image?: any
  heroImage?: any
  gallery?: ConciergeServiceImage[]
  priceFrom?: {
    amount?: number
    currency?: string
    unit?: string
  }
  isFeatured?: boolean
  hasDetailPage?: boolean
  contactCtaLabel_en?: string
  contactCtaLabel_es?: string
  tiers?: Array<{
    _key?: string
    name_en?: string
    name_es?: string
    description_en?: string
    description_es?: string
    features_en?: string[]
    features_es?: string[]
    priceLabel?: string
    image?: any
  }>
}

async function getServiceBySlug(
  slug: string
): Promise<ConciergeServiceDetail | null> {
  const query = `*[_type == "conciergeService" && slug.current == $slug && isActive == true][0] {
    _id,
    "slug": slug.current,
    name_en,
    name_es,
    shortDescription_en,
    shortDescription_es,
    longDescription_en,
    longDescription_es,
    category,
    icon,
    image,
    heroImage,
    gallery[]{
      ...,
      alt,
      caption_en,
      caption_es
    },
    priceFrom,
    isFeatured,
    hasDetailPage,
    contactCtaLabel_en,
    contactCtaLabel_es,
    tiers[]{
      _key,
      name_en,
      name_es,
      description_en,
      description_es,
      features_en,
      features_es,
      priceLabel,
      image
    }
  }`
  try {
    return (await client.fetch(query, { slug })) as ConciergeServiceDetail | null
  } catch (err) {
    console.error('[concierge/[slug]] fetch failed', err)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) {
    return { title: 'Service Not Found' }
  }
  const title = service.name_en || service.name_es || 'Concierge Service'
  const description =
    service.shortDescription_en || service.shortDescription_es || undefined
  return {
    title: `${title} · Concierge`,
    description,
    alternates: {
      canonical: `/services/concierge/${service.slug}`,
    },
  }
}

export default async function ConciergeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)

  // Treat services without an active detail page as 404 so we don't
  // ship a half-rendered shell for cards that haven't been upgraded.
  if (!service || !service.hasDetailPage) {
    notFound()
  }

  return <ConciergeDetailClient service={service} />
}

export async function generateStaticParams() {
  const query = `*[_type == "conciergeService" && hasDetailPage == true && isActive == true]{
    "slug": slug.current
  }`
  const services = (await client.fetch(query)) as Array<{ slug: string }>
  return services
    .filter((s) => s.slug)
    .map((s) => ({ slug: s.slug }))
}
