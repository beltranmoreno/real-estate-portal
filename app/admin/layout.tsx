import type { Metadata } from 'next'
import Link from 'next/link'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { requireAdmin } from '@/lib/auth/requireRole'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Admin · Leticia Coudray Real Estate',
  description: 'Internal portal management',
  robots: { index: false, follow: false, nocache: true },
}

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/calendar', label: 'Calendar' },
  { href: '/admin/users', label: 'Users' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Gates the entire /admin tree. Renters and unauthenticated users
  // get redirected to /portal. Pages can call requireAdmin() themselves
  // too — this is the outer-most gate.
  const user = await requireAdmin()

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-stone-50 flex">
        {/* Sidebar — sticky to the viewport top so it stays visible while
            the main content scrolls. `h-screen` pins it to exactly the
            viewport height, so the user info pill at the bottom is always
            anchored at the bottom of the screen, not the bottom of the
            page content. */}
        <aside className="w-60 bg-white border-r border-stone-200 flex flex-col sticky top-0 h-screen flex-shrink-0">
          <div className="px-6 py-6 border-b border-stone-200">
            <Link href="/" className="block">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                Leticia Coudray
              </p>
              <p className="text-base font-light text-stone-900 mt-1">Admin</p>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm font-light text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-stone-200 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-light text-stone-800 truncate">
                {user.firstName ?? user.email}
              </p>
              <p className="text-xs text-stone-500 font-light tracking-wide uppercase">
                {user.role}
              </p>
            </div>
            <UserButton />
          </div>
        </aside>

        {/* Main */}
        {/* Main content scrolls with the page (not inside a nested
            scroll container) so `position: sticky` on the sidebar works.
            `min-w-0` prevents flex items from blowing out the layout
            when content has long unbreakable strings. */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </ClerkProvider>
  )
}
