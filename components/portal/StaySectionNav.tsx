import { ScrollToLink } from '@/components/portal/ScrollToLink'

export interface StaySectionLink {
  id: string
  label: string
  /** Small count shown after the label, e.g. outstanding to-dos. */
  count?: number
}

/**
 * Sticky row of jump links for the stay page, so a long list of sections
 * stays easy to move around. Scrolls sideways on narrow screens.
 */
export function StaySectionNav({ links }: { links: StaySectionLink[] }) {
  if (links.length < 2) return null

  return (
    <nav className="sticky top-0 z-20 -mx-6 px-6 mb-10 bg-canvas/95 backdrop-blur-sm border-b border-line">
      <ul className="flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((link) => (
          <li key={link.id} className="shrink-0">
            <ScrollToLink
              targetId={link.id}
              className="inline-flex items-center gap-1.5 py-3.5 text-xs uppercase tracking-[0.14em] text-muted hover:text-ink transition-colors"
            >
              {link.label}
              {typeof link.count === 'number' && link.count > 0 && (
                <span className="inline-flex min-w-[1.25rem] h-5 items-center justify-center px-1 rounded-[2px] bg-ink text-surface text-[10px] tracking-normal tabular-nums">
                  {link.count}
                </span>
              )}
            </ScrollToLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
