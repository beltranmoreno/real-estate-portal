'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import { X, Maximize2 } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
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
            className="rounded-lg overflow-hidden aspect-[16/10]"
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
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsLightboxOpen(true)}
                        className="bg-white/90 backdrop-blur-sm"
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
                <div className="relative w-20 h-20 overflow-hidden rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-300 transition-colors">
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
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center h-dvh">
          <div className="relative w-full h-full p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Lightbox Swiper */}
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
              onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
              className="w-full h-full"
            >
              {allImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="flex items-center justify-center h-full">
                    <Image
                      src={urlFor(image).width(1600).height(1200).url()}
                      alt={`${alt} - Image ${index + 1}`}
                      width={1600}
                      height={1200}
                      className="max-w-full max-h-full object-contain"
                      sizes="100vw"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Lightbox Navigation */}
            {allImages.length > 1 && (
              <>
                <div className="lightbox-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="lightbox-button-next absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </>
            )}

            {/* Lightbox Pagination */}
            <div className="lightbox-pagination absolute bottom-16 left-1/2 -translate-x-1/2 z-10"></div>

            {/* Image Caption */}
            {allImages[currentSlide] && (allImages[currentSlide].caption || allImages[currentSlide].alt) && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-white text-sm leading-relaxed">
                    {allImages[currentSlide].caption || allImages[currentSlide].alt}
                  </p>
                  {allImages[currentSlide].category && (
                    <p className="text-white/70 text-xs mt-1 uppercase tracking-wide">
                      {allImages[currentSlide].category}
                    </p>
                  )}
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