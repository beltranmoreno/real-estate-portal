'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { HeroScrim } from '@/components/HeroScrim'
import imageLoader from '@/lib/imageLoader'
import Link from 'next/link'
import { ArrowRight, Volume2, VolumeX } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { useNavOverlay } from '@/contexts/NavOverlayContext'
import { cn } from '@/lib/utils'
import { PAGE_HEROES, type PageHeroKey } from '@/sanity/lib/pageHeroDefaults'
import type { PageHeroDoc } from '@/lib/pageHero'
import { IntroSection } from '@/components/resort/IntroSection'

/** "Add anything *to your stay.*" → plain text with the starred part in italic. */
function withItalics(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
      <span key={i} className="italic">
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    )
  )
}

/**
 * Background media: a video (looping, muted) when set — first photo as its
 * poster, and a sound toggle when the video has an audio track — otherwise the
 * photos, cross-fading every 6s when there are several.
 * The slideshow holds on the first photo for visitors who prefer reduced motion.
 */
export function HeroMedia({
  images,
  video,
  onVideoRatio,
}: {
  images: string[]
  video: string | null
  /** Reports the video's width ÷ height once it's known. */
  onVideoRatio?: (ratio: number) => void
}) {
  const { t } = useLocale()
  const [slide, setSlide] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasSound, setHasSound] = useState(false)
  const [muted, setMuted] = useState(true)
  useEffect(() => {
    setHasSound(false)
    setMuted(true)
  }, [video])
  useEffect(() => {
    if (video || images.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setSlide((n) => (n + 1) % images.length), 6000)
    return () => clearInterval(id)
  }, [images.length, video])

  // Browsers expose "has audio" differently (Firefox / Safari / Chrome, the
  // last only once some audio has been decoded), so check as it plays.
  const checkSound = (v: HTMLVideoElement) => {
    if (hasSound) return
    const el = v as HTMLVideoElement & {
      mozHasAudio?: boolean
      audioTracks?: { length: number }
      webkitAudioDecodedByteCount?: number
    }
    if (el.mozHasAudio || (el.audioTracks?.length ?? 0) > 0 || (el.webkitAudioDecodedByteCount ?? 0) > 0) {
      setHasSound(true)
    }
  }

  if (video) {
    return (
      <>
        <video
          ref={videoRef}
          src={video}
          // Not a next/image, so size it here (hero URLs carry no width cap).
          poster={images[0] ? imageLoader({ src: images[0], width: 1920 }) : undefined}
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={(e) => {
            const { videoWidth, videoHeight } = e.currentTarget
            if (videoWidth && videoHeight) onVideoRatio?.(videoWidth / videoHeight)
            checkSound(e.currentTarget)
          }}
          onTimeUpdate={(e) => checkSound(e.currentTarget)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {hasSound && (
          <button
            type="button"
            onClick={() => {
              const v = videoRef.current
              if (!v) return
              v.muted = !v.muted
              setMuted(v.muted)
              // Some browsers pause a video when it's unmuted; keep it going.
              if (!v.muted) v.play().catch(() => {})
            }}
            aria-pressed={!muted}
            aria-label={muted ? t({ en: 'Turn sound on', es: 'Activar sonido' }) : t({ en: 'Turn sound off', es: 'Desactivar sonido' })}
            title={muted ? t({ en: 'Turn sound on', es: 'Activar sonido' }) : t({ en: 'Turn sound off', es: 'Desactivar sonido' })}
            className="absolute right-4 bottom-4 sm:right-6 sm:bottom-6 z-20 grid size-11 place-items-center rounded-full bg-ink/45 text-white backdrop-blur-sm transition-colors hover:bg-ink/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {muted ? <VolumeX className="size-5" strokeWidth={1.5} /> : <Volume2 className="size-5" strokeWidth={1.5} />}
          </button>
        )}
      </>
    )
  }
  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            'object-cover transition-opacity duration-[1400ms]',
            i === slide ? 'opacity-100' : 'opacity-0'
          )}
        />
      ))}
    </>
  )
}

function Cta({ href, label, primary, onPhoto }: { href: string; label: string; primary: boolean; onPhoto: boolean }) {
  const external = /^https?:\/\//.test(href)
  const cls = cn(
    'inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-[0.16em] rounded-[2px] transition-colors',
    primary
      ? onPhoto
        ? 'bg-surface text-ink hover:bg-brand hover:text-surface'
        : 'bg-ink text-surface hover:bg-brand'
      : onPhoto
        ? 'border border-white/40 text-surface hover:border-white'
        : 'border border-control-border text-ink hover:border-ink'
  )
  const body = (
    <>
      {label}
      {primary && <ArrowRight className="w-4 h-4" aria-hidden />}
    </>
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    )
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} className={cls}>
        {body}
      </a>
    )
  }
  return (
    <Link href={href} className={cls}>
      {body}
    </Link>
  )
}

/**
 * The editable hero used across the site's inner pages. Copy comes from the
 * page's Studio doc (Page Heroes); a page without a doc shows the shipped
 * defaults. Title and label fall back to the defaults when left empty;
 * subtitle and buttons can be cleared to hide them.
 *
 * - No media → editorial text hero on the canvas.
 * - Photos/video, single layout → full-width media with white text.
 * - Photos/video, split layout (About, Owners) → media as a band under the
 *   text. `fallbackImageUrl` keeps those pages' existing band when unset.
 */
export function PageHero({
  page,
  doc,
  fallbackImageUrl = null,
  navOverlay = true,
  subtitleBelow = true,
  children,
}: {
  page: PageHeroKey
  doc: PageHeroDoc | null
  fallbackImageUrl?: string | null
  /** Slide a photo hero under a clear navbar (default). False keeps the bar solid. */
  navOverlay?: boolean
  /** The subtitle as the intro section under the hero (default): always with a photo, and without one when the page has an intro label / title. False keeps it in the hero (Search). */
  subtitleBelow?: boolean
  /** Extra content under the subtitle (e.g. a small note). */
  children?: React.ReactNode
}) {
  const { locale } = useLocale()
  const d = PAGE_HEROES[page]
  // A video band takes the video's own shape (16:9 until it loads), so the
  // whole frame shows at full width instead of being cropped.
  const [videoRatio, setVideoRatio] = useState(16 / 9)

  const pick = (v: { en?: string | null; es?: string | null } | undefined) =>
    ((locale === 'es' ? v?.es : v?.en) || v?.en || '').trim()

  // With a doc, its values rule (empty subtitle/buttons stay hidden); without
  // one, everything comes from the defaults.
  const eyebrow = (doc && pick(doc.eyebrow)) || d.eyebrow[locale]
  const title = (doc && pick(doc.title)) || d.title[locale]
  const subtitle = doc ? pick(doc.subtitle) : d.subtitle[locale]
  // The intro section's label and title; empty fields use the launch wording.
  const dd = d as { introEyebrow?: { en: string; es: string }; introTitle?: { en: string; es: string } }
  const introEyebrow = (doc && pick(doc.introEyebrow)) || dd.introEyebrow?.[locale] || ''
  const introTitle = (doc && pick(doc.introTitle)) || dd.introTitle?.[locale] || ''
  const defaults = d as { primary?: { label: { en: string; es: string }; href: string }; secondary?: { label: { en: string; es: string }; href: string } }
  const btn = (which: 'primary' | 'secondary') => {
    if (doc) {
      const label = pick(doc[which].label)
      const href = doc[which].href?.trim()
      return label && href ? { label, href } : null
    }
    const def = defaults[which]
    return def ? { label: def.label[locale], href: def.href } : null
  }
  const primary = btn('primary')
  const secondary = btn('secondary')

  const images = doc?.imageUrls?.length
    ? doc.imageUrls
    : // The fallback only fills an otherwise empty hero — never a video's
      // poster (it isn't in the page's Studio doc, so editors can't find it).
      d.layout === 'split' && fallbackImageUrl && !doc?.videoUrl
      ? [fallbackImageUrl]
      : []
  const video = doc?.videoUrl ?? null
  const hasMedia = images.length > 0 || Boolean(video)
  const overlay = Math.min(70, Math.max(0, doc?.overlay ?? 35)) / 100
  const onPhoto = d.layout === 'single' && hasMedia
  // The intro goes under the hero as its own section: always with a photo, and
  // without one when it has a label / title (otherwise it stays under the title).
  const introBelow = d.layout === 'single' && subtitleBelow && Boolean(subtitle) && (onPhoto || Boolean(introEyebrow || introTitle))
  const introSection = introBelow ? <IntroSection eyebrow={introEyebrow} title={introTitle} text={subtitle} /> : null
  // Only a photo hero sits under the clear navbar; plain text keeps it solid.
  const navOverlayProps = useNavOverlay(navOverlay && onPhoto)

  const buttons =
    primary || secondary ? (
      <div className="flex flex-wrap gap-3 mt-8">
        {primary && <Cta {...primary} primary onPhoto={onPhoto} />}
        {secondary && <Cta {...secondary} primary={false} onPhoto={onPhoto} />}
      </div>
    ) : null

  // ── Split: headline beside the intro, optional photo band below ─────────
  if (d.layout === 'split') {
    return (
      <section className="border-b border-line">
        <div className="container mx-auto px-4 pt-32 sm:pt-44 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <span className="eyebrow">{eyebrow}</span>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] measure-display whitespace-pre-line">
                {withItalics(title)}
              </h1>
            </div>
            <div className="lg:col-span-5 lg:pt-9">
              {subtitle && <p className="text-lg text-body-strong font-light leading-relaxed whitespace-pre-line">{subtitle}</p>}
              {children}
              {buttons}
            </div>
          </div>
        </div>
        {hasMedia && (
          <div
            className={cn('relative w-full overflow-hidden bg-sand', !video && 'aspect-[4/3] sm:aspect-[21/9]')}
            style={video ? { aspectRatio: videoRatio } : undefined}
          >
            <HeroMedia images={images} video={video} onVideoRatio={setVideoRatio} />
          </div>
        )}
      </section>
    )
  }

  // ── Single with photo: full-width image, white text ─────────────────────
  if (onPhoto) {
    const heroSection = (
      <section {...navOverlayProps} className="relative overflow-hidden bg-ink text-surface min-h-[60svh] sm:min-h-[560px] flex items-end">
        <HeroMedia images={images} video={video} />
        <HeroScrim strength={overlay} />
        <div className="relative container mx-auto px-4 pt-32 pb-10 sm:pb-14">
          <p className="eyebrow !text-white/70 mb-6">{eyebrow}</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl max-w-4xl leading-[1.05] whitespace-pre-line">{withItalics(title)}</h1>
          {subtitle && !introBelow && (
            <p className="text-lg sm:text-xl text-white/85 font-light mt-8 max-w-2xl leading-relaxed whitespace-pre-line">{subtitle}</p>
          )}
          {children && <div className="[&_*]:!text-white/70">{children}</div>}
          {buttons}
        </div>
      </section>
    )
    return (
      <>
        {heroSection}
        {introSection}
      </>
    )
  }

  // ── Single, no photo: editorial text hero ────────────────────────────────
  const textHero = (
    <section className="bg-canvas border-b border-line">
      <div className="container mx-auto px-4 pt-12 sm:pt-24 pb-12 sm:pb-16">
        <p className="eyebrow mb-6">{eyebrow}</p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink max-w-4xl whitespace-pre-line">{withItalics(title)}</h1>
        {subtitle && !introBelow && (
          <p className="text-lg sm:text-xl text-muted font-light mt-8 max-w-2xl leading-relaxed whitespace-pre-line">{subtitle}</p>
        )}
        {children}
        {buttons}
      </div>
    </section>
  )
  return (
    <>
      {textHero}
      {introSection}
    </>
  )
}
