import { Paragraphs } from './Paragraphs'

/**
 * A page's intro as its first section under the hero — small label and title
 * on the left, the text on the right — the same layout as the sections below
 * it. Without a label or title the text sits alone in the right-hand column.
 */
export function IntroSection({
  eyebrow,
  title,
  text,
  className = 'pt-16 lg:pt-24',
}: {
  eyebrow?: string | null
  title?: string | null
  text?: string | null
  /** Vertical spacing (the next section usually brings its own). */
  className?: string
}) {
  if (!text?.trim()) return null
  const heading = Boolean(eyebrow?.trim() || title?.trim())
  return (
    <section className={`container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 ${className}`}>
      {heading && (
        <div className="lg:col-span-5">
          {eyebrow?.trim() && <span className="eyebrow">{eyebrow}</span>}
          {title?.trim() && (
            <h2 className="mt-3 font-title text-3xl sm:text-4xl text-ink leading-tight whitespace-pre-line">{title}</h2>
          )}
        </div>
      )}
      <div className={`${heading ? 'lg:col-span-7 lg:pt-9' : 'lg:col-start-6 lg:col-span-7'} measure-body`}>
        <div className="space-y-4 text-lg text-body-strong font-light leading-relaxed">
          <Paragraphs text={text} />
        </div>
      </div>
    </section>
  )
}
