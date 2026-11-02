/**
 * Routes whose page opens with a full-bleed hero that the navbar should
 * overlay — the bar renders fixed and transparent until the guest scrolls
 * past the hero (see components/Navbar.tsx).
 *
 * To opt a page in, add a matcher here — nothing in the Navbar needs to
 * change. A matcher is either an exact pathname string or a RegExp.
 *
 * This is evaluated synchronously from `usePathname()`, so the decision is
 * available on the first (server) render — no post-hydration flash.
 */
function PAGE_HERO_ROUTES(): string[] {
  return ['/search', '/services/concierge', '/restaurants', '/courses', '/contact', '/casa-de-campo']
}

const RESORT_GUIDE_ROUTE = /^\/casa-de-campo\/[^/]+$/

/** Overlay routes where the hero may be plain text: start solid, not clear. */
export const heroMayBePlain = (pathname: string) =>
  PAGE_HERO_ROUTES().includes(pathname) || RESORT_GUIDE_ROUTE.test(pathname)

export const IMMERSIVE_HERO_ROUTES: Array<string | RegExp> = [
  '/', // homepage hero
  /^\/courses\/[^/]+$/, // individual golf course (not the /courses index)
  /^\/collection\/[^/]+$/, // public collection page
  // Pages whose Studio hero (Page Heroes) can have a photo. The bar only goes
  // transparent when the photo hero is actually there ([data-hero]); with a
  // plain text hero it stays solid.
  ...PAGE_HERO_ROUTES(),
  RESORT_GUIDE_ROUTE, // resort guides (The Marina, Altos de Chavón…)
]

/** Does the given pathname render a hero the navbar should overlay? */
export function hasImmersiveHero(pathname: string): boolean {
  return IMMERSIVE_HERO_ROUTES.some((matcher) =>
    typeof matcher === 'string' ? matcher === pathname : matcher.test(pathname)
  )
}

type Bi = { en?: string | null; es?: string | null }
export interface ResortMenuItem {
  label: { en: string; es: string }
  href: string
}

/**
 * The Resort menu: the Casa de Campo page, then the resort guides from
 * Studio (in their menu order), then the fixed resort pages.
 */
export function resortMenuItems(guides: { slug: string; label: Bi }[]): ResortMenuItem[] {
  return [
    { label: { en: 'Casa de Campo', es: 'Casa de Campo' }, href: '/casa-de-campo' },
    ...guides.map((g) => {
      const en = g.label.en || g.label.es || g.slug
      return { label: { en, es: g.label.es || en }, href: `/casa-de-campo/${g.slug}` }
    }),
    { label: { en: 'Restaurants', es: 'Restaurantes' }, href: '/restaurants' },
    { label: { en: 'Golf Courses', es: 'Campos de Golf' }, href: '/courses' },
    { label: { en: 'Activities', es: 'Actividades' }, href: '/info/activities' },
  ]
}
