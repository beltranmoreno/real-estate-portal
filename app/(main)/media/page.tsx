import { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import MediaGallery from '@/components/MediaGallery'

export const metadata: Metadata = {
  title: 'Media Gallery - Casa de Campo',
  description: 'Explore stunning photos and videos showcasing the beauty and experiences of Casa de Campo and La Romana.',
}

async function getFeaturedMedia() {
  const query = `*[_type == "featuredMedia" && status == "published"] | order(isFeatured desc, priority desc, title_en asc) {
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
    captureDate,
    usageRights
  }`

  return await client.fetch(query, {}, {
    next: { revalidate: 3600 } // Revalidate every hour
  })
}

export default async function MediaPage() {
  const media = await getFeaturedMedia()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-100 via-slate-50 to-stone-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extralight text-stone-800 tracking-tight mb-6">
              Media Gallery
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 leading-relaxed font-light">
              Discover the beauty and luxury of Casa de Campo through our curated collection of stunning photography and videos
            </p>
            <div className="mt-8 flex items-center justify-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
              <div className="mx-4 w-2 h-2 bg-stone-400 rounded-full"></div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Gallery */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <MediaGallery
            media={media}
            gridCols={3}
            showFilters={true}
            showFeaturedFirst={true}
            className="max-w-7xl mx-auto"
          />
        </div>
      </section>
    </div>
  )
}