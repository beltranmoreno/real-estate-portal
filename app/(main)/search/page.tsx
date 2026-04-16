import type { Metadata } from 'next'
import SearchPageClient from './SearchPageClient'
import { searchProperties } from '@/lib/sanity/queries'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Generate metadata dynamically: the bare /search URL is indexable,
// but any filtered variant (checkIn=..., bedrooms=..., etc.) is noindexed
// to avoid Google crawling the combinatorial explosion of filter permutations.
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = Object.keys(params).some(
    (key) => key !== 'lang' && params[key] !== undefined && params[key] !== ''
  )

  return {
    title: 'Search Properties in Casa de Campo',
    description:
      'Browse villas, condos, and houses for rent and sale in Casa de Campo. Filter by bedrooms, amenities, beachfront, golf, and more.',
    alternates: {
      canonical: '/search',
    },
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
  }
}

async function getInitialProperties(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    // Convert search params to the format expected by searchProperties
    const queryParams: any = {
      limit: parseInt(searchParams.limit as string) || 12,
      page: parseInt(searchParams.page as string) || 1,
      sortBy: searchParams.sortBy as string || 'featured',
      listingType: searchParams.listingType as string || 'rental'
    }

    // Add optional parameters
    if (searchParams.checkIn) queryParams.checkIn = searchParams.checkIn as string
    if (searchParams.checkOut) queryParams.checkOut = searchParams.checkOut as string
    if (searchParams.bedrooms) queryParams.bedrooms = searchParams.bedrooms as string
    if (searchParams.exactBedrooms) queryParams.exactBedrooms = searchParams.exactBedrooms === 'true'
    if (searchParams.guests) queryParams.guests = searchParams.guests as string
    if (searchParams.golf) queryParams.golf = searchParams.golf === 'true'
    if (searchParams.generator) queryParams.generator = searchParams.generator === 'true'
    if (searchParams.pool) queryParams.pool = searchParams.pool === 'true'
    if (searchParams.beachAccess) queryParams.beachAccess = searchParams.beachAccess === 'true'
    if (searchParams.airConditioning) queryParams.airConditioning = searchParams.airConditioning === 'true'
    if (searchParams.wifi) queryParams.wifi = searchParams.wifi === 'true'
    if (searchParams.kitchen) queryParams.kitchen = searchParams.kitchen === 'true'
    if (searchParams.laundry) queryParams.laundry = searchParams.laundry === 'true'
    if (searchParams.parking) queryParams.parking = searchParams.parking === 'true'
    if (searchParams.bbq) queryParams.bbq = searchParams.bbq === 'true'
    if (searchParams.terrace) queryParams.terrace = searchParams.terrace === 'true'
    if (searchParams.oceanView) queryParams.oceanView = searchParams.oceanView === 'true'

    if (searchParams.themes) {
      const themes = Array.isArray(searchParams.themes)
        ? searchParams.themes
        : searchParams.themes.split(',')
      queryParams.themes = themes
    }

    return await searchProperties(queryParams)
  } catch (error) {
    console.error('Error fetching initial properties:', error)
    return {
      properties: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    }
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams
  const data = await getInitialProperties(resolvedSearchParams)
  
  return <SearchPageClient initialProperties={data.properties} initialPagination={data.pagination} />
}