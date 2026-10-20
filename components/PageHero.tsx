'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import { PAGE_HEROES, type PageHeroKey } from '@/sanity/lib/pageHeroDefaults'
import type { PageHeroDoc } from '@/lib/pageHero'

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
 * - No photo → editorial text hero on the canvas.
 * - Photo, single layout → full-width photo with white text.
 * - Photo, split layout (About, Owners) → photo as a band under the text.
 *   `fallbackImageUrl` keeps those pages' existing band when no photo is set.
 */
export function PageHero({
  page,
  doc,
  fallbackImageUrl = null,
  children,
}: {
  page: PageHeroKey
  doc: PageHeroDoc | null
  fallbackImageUrl?: string | null
  /** Extra content under the subtitle (e.g. a small note). */
  children?: React.ReactNode
}) {
  const { locale } = useLocale()
  const d = PAGE_HEROES[page]

  const pick = (v: { en?: string | null; es?: string | null } | undefined) =>
    ((locale === 'es' ? v?.es : v?.en) || v?.en || '').trim()

  // With a doc, its values rule (empty subtitle/buttons stay hidden); without
  // one, everything comes from the defaults.
  const eyebrow = (doc && pick(doc.eyebrow)) || d.eyebrow[locale]
  const title = (doc && pick(doc.title)) || d.title[locale]
  const subtitle = doc ? pick(doc.subtitle) : d.subtitle[locale]
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

  const imageUrl = doc?.imageUrl ?? (d.layout === 'split' ? fallbackImageUrl : null)
  const overlay = Math.min(70, Math.max(0, doc?.overlay ?? 35)) / 100
  const onPhoto = d.layout === 'single' && Boolean(imageUrl)

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
        <div className="container mx-auto px-4 pt-24 sm:pt-36 pb-16 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-7">
              <span className="eyebrow">{eyebrow}</span>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.05] measure-display">
                {withItalics(title)}
              </h1>
            </div>
            <div className="lg:col-span-5 lg:pt-9">
              {subtitle && <p className="text-lg text-body-strong font-light leading-relaxed">{subtitle}</p>}
              {children}
              {buttons}
            </div>
          </div>
        </div>
        {imageUrl && (
          <div className="relative aspect-[4/3] sm:aspect-[21/9] w-full bg-sand">
            <Image src={imageUrl} alt="" fill priority className="object-cover" sizes="100vw" />
          </div>
        )}
      </section>
    )
  }

  // ── Single with photo: full-width image, white text ─────────────────────
  if (onPhoto) {
    return (
      <section className="relative overflow-hidden bg-ink text-surface min-h-[60svh] sm:min-h-[560px] flex items-end">
        <Image src={imageUrl!} alt="" fill priority className="object-cover" sizes="100vw" />
        {overlay > 0 && <div className="absolute inset-0 bg-ink" style={{ opacity: overlay }} />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
        <div className="relative container mx-auto px-4 pt-32 pb-14 sm:pb-20">
          <p className="eyebrow !text-white/70 mb-6">{eyebrow}</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl max-w-4xl leading-[1.05]">{withItalics(title)}</h1>
          {subtitle && (
            <p className="text-lg sm:text-xl text-white/85 font-light mt-8 max-w-2xl leading-relaxed">{subtitle}</p>
          )}
          {children && <div className="[&_*]:!text-white/70">{children}</div>}
          {buttons}
        </div>
      </section>
    )
  }

  // ── Single, no photo: editorial text hero ────────────────────────────────
  return (
    <section className="bg-canvas border-b border-line">
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <p className="eyebrow mb-6">{eyebrow}</p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink max-w-4xl">{withItalics(title)}</h1>
        {subtitle && (
          <p className="text-lg sm:text-xl text-muted font-light mt-8 max-w-2xl leading-relaxed">{subtitle}</p>
        )}
        {children}
        {buttons}
      </div>
    </section>
  )
}
