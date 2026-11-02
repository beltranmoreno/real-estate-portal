'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/**
 * Navbar over a page hero. A page that opens with a full-bleed hero slides it
 * under the navbar, which stays transparent until the visitor scrolls past.
 *
 * A hero opts in by spreading `useNavOverlay()` on its root element:
 *
 *   <section {...useNavOverlay()} className="…">
 *
 * That renders `data-nav-overlay` into the server HTML, and the navbar's
 * styles key off it with CSS `:has()` (the `nav-overlay:` / `nav-clear:`
 * variants in globals.css). So the bar is right on the very first paint and on
 * every client navigation: no route lists, no measuring. The ref lets an
 * IntersectionObserver tell the navbar when the hero has scrolled under it.
 *
 * Pass `false` to opt a hero out, e.g. `useNavOverlay(hasPhoto)` for a hero
 * that may be plain text on a light background.
 */

/** Height of the navbar (h-20): the hero counts as scrolled past once only
 *  this much of it is left under the bar. */
const NAV_HEIGHT = 80

interface NavOverlayValue {
  /** The visitor has scrolled the hero up under the navbar. */
  pastHero: boolean
  setHero: React.Dispatch<React.SetStateAction<HTMLElement | null>>
}

const NavOverlayContext = createContext<NavOverlayValue>({
  pastHero: false,
  setHero: () => {},
})

export function NavOverlayProvider({ children }: { children: React.ReactNode }) {
  const [hero, setHero] = useState<HTMLElement | null>(null)
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    setPastHero(false)
    if (!hero) return
    // Tracks the hero against the viewport minus the bar, so it follows any
    // change in the hero's size (fonts, images, resize) and scroll restoration.
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: `-${NAV_HEIGHT}px 0px 0px 0px` }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [hero])

  return (
    <NavOverlayContext.Provider value={{ pastHero, setHero }}>
      {children}
    </NavOverlayContext.Provider>
  )
}

export const useNavOverlayState = () => useContext(NavOverlayContext)

/** Props for a hero's root element; `{}` when `enabled` is false. */
export function useNavOverlay(enabled = true) {
  const { setHero } = useContext(NavOverlayContext)
  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      setHero(el)
      // Only clear if a newer hero hasn't already taken over (route changes).
      return () => setHero((current) => (current === el ? null : current))
    },
    [setHero]
  )
  return enabled ? { ref, 'data-nav-overlay': '' } : {}
}
