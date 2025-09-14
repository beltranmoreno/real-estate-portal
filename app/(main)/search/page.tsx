import SearchPageClient from './SearchPageClient'
import { getApiUrl } from '@/lib/utils/url'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getInitialProperties(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    // Build the query string from search params
    const params = new URLSearchParams()
    
    // Add all search parameters to the API call
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else {
          params.set(key, value.toString())
        }
      }
    })
    
    // Ensure we have a limit
    if (!params.has('limit')) {
      params.set('limit', '12')
    }
    
    const url = getApiUrl(`/api/search?${params.toString()}`)
    console.log('Fetching search results from:', url)

    const response = await fetch(url, {
      cache: 'no-store'
    })

    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      throw new Error(`Failed to fetch properties: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching initial properties:', error)
    return { properties: [], pagination: null }
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams
  const data = await getInitialProperties(resolvedSearchParams)
  
  return <SearchPageClient initialProperties={data.properties} initialPagination={data.pagination} />
}