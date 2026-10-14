'use client'

/**
 * An in-page anchor that eases to its target instead of jumping there.
 * Stays a real <a href="#…"> so it still works without JS, and falls back to
 * an instant jump when the guest asked for reduced motion.
 */
export function ScrollToLink({
  targetId,
  className = '',
  children,
}: {
  /** The id of the element to scroll to, without the leading '#'. */
  targetId: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <a
      href={`#${targetId}`}
      className={className}
      onClick={(e) => {
        const el = document.getElementById(targetId)
        if (!el) return // no target yet — let the browser handle the hash
        e.preventDefault()
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      }}
    >
      {children}
    </a>
  )
}
