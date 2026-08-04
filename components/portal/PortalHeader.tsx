import Link from 'next/link'

/**
 * Shared portal header — the design's dark portal chrome. A serif wordmark on
 * the left (the dark logo PNG wouldn't read on ink), with page-specific actions
 * (locale switcher, back link, user button) passed as children on the right.
 */
export function PortalHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-ink text-surface border-b border-white/10">
      <div className="container mx-auto px-6 py-4 max-w-5xl flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-serif text-xl tracking-[0.02em] text-surface"
          aria-label="Leticia Coudray — Home"
        >
          Leticia Coudray
        </Link>
        <div className="flex items-center gap-5">{children}</div>
      </div>
    </header>
  )
}
