import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
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
  email?: string
  phone?: string
  whatsapp?: string
  yearsExperience?: number
  specializations?: string[]
  languages?: string[]
  certifications?: Array<{ title: string; issuer?: string; year?: number }>
  facebook?: string
  instagram?: string
  linkedin?: string
  isFeatured?: boolean
}

export interface AboutAreaSummary {
  _id: string
  title_en?: string
  title_es?: string
  slug?: string
}

interface AboutData {
  agents: AboutAgent[]
  areas: AboutAreaSummary[]
  propertyCount: number
}

async function getAboutData(): Promise<AboutData> {
  const query = `{
    "agents": *[_type == "agent" && isActive == true] | order(featured desc, yearsExperience desc, name asc) {
      _id,
      name,
      "slug": slug.current,
      photo,
      bio_en,
      bio_es,
      email,
      phone,
      whatsapp,
      yearsExperience,
      specializations,
      languages,
      certifications,
      facebook,
      instagram,
      linkedin,
      "isFeatured": featured
    },
    "areas": *[_type == "area"] | order(coalesce(order, 999) asc, title_en asc) [0...12] {
      _id,
      title_en,
      title_es,
      "slug": slug.current
    },
    "propertyCount": count(*[_type == "property" && status == "active"])
  }`

  try {
    return (await client.fetch(query)) as AboutData
  } catch (err) {
    console.error('[about] data fetch failed', err)
    return { agents: [], areas: [], propertyCount: 0 }
  }
}

export default async function AboutPage() {
  const data = await getAboutData()
  return <AboutPageClient {...data} />
}
