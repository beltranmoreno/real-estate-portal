import Link from 'next/link'
import Image from 'next/image'

/**
 * Shared portal header — LCS logo on the left (mirrors the public site),
 * with page-specific actions (locale switcher, back link, user button)
 * passed as children on the right.
 */
export function PortalHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-white border-b border-stone-200">
      <div className="container mx-auto px-6 py-4 max-w-5xl flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="Home">
          <Image
            src="/Logo_LCS_Real_Estate.png"
            alt="Leticia Coudray Real Estate"
            width={220}
            height={88}
            className="h-10 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-5">{children}</div>
      </div>
    </header>
  )
}
