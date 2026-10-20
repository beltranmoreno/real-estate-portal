import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import OwnersPageClient from './OwnersPageClient'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'
import { getPageHero } from '@/lib/pageHero'


export const metadata: Metadata = {
  title: 'For Owners · Leticia Coudray Real Estate',
  description:
    'Rental management and sales representation for villa owners in Casa de Campo. A small, hand-picked portfolio, vetted guests, concierge during every stay, and discreet private sales.',
  alternates: {
    canonical: '/owners',
    languages: {
      'en-US': '/owners?lang=en',
      'es-DO': '/owners?lang=es',
      'x-default': '/owners',
    },
  },
}

async function getHeroImage() {
  // Same photography as the homepage hero, so the resort looks consistent.
  const query = `coalesce(
    *[_id == "homepageMediaConfig"][0].heroImages[2],
    *[_id == "homepageMediaConfig"][0].heroImages[0]
  )`
  try {
    return await client.fetch(query, {}, { next: { revalidate: SANITY_REVALIDATE } })
  } catch (err) {
    console.error('[owners] hero image fetch failed', err)
    return null
  }
}

export default async function OwnersPage() {
  const [heroImage, hero] = await Promise.all([getHeroImage(), getPageHero('owners')])
  const heroImageUrl = heroImage?.asset
    ? urlFor(heroImage).width(2400).height(1000).quality(80).url()
    : null
  return <OwnersPageClient heroImageUrl={heroImageUrl} hero={hero} />
}
