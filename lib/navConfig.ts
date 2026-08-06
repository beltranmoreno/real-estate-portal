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
export const IMMERSIVE_HERO_ROUTES: Array<string | RegExp> = [
  '/', // homepage hero
  /^\/courses\/[^/]+$/, // individual golf course (not the /courses index)
  /^\/collection\/[^/]+$/, // public collection page
]

/** Does the given pathname render a hero the navbar should overlay? */
export function hasImmersiveHero(pathname: string): boolean {
  return IMMERSIVE_HERO_ROUTES.some((matcher) =>
    typeof matcher === 'string' ? matcher === pathname : matcher.test(pathname)
  )
}
