import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'

interface MediaItem {
  _id: string
  title_en: string
  title_es: string
  description_en?: string
  description_es?: string
  mediaType: 'image' | 'video'
  image?: any
  videoUrl?: string
  videoThumbnail?: any
  videoDuration?: number
  topics: string[]
  isFeatured: boolean
  priority: number
  location?: string
  photographer?: string
  captureDate?: string
}

interface UseMediaOptions {
  topics?: string[]
  featured?: boolean
  mediaType?: 'image' | 'video'
  location?: string
  limit?: number
}

export function useMedia(options: UseMediaOptions = {}) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMedia() {
      try {
        setLoading(true)
        setError(null)

        // Build query filters
        const filters = ['_type == "featuredMedia"', 'status == "published"']
        
        if (options.topics && options.topics.length > 0) {
          const topicFilter = options.topics.map(topic => `"${topic}" in topics`).join(' || ')
          filters.push(`(${topicFilter})`)
        }
        
        if (options.featured !== undefined) {
          filters.push(`isFeatured == ${options.featured}`)
        }
        
        if (options.mediaType) {
          filters.push(`mediaType == "${options.mediaType}"`)
        }
        
        if (options.location) {
          filters.push(`location == "${options.location}"`)
        }

        const whereClause = filters.join(' && ')
        const orderClause = 'isFeatured desc, priority desc, title_en asc'
        const limitClause = options.limit ? `[0...${options.limit}]` : ''

        const query = `*[${whereClause}] | order(${orderClause}) ${limitClause} {
          _id,
          title_en,
          title_es,
          description_en,
          description_es,
          mediaType,
          image {
            ...,
            alt
          },
          videoUrl,
          videoThumbnail {
            ...,
            alt
          },
          videoDuration,
          topics,
          isFeatured,
          priority,
          location,
          photographer,
          captureDate
        }`

        const result = await client.fetch(query)
        setMedia(result)
      } catch (err) {
        console.error('Error fetching media:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch media')
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [
    JSON.stringify(options.topics),
    options.featured,
    options.mediaType,
    options.location,
    options.limit
  ])

  return { media, loading, error }
}

// Helper function to get media by specific topics
export function useMediaByTopics(topics: string[], limit?: number) {
  return useMedia({ topics, limit })
}

// Helper function to get featured media only
export function useFeaturedMedia(limit?: number) {
  return useMedia({ featured: true, limit })
}

// Helper function to get media by type
export function useMediaByType(mediaType: 'image' | 'video', limit?: number) {
  return useMedia({ mediaType, limit })
}