'use client'

import { useEffect, useState } from 'react'
import { useMediaByTopicsAndLocations } from '@/lib/hooks/useMedia'
import MediaGallery from '@/components/MediaGallery'
import { useLocale } from '@/contexts/LocaleContext'
import { client } from '@/sanity/lib/client'

interface MediaConfig {
  topicsToShow: string[]
  locationsToShow: string[]
  maxItems: number
}

export default function HomepageMediaSection() {
  const { t } = useLocale()
  const [config, setConfig] = useState<MediaConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)

  // Fetch homepage media configuration
  useEffect(() => {
    async function fetchConfig() {
      try {
        const query = `*[_type == "homepageMediaConfig"][0] {
          topicsToShow,
          locationsToShow,
          maxItems
        }`
        
        const result = await client.fetch(query)
        setConfig(result || { 
          topicsToShow: ['golf', 'beach', 'luxury'], 
          locationsToShow: ['casa-de-campo', 'la-marina'],
          maxItems: 12 
        })
      } catch (error) {
        console.error('Error fetching homepage media config:', error)
        // Fallback config
        setConfig({ 
          topicsToShow: ['golf', 'beach', 'luxury'], 
          locationsToShow: ['casa-de-campo', 'la-marina'],
          maxItems: 12 
        })
      } finally {
        setConfigLoading(false)
      }
    }

    fetchConfig()
  }, [])

  // Use the hook to fetch media based on configured topics and locations
  const { media, loading: mediaLoading, error } = useMediaByTopicsAndLocations(
    config?.topicsToShow || [], 
    config?.locationsToShow || [],
    config?.maxItems || 12
  )

  const loading = configLoading || mediaLoading

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-stone-200 rounded-lg w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-stone-200 rounded w-80 mx-auto mb-8"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-stone-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    console.error('Error loading media:', error)
    return null // Gracefully fail
  }

  if (!media || media.length === 0) {
    return null // Don't show section if no media
  }

  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extralight text-stone-800 tracking-tight mb-6">
            {t({ en: 'Experience Casa de Campo', es: 'Vive Casa de Campo' })}
          </h2>
          <p className="text-xl text-stone-600 leading-relaxed max-w-3xl mx-auto font-light">
            {t({ 
              en: 'Discover the beauty, luxury, and unforgettable moments that await you in our tropical paradise',
              es: 'Descubre la belleza, el lujo y los momentos inolvidables que te esperan en nuestro paraíso tropical'
            })}
          </p>
          <div className="mt-8 flex items-center justify-center">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
            <div className="mx-4 w-2 h-2 bg-stone-400 rounded-full"></div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
          </div>
        </div>
        <MediaGallery 
          media={media}
          gridCols={3}
          showFeaturedFirst={true}
          maxItems={config?.maxItems || 12}
          showFilters={true}
          className="max-w-7xl mx-auto"
        />
      </div>
    </section>
  )
}