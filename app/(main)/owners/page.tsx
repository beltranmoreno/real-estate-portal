import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { fullImageUrl } from '@/sanity/lib/image'
import OwnersPageClient from './OwnersPageClient'
import { SANITY_REVALIDATE } from '@/lib/sanity/cache'
import { getPageHero } from '@/lib/pageHero'
import { OWNERS_PAGE_ID } from '@/sanity/lib/ownersPageDefaults'


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
  const [heroImage, hero, page] = await Promise.all([
    getHeroImage(),
    getPageHero('owners'),
    client
      .fetch(`*[_id == $id][0]`, { id: OWNERS_PAGE_ID }, { next: { revalidate: SANITY_REVALIDATE } })
      .catch((err) => {
        console.error('[owners] page doc fetch failed', err)
        return null
      }),
  ])
  const heroImageUrl = heroImage?.asset ? fullImageUrl(heroImage) : null
  return <OwnersPageClient heroImageUrl={heroImageUrl} hero={hero} page={page} />
}
