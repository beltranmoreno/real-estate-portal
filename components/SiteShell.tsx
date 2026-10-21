import { ClerkProvider } from '@clerk/nextjs'
import { LocaleProvider } from '@/contexts/LocaleContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ImageProtection } from '@/components/ImageProtection'

/**
 * The public site's frame: navbar, footer and the providers they need.
 * Used by the (main) layout and by the global 404, which renders outside
 * any route group and would otherwise have no header or footer.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <LocaleProvider>
        <div className="protect-images justify-text flex flex-col min-h-screen">
          <ImageProtection />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </LocaleProvider>
    </ClerkProvider>
  )
}
