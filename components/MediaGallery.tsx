'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { useLocale } from '@/contexts/LocaleContext'
import { urlFor } from '@/sanity/lib/image'
import { PlayCircle, Filter, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

interface MediaGalleryProps {
  media: MediaItem[]
  className?: string
  defaultTopic?: string
  showFeaturedFirst?: boolean
  gridCols?: 2 | 3 | 4
  showFilters?: boolean
  maxItems?: number
}

export default function MediaGallery({
  media,
  className = '',
  defaultTopic,
  showFeaturedFirst = true,
  gridCols = 3,
  showFilters = true,
  maxItems
}: MediaGalleryProps) {
  const { locale, t } = useLocale()
  const [selectedTopic, setSelectedTopic] = useState<string>(defaultTopic || 'all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  // Get unique topics from media
  const availableTopics = useMemo(() => {
    const topicsSet = new Set<string>()
    media.forEach(item => {
      item.topics.forEach(topic => topicsSet.add(topic))
    })
    return Array.from(topicsSet).sort()
  }, [media])

  // Filter and sort media
  const filteredMedia = useMemo(() => {
    let filtered = media.filter(item => {
      if (selectedTopic === 'all') return true
      return item.topics.includes(selectedTopic)
    })

    // Sort by featured first, then priority, then title
    if (showFeaturedFirst) {
      filtered.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1
        if (!a.isFeatured && b.isFeatured) return 1
        if (a.priority !== b.priority) return b.priority - a.priority
        const aTitle = locale === 'en' ? a.title_en : a.title_es
        const bTitle = locale === 'en' ? b.title_en : b.title_es
        return aTitle.localeCompare(bTitle)
      })
    }

    return maxItems ? filtered.slice(0, maxItems) : filtered
  }, [media, selectedTopic, showFeaturedFirst, maxItems, locale])

  const topicLabels: Record<string, { en: string; es: string }> = {
    golf: { en: 'Golf', es: 'Golf' },
    beach: { en: 'Beach', es: 'Playa' },
    activities: { en: 'Activities', es: 'Actividades' },
    restaurants: { en: 'Restaurants', es: 'Restaurantes' },
    properties: { en: 'Properties', es: 'Propiedades' },
    lifestyle: { en: 'Lifestyle', es: 'Estilo de Vida' },
    sports: { en: 'Sports', es: 'Deportes' },
    nature: { en: 'Nature', es: 'Naturaleza' },
    luxury: { en: 'Luxury', es: 'Lujo' },
    family: { en: 'Family', es: 'Familia' },
    romance: { en: 'Romance', es: 'Romance' },
    adventure: { en: 'Adventure', es: 'Aventura' },
    relaxation: { en: 'Relaxation', es: 'Relajación' },
    nightlife: { en: 'Nightlife', es: 'Vida Nocturna' },
    culture: { en: 'Culture', es: 'Cultura' },
    wellness: { en: 'Wellness', es: 'Bienestar' },
    'water-sports': { en: 'Water Sports', es: 'Deportes Acuáticos' },
    events: { en: 'Events', es: 'Eventos' }
  }

  const getTopicLabel = (topic: string) => {
    return topicLabels[topic] ? topicLabels[topic][locale] : topic
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const gridColsClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }[gridCols]

  return (
    <div className={`w-full ${className}`}>
      {/* Filters */}
      {showFilters && availableTopics.length > 1 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-stone-800">
              {t({ en: 'Browse by Topic', es: 'Navegar por Tema' })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="md:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              {getTopicLabel(selectedTopic)}
            </Button>
          </div>

          {/* Desktop filters */}
          <div className="hidden md:flex flex-wrap gap-2">
            <Button
              variant={selectedTopic === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTopic('all')}
              className="text-xs"
            >
              {t({ en: 'All', es: 'Todos' })}
            </Button>
            {availableTopics.map(topic => (
              <Button
                key={topic}
                variant={selectedTopic === topic ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTopic(topic)}
                className="text-xs"
              >
                {getTopicLabel(topic)}
              </Button>
            ))}
          </div>

          {/* Mobile filter menu */}
          {showFilterMenu && (
            <div className="md:hidden mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTopic === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedTopic('all')
                    setShowFilterMenu(false)
                  }}
                  className="text-xs"
                >
                  {t({ en: 'All', es: 'Todos' })}
                </Button>
                {availableTopics.map(topic => (
                  <Button
                    key={topic}
                    variant={selectedTopic === topic ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedTopic(topic)
                      setShowFilterMenu(false)
                    }}
                    className="text-xs"
                  >
                    {getTopicLabel(topic)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="mb-6 text-sm text-stone-600 font-light">
        {t({ 
          en: `Showing ${filteredMedia.length} ${filteredMedia.length === 1 ? 'item' : 'items'}`,
          es: `Mostrando ${filteredMedia.length} ${filteredMedia.length === 1 ? 'elemento' : 'elementos'}`
        })}
        {selectedTopic !== 'all' && (
          <span className="ml-2">
            {t({ en: 'in', es: 'en' })} <strong>{getTopicLabel(selectedTopic)}</strong>
          </span>
        )}
      </div>

      {/* Media Grid */}
      <div className={`grid ${gridColsClass} gap-6`}>
        {filteredMedia.map((item) => {
          const title = locale === 'en' ? item.title_en : item.title_es
          const description = locale === 'en' ? item.description_en : item.description_es

          return (
            <div
              key={item._id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-stone-200/50"
            >
              <div 
                className="relative aspect-[4/3] cursor-pointer overflow-hidden"
                onClick={() => setSelectedMedia(item)}
              >
                {item.mediaType === 'image' && item.image ? (
                  <Image
                    src={urlFor(item.image).width(800).height(600).url()}
                    alt={item.image.alt || title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : item.mediaType === 'video' ? (
                  <>
                    <Image
                      src={item.videoThumbnail 
                        ? urlFor(item.videoThumbnail).width(800).height(600).url()
                        : '/images/video-placeholder.jpg'
                      }
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-white/90 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                    </div>
                    {item.videoDuration && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(item.videoDuration)}
                      </div>
                    )}
                  </>
                ) : null}

                {item.isFeatured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-amber-500 text-white text-xs">
                      {t({ en: 'Featured', es: 'Destacado' })}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="font-medium text-stone-800 text-lg mb-2 line-clamp-2">
                  {title}
                </h4>
                {description && (
                  <p className="text-stone-600 text-sm font-light mb-3 line-clamp-2">
                    {description}
                  </p>
                )}
                
                {/* Topics */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.topics.slice(0, 3).map(topic => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {getTopicLabel(topic)}
                    </Badge>
                  ))}
                  {item.topics.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.topics.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Metadata */}
                <div className="text-xs text-stone-500 space-y-1">
                  {item.photographer && (
                    <p>📷 {item.photographer}</p>
                  )}
                  {item.location && (
                    <p>📍 {item.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* No results */}
      {filteredMedia.length === 0 && (
        <div className="text-center py-16">
          <div className="text-stone-400 text-6xl mb-4">📷</div>
          <h3 className="text-xl font-light text-stone-700 mb-2">
            {t({ en: 'No media found', es: 'No se encontraron medios' })}
          </h3>
          <p className="text-stone-600">
            {t({ 
              en: 'Try selecting a different topic or check back later',
              es: 'Intenta seleccionar un tema diferente o vuelve más tarde'
            })}
          </p>
        </div>
      )}

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
              {/* Media */}
              <div className="relative bg-black flex items-center justify-center">
                {selectedMedia.mediaType === 'image' && selectedMedia.image ? (
                  <Image
                    src={urlFor(selectedMedia.image).width(1200).height(900).url()}
                    alt={selectedMedia.image.alt || (locale === 'en' ? selectedMedia.title_en : selectedMedia.title_es)}
                    width={1200}
                    height={900}
                    className="object-contain max-h-full"
                  />
                ) : selectedMedia.mediaType === 'video' && selectedMedia.videoUrl ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <a
                      href={selectedMedia.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center text-white hover:text-amber-400 transition-colors"
                    >
                      <ExternalLink className="w-8 h-8 mr-3" />
                      <span className="text-lg">
                        {t({ en: 'Watch Video', es: 'Ver Video' })}
                      </span>
                    </a>
                  </div>
                ) : null}
              </div>

              {/* Info */}
              <div className="p-8 overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-light text-stone-800">
                    {locale === 'en' ? selectedMedia.title_en : selectedMedia.title_es}
                  </h2>
                  {selectedMedia.isFeatured && (
                    <Badge className="bg-amber-500 text-white">
                      {t({ en: 'Featured', es: 'Destacado' })}
                    </Badge>
                  )}
                </div>

                {(locale === 'en' ? selectedMedia.description_en : selectedMedia.description_es) && (
                  <p className="text-stone-600 leading-relaxed mb-6 font-light">
                    {locale === 'en' ? selectedMedia.description_en : selectedMedia.description_es}
                  </p>
                )}

                <div className="space-y-4">
                  {/* Topics */}
                  <div>
                    <h4 className="font-medium text-stone-700 mb-2">
                      {t({ en: 'Topics', es: 'Temas' })}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMedia.topics.map(topic => (
                        <Badge key={topic} variant="outline">
                          {getTopicLabel(topic)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-sm text-stone-600 space-y-2">
                    {selectedMedia.photographer && (
                      <p><strong>📷 {t({ en: 'Photographer', es: 'Fotógrafo' })}:</strong> {selectedMedia.photographer}</p>
                    )}
                    {selectedMedia.location && (
                      <p><strong>📍 {t({ en: 'Location', es: 'Ubicación' })}:</strong> {selectedMedia.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    )}
                    {selectedMedia.captureDate && (
                      <p><strong>📅 {t({ en: 'Date', es: 'Fecha' })}:</strong> {new Date(selectedMedia.captureDate).toLocaleDateString()}</p>
                    )}
                    {selectedMedia.videoDuration && (
                      <p><strong>⏱️ {t({ en: 'Duration', es: 'Duración' })}:</strong> {formatDuration(selectedMedia.videoDuration)}</p>
                    )}
                  </div>

                  {selectedMedia.videoUrl && (
                    <a
                      href={selectedMedia.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t({ en: 'Watch Video', es: 'Ver Video' })}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}