import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { cn } from '@/lib/utils'

/**
 * Sanity Portable Text styled with the design tokens. The project doesn't
 * ship @tailwindcss/typography, so `prose` classes are no-ops — every element
 * is styled explicitly here instead.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,
    h2: ({ children }) => (
      <h2 className="font-title text-2xl sm:text-3xl text-ink leading-tight mt-12 mb-4 first:mt-0">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-title text-xl sm:text-2xl text-ink leading-tight mt-10 mb-3 first:mt-0">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="eyebrow mt-8 mb-3 first:mt-0">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l-2 border-brand pl-6 font-title text-xl text-ink leading-snug">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-5 space-y-2 pl-5 list-disc marker:text-muted-2">{children}</ul>,
    number: ({ children }) => <ol className="mb-5 space-y-2 pl-5 list-decimal marker:text-muted-2">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-medium text-ink">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => {
      const href: string = value?.href || '#'
      const external = /^https?:\/\//.test(href)
      return (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="text-ink underline decoration-line underline-offset-4 hover:decoration-ink transition-colors"
        >
          {children}
        </a>
      )
    },
  },
  types: {
    image: ({ value }) =>
      value?.asset ? (
        <figure className="my-10">
          <div className="relative aspect-[3/2] bg-sand overflow-hidden">
            <Image
              src={urlFor(value).width(1400).height(933).url()}
              alt={value.alt || ''}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-2">{value.caption}</figcaption>
          )}
        </figure>
      ) : null,
  },
}

export function RichText({ value, className }: { value: any; className?: string }) {
  if (!value) return null
  return (
    <div className={cn('text-[17px] text-body-strong font-light leading-relaxed', className)}>
      <PortableText value={value} components={components} />
    </div>
  )
}
