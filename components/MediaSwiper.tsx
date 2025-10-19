'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { urlFor } from '@/sanity/lib/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface ImageItem {
  _id: string
  title_en?: string
  title_es?: string
  image: any
  alt?: string
  location?: string
  photographer?: string
  captureDate?: string
  topics?: string[]
}

interface MediaSwiperProps {
  images: ImageItem[]
  className?: string
  aspectRatio?: 'square' | 'landscape' | 'portrait'
  showMetadata?: boolean
}

export default function MediaSwiper({
  images,
  className = '',
  aspectRatio = 'landscape',
  showMetadata = false
}: MediaSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]'
  }

  return (
    <div className={`relative ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1.2}
        breakpoints={{
          640: {
            slidesPerView: 1.5,
            spaceBetween: 0
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 0
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 0
          }
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          el: '.swiper-pagination-custom'
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        loop={images.length > 2}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        className="!pb-12"
      >
        {images.map((item) => {
          const altText = item.alt || item.title_en || item.title_es || 'Image'

          return (
            <SwiperSlide key={item._id}>
              <div className="group relative">
                <div
                  className={`relative ${aspectRatioClasses[aspectRatio]} rounded-xs overflow-hidden bg-stone-100 shadow-lg hover:shadow-2xl transition-all duration-500`}
                  data-location={item.location}
                  data-photographer={item.photographer}
                  data-capture-date={item.captureDate}
                  data-topics={item.topics?.join(', ')}
                >
                  {/* High Quality Image */}
                  <Image
                    src={urlFor(item.image).width(1200).height(900).quality(90).url()}
                    alt={altText}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 50vw, 40vw"
                    priority={false}
                  />

                  {/* Optional Metadata Overlay */}
                  {showMetadata && (item.photographer || item.location) && (
                    <>
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Metadata */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        {item.location && (
                          <p className="text-sm font-light mb-1 drop-shadow-lg">
                            {item.location}
                          </p>
                        )}
                        {item.photographer && (
                          <p className="text-xs text-white/80 drop-shadow-md">
                            Photo by {item.photographer}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      {/* Custom Pagination */}
      <div className="swiper-pagination-custom mt-4 flex justify-center"></div>

      {/* Custom Navigation Buttons */}
      {images.length > 2 && (
        <>
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 md:p-3 shadow-lg opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-stone-800" />
          </button>

          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 md:p-3 shadow-lg opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-stone-800" />
          </button>
        </>
      )}
    </div>
  )
}
