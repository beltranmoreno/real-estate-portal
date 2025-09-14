import { notFound } from 'next/navigation'
import CollectionClient from './CollectionClient'
import { Metadata } from 'next'
import { getCollection } from '@/lib/sanity/queries'

interface CollectionPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    accessCode?: string
  }>
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