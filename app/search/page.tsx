import SearchPageClient from './SearchPageClient'

async function getInitialProperties() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/search?limit=12`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch properties')
    }
    
    const data = await response.json()
    return data.properties || []
  } catch (error) {
    console.error('Error fetching initial properties:', error)
    return []
  }
}

export default async function SearchPage() {
  const initialProperties = await getInitialProperties()
  
  return <SearchPageClient initialProperties={initialProperties} />
}