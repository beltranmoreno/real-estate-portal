'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs, FreeMode, Mousewheel } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import { X, Maximize2, Grid3x3, ArrowLeftRight, MapPin } from 'lucide-react'
import { urlFor, fullImageUrl } from '@/sanity/lib/image'
import { cn } from '@/lib/utils'
import { useNavOverlay } from '@/contexts/NavOverlayContext'
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
  /**
   * Full-bleed hero: one page-wide image cycling through the first five
   * photos, with the villa name and "See all photographs" over the bottom.
   */
  mosaic?: boolean
  /** Villa name shown over the hero (rendered as the page's h1). */
  title?: string
  /** Location line under the name (e.g. "Golf Villas, Casa de Campo"). */
  subtitle?: string
  locale?: 'en' | 'es'
}

export interface PropertyGalleryHandle {
  /** Open the lightbox at a given image object (matched by _key / asset). */
  openImage: (image: any) => void
}

/**
 * Width / height of a Sanity image, read from its asset id
 * ("image-<hash>-4000x3000-jpg"). Falls back to 3:2.
 */
function imageRatio(image: any): number {
  const ref: string = image?.asset?._ref || image?.asset?._id || ''
  const m = /-(\d+)x(\d+)-/.exec(ref)
  const w = m ? Number(m[1]) : 0
  const h = m ? Number(m[2]) : 0
  return w > 0 && h > 0 ? w / h : 1.5
}

const PropertyGallery = React.forwardRef<PropertyGalleryHandle, PropertyGalleryProps>(
  function PropertyGallery({ mainImage, gallery = [], alt, mosaic = false, title, subtitle, locale = 'en' }, ref) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  // The lightbox opens on the grid; clicking a photo there opens the slider.
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('grid')
  const [heroIndex, setHeroIndex] = useState(0)

  const openAt = (i: number, mode: 'slider' | 'grid' = 'slider') => {
    setCurrentSlide(i)
    setViewMode(mode)
    setIsLightboxOpen(true)
  }
  const openGrid = () => openAt(0, 'grid')

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

  // Combine main image with gallery. Require an `asset` — urlFor() throws
  // on image objects that exist but have no uploaded asset.
  const allImages = [mainImage, ...gallery].filter((img) => img?.asset)
  const heroImages = allImages.slice(0, 5)
  // The hero slides under a transparent navbar until scrolled past (same
  // mechanism as the homepage and guide heroes).
  const navOverlayProps = useNavOverlay(mosaic && heroImages.length > 0)

  // Hero cycles every 6s through the first five photos. Paused while the
  // lightbox is open, when the tab is hidden, and for reduced-motion users.
  React.useEffect(() => {
    if (!mosaic || heroImages.length < 2 || isLightboxOpen) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setHeroIndex((i) => (i + 1) % heroImages.length)
      }
    }, 6000)
    return () => window.clearInterval(id)
  }, [mosaic, heroImages.length, isLightboxOpen])

  // Imperative open — used by the categorized "Property Photos" grid, which
  // lives outside this component. Match by _key first, then asset ref.
  const openImage = (image: any) => {
    const idx = allImages.findIndex(
      (img) =>
        (image?._key && img?._key === image._key) ||
        (image?.asset?._ref && img?.asset?._ref === image.asset._ref)
    )
    openAt(idx >= 0 ? idx : 0)
  }
  React.useImperativeHandle(ref, () => ({ openImage }), [allImages])

  if (allImages.length === 0) {
    // The hero carries the page's h1 — keep the name even with no photos.
    if (mosaic && title) {
      return (
        <div className="container mx-auto px-4 pt-12 pb-2 text-center">
          <h1 className="font-display text-4xl lg:text-5xl text-ink">{title}</h1>
        </div>
      )
    }
    return (
      <div className="aspect-[16/10] bg-sand rounded-lg flex items-center justify-center">
        <p className="text-muted-2">No images available</p>
      </div>
    )
  }

  const photoCountLabel =
    locale === 'es'
      ? `Ver las ${allImages.length} fotos`
      : `All ${allImages.length} photographs`

  return (
    <>
      {/* Full-bleed hero — one page-wide image cross-fading through the
          first five photos, villa name + "See all photographs" centred at
          the bottom. */}
      {mosaic && (
        <section {...navOverlayProps} className="relative w-full h-[72vh] md:h-[88vh] min-h-[460px] max-h-[960px] overflow-hidden bg-ink">
          <button
            type="button"
            onClick={openGrid}
            className="absolute inset-0 block w-full h-full cursor-zoom-in"
            aria-label={photoCountLabel}
          >
            {heroImages.map((img, i) => (
              <Image
                key={img._key || img.asset?._ref || i}
                src={fullImageUrl(img)}
                alt={i === heroIndex ? alt : ''}
                fill
                priority={i === 0}
                sizes="100vw"
                className={cn(
                  'object-cover transition-opacity duration-[1500ms] ease-in-out',
                  i === heroIndex ? 'opacity-100' : 'opacity-0'
                )}
              />
            ))}
            {/* Top scrim keeps the clear navbar readable on bright photos. */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
            {/* Bottom scrim so the name reads on any photo. */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-10 md:pb-14 flex flex-col items-center text-center">
            {title && (
              <h1 className="font-display text-white text-4xl sm:text-5xl md:text-6xl leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 flex items-center gap-1.5 text-white/90 text-sm md:text-base font-light tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                <MapPin className="w-4 h-4 shrink-0" aria-hidden />
                {subtitle}
              </p>
            )}
            <button
              type="button"
              onClick={openGrid}
              className="pointer-events-auto mt-5 text-[11px] uppercase tracking-[0.2em] text-white border-b border-white/70 pb-1 hover:border-white transition-colors"
            >
              {locale === 'es' ? 'Ver todas las fotografías' : 'See all photographs'}
            </button>

            {heroImages.length > 1 && (
              <div className="pointer-events-auto mt-6 flex gap-2" role="tablist" aria-label={locale === 'es' ? 'Fotos' : 'Photos'}>
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === heroIndex}
                    aria-label={`${i + 1} / ${heroImages.length}`}
                    onClick={() => setHeroIndex(i)}
                    className={cn(
                      'h-[3px] rounded-full transition-all duration-500',
                      i === heroIndex ? 'w-8 bg-white' : 'w-4 bg-white/50 hover:bg-white/80'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main Gallery (inline slider) */}
      {!mosaic && (
      <div className="space-y-4">
        {/* Main Swiper */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Thumbs, Mousewheel]}
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
            // Two-finger trackpad swipe advances slides. `forceToAxis`
            // means only horizontal wheel events trigger navigation —
            // vertical scroll continues to scroll the page normally.
            mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
            onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
            className="rounded-xs overflow-hidden aspect-[16/10]"
          >
            {allImages.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full bg-sand group">
                  <Image
                    src={fullImageUrl(image)}
                    alt={`${alt} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 80vw"
                    priority={index === 0}
                  />

                  {/* Full Screen Button */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
              <div className="swiper-button-prev-custom absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-transparent rounded-full hover:backdrop-blur-sm transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div className="swiper-button-next-custom absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white bg-transparent rounded-full hover:backdrop-blur-sm transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Swiper */}
        {allImages.length > 1 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[FreeMode, Thumbs, Mousewheel]}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            // Trackpad two-finger horizontal swipe scrolls the strip.
            // Vertical scroll falls through to the page.
            mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
            className="h-20"
          >
            {allImages.map((image, index) => (
              <SwiperSlide key={index} className="!w-20">
                <div
                  className={cn(
                    "relative w-20 h-20 overflow-hidden rounded-sm cursor-pointer border-2 border-transparent hover:border-ink transition-colors",
                    index === currentSlide && "border-ink"
                  )}
                  onClick={() => {
                    setCurrentSlide(index)
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
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center h-[100dvh]" role="dialog" aria-modal="true" aria-label={photoCountLabel}>
          <div className="relative w-full h-full">
            {/* Top Bar — a white bar in the slider; in the grid just the
                buttons, floating with no background. */}
            <div
              className={cn(
                'absolute top-0 left-0 right-0 z-[110] p-4',
                viewMode === 'grid'
                  ? 'pointer-events-none'
                  : 'bg-white/95 backdrop-blur-sm border-b border-line'
              )}
            >
              <div className="flex items-center justify-between">
                {/* View Mode Toggle */}
                <div
                  className={cn(
                    'pointer-events-auto flex gap-1 rounded-sm p-1',
                    viewMode === 'grid'
                      ? 'bg-white/50 backdrop-blur-md shadow-sm'
                      : 'border border-line'
                  )}
                >
                  <button
                    onClick={() => setViewMode('slider')}
                    className={cn(
                      "p-2 rounded-sm transition-colors",
                      viewMode === 'slider'
                        ? "bg-sand text-ink"
                        : "text-muted hover:text-ink"
                    )}
                    title="Slider View"
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-2 rounded-sm transition-colors",
                      viewMode === 'grid'
                        ? "text-ink"
                        : "text-muted hover:text-ink"
                    )}
                    title="Grid View"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                </div>

                {/* Close Button */}
                {viewMode === 'slider' && (
                  <p className="hidden sm:block text-sm font-light text-muted">
                    {currentSlide + 1} / {allImages.length}
                  </p>
                )}

                <button
                  onClick={() => setIsLightboxOpen(false)}
                  aria-label={locale === 'es' ? 'Cerrar' : 'Close'}
                  className={cn(
                    'pointer-events-auto p-2 text-ink rounded-sm hover:opacity-70 transition-opacity',
                    viewMode === 'grid' && 'bg-white/50 backdrop-blur-md shadow-sm'
                  )}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Slider View */}
            {viewMode === 'slider' && (
              <div className="w-full h-full pt-[73px]">
                <Swiper
                  modules={[Navigation, Pagination, Mousewheel]}
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
                  loop={true}
                  mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
                  onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
                  className="w-full h-full"
                >
                  {allImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="flex flex-col w-full h-full">
                        {/* Image Container - Takes full space minus caption */}
                        <div className="relative flex-1 w-full min-h-0">
                          <Image
                            src={fullImageUrl(image)}
                            alt={`${alt} - Image ${index + 1}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                          />
                        </div>

                        {/* Image Caption - Always Visible */}
                        {(image.caption || image.alt || image.category) && (
                          <div className="w-full px-8 py-3 pb-12 flex-shrink-0">
                            <div className="p-3 text-center max-w-4xl mx-auto">
                              {(image.caption || image.alt) && (
                                <p className="text-body-strong text-sm font-light leading-relaxed">
                                  {image.caption || image.alt}
                                </p>
                              )}
                              {image.category && (
                                <p className="text-muted text-xs mt-1 uppercase tracking-wide">
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
                    <div className="lightbox-button-prev absolute md:left-4 left-2 top-1/2 -translate-y-1/2 z-[105] p-2 md:p-3 text-ink bg-white/60 backdrop-blur-md hover:bg-white/80 rounded-full transition-colors cursor-pointer">
                      <svg className="md:w-8 w-6 md:h-8 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <div className="lightbox-button-next absolute md:right-4 right-2 top-1/2 -translate-y-1/2 z-[105] p-2 md:p-3 text-ink bg-white/60 backdrop-blur-md hover:bg-white/80 rounded-full transition-colors cursor-pointer">
                      <svg className="md:w-8 w-6 md:h-8 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
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
              <div className="w-full h-full overflow-y-auto pt-[72px] pb-2 px-2">
                <div className="w-full">
                  {/* Rows of two in reading order (1 · 2, then 3 · 4). Each
                      pair is sized by the photos' own ratios so both share one
                      height and fill the row exactly — no cropping, no gaps.
                      Phones show one photo per row. */}
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: Math.ceil(allImages.length / 2) }, (_, r) =>
                      allImages.slice(r * 2, r * 2 + 2)
                    ).map((pair, r) => (
                      <div key={r} className="flex flex-col md:flex-row gap-2">
                        {pair.map((image, j) => {
                          const index = r * 2 + j
                          const ratio = imageRatio(image)
                          return (
                            <div
                              key={index}
                              // Row flex only from md up: in the phone column a
                              // zero flex-basis would collapse the height.
                              className="relative w-full bg-sand overflow-hidden cursor-pointer group md:min-w-0 md:w-auto md:[flex:var(--r)_1_0%]"
                              style={{ '--r': ratio, aspectRatio: String(ratio) } as React.CSSProperties}
                              onClick={() => {
                                setViewMode('slider')
                                setCurrentSlide(index)
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={urlFor(image).width(1600).fit('max').quality(85).auto('format').url()}
                                alt={`${alt} - Image ${index + 1}`}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="text-ink text-sm font-light">
                                  {index + 1} / {allImages.length}
                                </span>
                              </div>
                              {(image.caption || image.alt || image.category) && (
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  {(image.caption || image.alt) && (
                                    <p className="text-white text-sm font-light leading-relaxed mb-1">
                                      {image.caption || image.alt}
                                    </p>
                                  )}
                                  {image.category && (
                                    <p className="text-white/70 text-xs uppercase tracking-wide">{image.category}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
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
          background: rgba(28, 25, 23, 0.25);
          opacity: 1;
        }
        .lightbox-pagination .swiper-pagination-bullet-active {
          background: #1c1917;
        }
      `}</style>
    </>
  )
})

export default PropertyGallery