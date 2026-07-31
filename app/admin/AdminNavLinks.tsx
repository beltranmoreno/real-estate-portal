'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
}

/**
 * Admin sidebar links with active-route highlighting. Client component so
 * it can read the current pathname; the layout around it stays a server
 * component (it runs the admin auth gate).
 */
export function AdminNavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {items.map((item) => {
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
    </>
  )
}
