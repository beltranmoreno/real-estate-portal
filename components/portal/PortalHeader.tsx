import Link from 'next/link'
import Image from 'next/image'

const LOGO_URL = '/Logo_LCS_Real_Estate.png'

/**
 * Shared portal header — a light bar matching the public site: the brand logo
 * on the left, with page-specific actions (locale switcher, back link, user
 * button) passed as children on the right.
 */
export function PortalHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-surface text-ink border-b border-line">
      <div className="container mx-auto px-6 py-4 max-w-5xl flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="Leticia Coudray — Home">
          <Image
            src={LOGO_URL}
            alt="Leticia Coudray - Real Estate & Services"
            width={256}
            height={256}
            className="w-auto h-14"
            priority
          />
        </Link>
        <div className="flex items-center gap-5">{children}</div>
      </div>
    </header>
  )
}
