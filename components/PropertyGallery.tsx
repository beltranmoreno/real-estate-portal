'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import { X, Maximize2, Grid3x3, ArrowLeftRight } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import { cn } from '@/lib/utils'
import type { Swiper as SwiperType } from 'swiper'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import 'swiper/css/free-mode'

interface PropertyGalleryProps {
  mainImage: any
  gallery: any[]
  alt: string
}

export default function PropertyGallery({ mainImage, gallery = [], alt }: PropertyGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider')

  // Prevent body scroll when lightbox is open
  React.useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isLightboxOpen])

  // Combine main image with gallery
  const allImages = [mainImage, ...gallery].filter(Boolean)

  if (allImages.length === 0) {
    return (
      <div className="aspect-[16/10] bg-slate-100 rounded-lg flex items-center justify-center">
        <p className="text-slate-500">No images available</p>
      </div>
    )
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Swiper */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Thumbs]}
            spaceBetween={10}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-custom',
            }}
            loop={true}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            className="rounded-xs overflow-hidden aspect-[16/10]"
          >
            {allImages.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full bg-slate-100 group">
                  <Image
                    src={urlFor(image).width(1200).height(800).url()}
                    alt={`${alt} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 80vw"
                    priority={index === 0}
                  />

                  {/* Full Screen Button */}
                  <div
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm pointer-events-none"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          {allImages.length > 1 && (
            <>
              <div className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </>
          )}

          {/* Custom Pagination */}
          <div className="swiper-pagination-custom absolute bottom-4 left-1/2 -translate-x-1/2 z-10"></div>
        </div>

        {/* Thumbnail Swiper */}
        {allImages.length > 1 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[FreeMode, Thumbs]}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            className="h-20"
          >
            {allImages.map((image, index) => (
              <SwiperSlide key={index} className="!w-20">
                <div
                  className="relative w-20 h-20 overflow-hidden rounded-sm cursor-pointer border-2 border-transparent hover:border-slate-900 transition-colors"
                  onClick={() => {
                    setCurrentSlide(index)
                    setIsLightboxOpen(true)
                  }}
                >
                  <Image
                    src={urlFor(image).width(200).height(200).url()}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center h-[100dvh]">
          <div className="relative w-full h-full">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-[110] bg-gradient-to-b from-black/60 to-transparent p-4">
              <div className="flex items-center justify-between">
                {/* View Mode Toggle */}
                <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-sm p-1">
                  <button
                    onClick={() => setViewMode('slider')}
                    className={cn(
                      "p-2 rounded-sm transition-colors text-white",
                      viewMode === 'slider'
                        ? "bg-white/20 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                    title="Slider View"
                  >
                    <ArrowLeftRight className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-sm transition-colors text-white",
                      viewMode === 'grid'
                        ? "bg-white/20 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                    title="Grid View"
                  >
                    <Grid3x3 className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Slider View */}
            {viewMode === 'slider' && (
              <div className="w-full h-full pt-16">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={10}
                  navigation={{
                    nextEl: '.lightbox-button-next',
                    prevEl: '.lightbox-button-prev',
                  }}
                  pagination={{
                    clickable: true,
                    el: '.lightbox-pagination',
                  }}
                  initialSlide={currentSlide}
                  onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
                  className="w-full h-full"
                >
                  {allImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="flex flex-col w-full h-full">
                        {/* Image Container - Takes full space minus caption */}
                        <div className="relative flex-1 w-full min-h-0">
                          <Image
                            src={urlFor(image).width(1600).height(1200).url()}
                            alt={`${alt} - Image ${index + 1}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                          />
                        </div>

                        {/* Image Caption - Always Visible */}
                        {(image.caption || image.alt || image.category) && (
                          <div className="w-full px-8 py-3 pb-12 flex-shrink-0">
                            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 text-center max-w-4xl mx-auto">
                              {(image.caption || image.alt) && (
                                <p className="text-white text-sm leading-relaxed">
                                  {image.caption || image.alt}
                                </p>
                              )}
                              {image.category && (
                                <p className="text-white/70 text-xs mt-1 uppercase tracking-wide">
                                  {image.category}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Lightbox Navigation */}
                {allImages.length > 1 && (
                  <>
                    <div className="lightbox-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-[105] p-3 text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <div className="lightbox-button-next absolute right-4 top-1/2 -translate-y-1/2 z-[105] p-3 text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </>
                )}

                {/* Lightbox Pagination */}
                <div className="lightbox-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-[105]"></div>
              </div>
            )}

            {/* Grid View - Masonry Layout */}
            {viewMode === 'grid' && (
              <div className="w-full h-full overflow-y-auto pt-20 pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allImages.map((image, index) => {
                      // Create pattern: 1 full, 2 side-by-side, 1 full, 2 side-by-side...
                      const position = index % 3
                      const isFullWidth = position === 0

                      return (
                        <div
                          key={index}
                          className={cn(
                            "relative bg-black/40 rounded-lg overflow-hidden cursor-pointer group",
                            isFullWidth && "md:col-span-2",
                            isFullWidth ? "aspect-[21/9]" : "aspect-[4/3]"
                          )}
                          onClick={() => {
                            setViewMode('slider')
                            setCurrentSlide(index)
                          }}
                        >
                          <Image
                            src={urlFor(image).width(1200).height(800).url()}
                            alt={`${alt} - Image ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes={isFullWidth ? "100vw" : "50vw"}
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          {/* Image Number */}
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                            <span className="text-white text-sm font-light">
                              {index + 1} / {allImages.length}
                            </span>
                          </div>

                          {/* Image Metadata - Visible on Hover */}
                          {(image.caption || image.alt || image.category) && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {(image.caption || image.alt) && (
                                <p className="text-white text-sm font-light leading-relaxed mb-1">
                                  {image.caption || image.alt}
                                </p>
                              )}
                              {image.category && (
                                <p className="text-white/70 text-xs uppercase tracking-wide">
                                  {image.category}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .swiper-pagination-custom .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.7);
          opacity: 1;
        }
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          background: white;
        }
        .lightbox-pagination .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.7);
          opacity: 1;
        }
        .lightbox-pagination .swiper-pagination-bullet-active {
          background: white;
        }
      `}</style>
    </>
  )
}