import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import ConciergePageClient from './ConciergePageClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Concierge Services',
  description:
    'Personal concierge services for guests renting through Leticia Coudray Real Estate — from airport transfers and grocery stocking to private chefs, boat charters, and curated experiences in Casa de Campo.',
  alternates: {
    canonical: '/services/concierge',
    languages: {
      'en-US': '/services/concierge?lang=en',
      'es-DO': '/services/concierge?lang=es',
      'x-default': '/services/concierge',
    },
  },
}

export interface ConciergeService {
  _id: string
  name_en?: string
  name_es?: string
  shortDescription_en?: string
  shortDescription_es?: string
  description_en?: string
  description_es?: string
  category: 'transport' | 'food' | 'experiences' | 'home' | 'wellness'
  icon: string
  image?: any
  priceFrom?: {
    amount?: number
    currency?: string
    unit?: string
  }
  isFeatured?: boolean
  order?: number
}

async function getServices(): Promise<ConciergeService[]> {
  const query = `*[_type == "conciergeService" && isActive == true] | order(category asc, coalesce(order, 999) asc, name_en asc) {
    _id,
    name_en,
    name_es,
    shortDescription_en,
    shortDescription_es,
    description_en,
    description_es,
    category,
    icon,
    image,
    priceFrom,
    "isFeatured": isFeatured,
    order
  }`
  try {
    return (await client.fetch(query)) as ConciergeService[]
  } catch (err) {
    console.error('[concierge] fetch failed', err)
    return []
  }
}

export default async function ConciergePage() {
  const services = await getServices()
  return <ConciergePageClient services={services} />
}
