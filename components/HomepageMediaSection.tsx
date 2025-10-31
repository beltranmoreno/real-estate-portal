'use client'

import { useEffect, useState, useRef } from 'react'
import { useMediaByTopicsAndLocations } from '@/lib/hooks/useMedia'
import MediaSwiper from '@/components/MediaSwiper'
import { useLocale } from '@/contexts/LocaleContext'
import { client } from '@/sanity/lib/client'
import type { Swiper as SwiperType } from 'swiper'

interface MediaConfig {
  topicsToShow: string[]
  locationsToShow: string[]
  maxItems: number
}

export default function HomepageMediaSection() {
  const { t } = useLocale()
  const [config, setConfig] = useState<MediaConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<SwiperType | null>(null)

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

  // Transform media items to image items for MediaSwiper
  const images = media
    .filter(item => item.mediaType === 'image' && item.image)
    .map(item => ({
      _id: item._id,
      title_en: item.title_en,
      title_es: item.title_es,
      image: item.image,
      alt: item.title_en || item.title_es,
      location: item.location,
      photographer: item.photographer,
      captureDate: item.captureDate,
      topics: item.topics
    }))

  const handleSlideChange = (index: number) => {
    setActiveIndex(index)
  }

  const handleSwiperInit = (swiper: SwiperType) => {
    swiperRef.current = swiper
  }

  const goToSlide = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="w-full">
        <MediaSwiper
          images={images}
          aspectRatio="landscape"
          showMetadata={true}
          className="w-full"
          onSlideChange={handleSlideChange}
          onSwiperInit={handleSwiperInit}
        />

        {/* Custom Pagination Indicators */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-sm ${
                index === activeIndex
                  ? 'w-12 h-0.5 bg-stone-800'
                  : 'w-8 h-0.5 bg-stone-300 hover:bg-stone-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}