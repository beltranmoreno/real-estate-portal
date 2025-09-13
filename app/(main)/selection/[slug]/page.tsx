import { notFound } from 'next/navigation'
import CollectionClient from './CollectionClient'
import { Metadata } from 'next'

interface CollectionPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    accessCode?: string
  }>
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
async function getCollection(slug: string, accessCode?: string) {
  try {
    const baseUrl = getBaseUrl()
    const url = new URL(`${baseUrl}/api/collection`)
    url.searchParams.set('slug', slug)
    if (accessCode) {
      url.searchParams.set('accessCode', accessCode)
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store' // Always fetch fresh data for collections
    })

    if (!response.ok) {
      if (response.status === 404) return null
      if (response.status === 401 || response.status === 410) {
        return { error: await response.json() }
      }
      throw new Error(`Failed to fetch collection: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export async function generateMetadata({ params, searchParams }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params
  const { accessCode } = await searchParams
  const collection = await getCollection(slug, accessCode)
  
  if (!collection || collection.error) {
    return {
      title: 'Collection Not Found',
      description: 'The requested collection could not be found.'
    }
  }

  return {
    title: collection.title.en || 'Property Collection',
    description: collection.description.en || 'Curated selection of properties',
    openGraph: {
      title: collection.title.en,
      description: collection.description.en,
      images: collection.coverImage ? [collection.coverImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title.en,
      description: collection.description.en,
    }
  }
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params
  const { accessCode } = await searchParams
  const collection = await getCollection(slug, accessCode)

  if (!collection) {
    notFound()
  }

  if (collection.error) {
    // Handle specific error cases (expired, requires access code, etc.)
    return <CollectionClient collection={null} error={collection.error} slug={slug} />
  }

  return <CollectionClient collection={collection} slug={slug} />
}