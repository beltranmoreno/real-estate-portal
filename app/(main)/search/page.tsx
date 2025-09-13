import SearchPageClient from './SearchPageClient'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // use relative URL in browser

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return `http://localhost:${process.env.PORT ?? 3000}`
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
    
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/search?${params.toString()}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch properties')
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