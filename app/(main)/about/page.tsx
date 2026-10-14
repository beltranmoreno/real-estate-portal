import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import AboutPageClient from './AboutPageClient'

export const revalidate = 3600 // refresh every hour

export const metadata: Metadata = {
  title: 'About Leticia Coudray Real Estate',
  description:
    'A boutique real estate firm specializing in Casa de Campo, Dominican Republic. Personal service, local expertise, and curated luxury homes.',
  alternates: {
    canonical: '/about',
    languages: {
      'en-US': '/about?lang=en',
      'es-DO': '/about?lang=es',
      'x-default': '/about',
    },
  },
}

export interface AboutAgent {
  _id: string
  name: string
  slug?: string
  photo?: any
  bio_en?: string
  bio_es?: string
  positionTitle_en?: string
  positionTitle_es?: string
  email?: string
  phone?: string
  whatsapp?: string
  yearsExperience?: number
  specializations?: string[]
  languages?: string[]
  instagram?: string
  isFeatured?: boolean
}

interface AboutData {
  agents: AboutAgent[]
  propertyCount: number
  conciergeCount: number
  sectorCount: number
  heroImage?: any
}

async function getAboutData(): Promise<AboutData> {
  const query = `{
    "agents": *[_type == "agent" && isActive == true] | order(coalesce(order, 9999) asc, name asc) {
      _id,
      name,
      "slug": slug.current,
      photo,
      bio_en,
      bio_es,
      positionTitle_en,
      positionTitle_es,
      email,
      phone,
      whatsapp,
      yearsExperience,
      specializations,
      languages,
      instagram,
      "isFeatured": featured
    },
    "propertyCount": count(*[_type == "property" && status == "active"]),
    "conciergeCount": count(*[_type == "conciergeService" && isActive == true]),
    // Sector names of active listings; deduplicated below, since Studio has
    // near-duplicate area docs (e.g. "Golf Villa" vs "Golf Villa ").
    "sectorNames": *[_type == "property" && status == "active" && defined(location.area)].location.area->title_en,
    // Same photography as the homepage hero, so the resort looks consistent.
    "heroImage": coalesce(
      *[_id == "homepageMediaConfig"][0].heroImages[1],
      *[_id == "homepageMediaConfig"][0].heroImages[0]
    )
  }`

  try {
    const { sectorNames, ...rest } = await client.fetch(query)
    const sectorCount = new Set(
      ((sectorNames ?? []) as (string | null)[])
        .filter((n): n is string => Boolean(n?.trim()))
        .map((n) => n.trim().toLowerCase())
    ).size
    return { ...rest, sectorCount } as AboutData
  } catch (err) {
    console.error('[about] data fetch failed', err)
    return { agents: [], propertyCount: 0, conciergeCount: 0, sectorCount: 0 }
  }
}

export default async function AboutPage() {
  const { heroImage, ...data } = await getAboutData()
  const heroImageUrl = heroImage?.asset
    ? urlFor(heroImage).width(2400).height(1000).quality(80).url()
    : null
  return <AboutPageClient {...data} heroImageUrl={heroImageUrl} />
}
