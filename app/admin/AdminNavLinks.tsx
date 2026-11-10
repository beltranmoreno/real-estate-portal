'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
}

/**
 * Admin sidebar links with active-route highlighting, in groups separated by
 * a divider (e.g. the main pages, then Money). Client component so it can
 * read the current pathname; the layout around it stays a server component
 * (it runs the admin auth gate).
 */
export function AdminNavLinks({ groups }: { groups: NavItem[][] }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {groups
        .filter((g) => g.length > 0)
        .map((group, i) => (
          <div key={i} className={i > 0 ? 'mt-3 pt-3 border-t border-stone-200 space-y-1' : 'space-y-1'}>
            {group.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block px-3 py-2 text-sm rounded-sm transition-colors ${
                    active
                      ? 'bg-stone-100 text-stone-900 font-normal'
                      : 'font-light text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
    </>
  )
}

/**
 * The phone version of the sidebar: a top bar with a menu button that opens
 * the same links (and whatever the layout passes as children, e.g. the
 * account controls). Closes when a link is followed.
 */
export function AdminMobileNav({
  title,
  groups,
  menuLabel,
  children,
}: {
  title: string
  groups: NavItem[][]
  menuLabel: { open: string; close: string }
  children?: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/admin" className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.25em] text-stone-500 leading-none">Leticia Coudray</p>
          <p className="text-sm font-light text-stone-900 mt-1 leading-none">{title}</p>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? menuLabel.close : menuLabel.open}
          className="p-2 -mr-2 text-stone-700"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-stone-200 px-3 py-3 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <AdminNavLinks groups={groups} />
          {children && <div className="mt-3 pt-3 border-t border-stone-200">{children}</div>}
        </nav>
      )}
    </div>
  )
}
