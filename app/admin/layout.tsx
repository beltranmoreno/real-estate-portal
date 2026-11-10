import type { Metadata } from 'next'
import Link from 'next/link'
import { ClerkProvider, UserButton } from '@clerk/nextjs'
import { requireStaffOrAbove } from '@/lib/auth/requireRole'
import { isAdminRole } from '@/lib/auth/permissions'
import { tFor, toLocale } from '@/lib/i18n'
import { PortalLocaleSwitcher } from '@/components/portal/PortalLocaleSwitcher'
import { AdminMobileNav, AdminNavLinks } from './AdminNavLinks'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Admin · Leticia Coudray Real Estate',
  description: 'Internal portal management',
  robots: { index: false, follow: false, nocache: true },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Gates the entire /admin tree: ADMIN, AGENT and STAFF. Renters and
  // unauthenticated users get redirected to /portal. STAFF only get the
  // dashboard, bookings and calendar — the other pages call requireAdmin()
  // themselves, and the booking pages hide the money from them.
  const user = await requireStaffOrAbove()
  const fullAdmin = isAdminRole(user.role)
  const locale = toLocale(user.locale)
  const t = tFor(locale)

  const navItems = [
    { href: '/admin', label: t('Dashboard', 'Panel') },
    { href: '/admin/calendar', label: t('Calendar', 'Calendario') },
    ...(fullAdmin ? [{ href: '/admin/inquiries', label: t('Inquiries', 'Consultas') }] : []),
    { href: '/admin/bookings', label: t('Bookings', 'Reservas') },
    ...(fullAdmin ? [{ href: '/admin/users', label: t('Users', 'Usuarios') }] : []),
  ]

  // Finances across every booking — its own section, ADMIN only (not agents or
  // staff). The page checks the role itself too.
  const financeItems =
    user.role === 'ADMIN' ? [{ href: '/admin/finances', label: t('Finances', 'Finanzas') }] : []

  // Email templates and settings — their own section below Finances.
  const emailItems = fullAdmin ? [{ href: '/admin/emails', label: t('Emails', 'Correos') }] : []

  const navGroups = [navItems, financeItems, emailItems]

  const account = (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-light text-stone-800 truncate">
          {user.firstName ?? user.email}
        </p>
        <p className="text-xs text-stone-500 font-light tracking-wide uppercase">
          {user.role}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <PortalLocaleSwitcher current={locale} />
        <UserButton />
      </div>
    </div>
  )

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-stone-50 md:flex">
        <AdminMobileNav
          title={t('Admin', 'Administración')}
          groups={navGroups}
          menuLabel={{ open: t('Open menu', 'Abrir menú'), close: t('Close menu', 'Cerrar menú') }}
        >
          {account}
          <Link href="/" target="_blank" rel="noopener" className="block mt-3 text-xs uppercase tracking-[0.15em] font-light text-stone-500">
            {t('View public site', 'Ver sitio público')} ↗
          </Link>
        </AdminMobileNav>

        {/* Sidebar — sticky to the viewport top so it stays visible while
            the main content scrolls. `h-screen` pins it to exactly the
            viewport height, so the user info pill at the bottom is always
            anchored at the bottom of the screen, not the bottom of the
            page content. */}
        <aside className="hidden md:flex w-60 bg-white border-r border-stone-200 flex-col sticky top-0 h-screen flex-shrink-0">
          <div className="px-6 py-6 border-b border-stone-200">
            <Link href="/" className="block">
              <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                Leticia Coudray
              </p>
              <p className="text-base font-light text-stone-900 mt-1">
                {t('Admin', 'Administración')}
              </p>
            </Link>
          </div>

          <nav className="flex-1 p-3 flex flex-col overflow-y-auto">
            <AdminNavLinks groups={navGroups} />

            {/* Spacer pushes the public-site link to the bottom of the
                nav, separated from the admin sections above. */}
            <div className="flex-1" />

            <Link
              href="/"
              target="_blank"
              rel="noopener"
              className="block px-3 py-2 text-xs uppercase tracking-[0.15em] font-light text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              {t('View public site', 'Ver sitio público')} ↗
            </Link>
          </nav>

          <div className="px-4 py-4 border-t border-stone-200">{account}</div>
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
