import { ClerkProvider } from '@clerk/nextjs'
import { LocaleProvider } from '@/contexts/LocaleContext'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ImageProtection } from '@/components/ImageProtection'
import { getResortNavGuides } from '@/lib/resortGuides'

/**
 * The public site's frame: navbar, footer and the providers they need.
 * Used by the (main) layout and by the global 404, which renders outside
 * any route group and would otherwise have no header or footer.
 */
export default async function SiteShell({ children }: { children: React.ReactNode }) {
  // Resort guides from Studio, listed under The Resort in the menus.
  const resortGuides = (await getResortNavGuides()).map((g) => ({ slug: g.slug, label: g.label }))
  return (
    <ClerkProvider>
      <LocaleProvider>
        <div className="protect-images justify-text flex flex-col min-h-screen">
          <ImageProtection />
          <Navbar resortGuides={resortGuides} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </LocaleProvider>
    </ClerkProvider>
  )
}
