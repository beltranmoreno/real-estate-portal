'use client'

import { useEffect } from 'react'

/**
 * Discourages casual saving of photos: blocks the right-click menu and
 * dragging on images and video. A deterrent only — screenshots and the
 * browser's dev tools still work. Pair with the `.protect-images` wrapper
 * class (globals.css), which also disables long-press saving on iOS.
 */
export function ImageProtection() {
  useEffect(() => {
    const isMedia = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('img, picture, video, [data-protect-image]'))

    const block = (e: Event) => {
      if (isMedia(e.target)) e.preventDefault()
    }

    document.addEventListener('contextmenu', block)
    document.addEventListener('dragstart', block)
    return () => {
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('dragstart', block)
    }
  }, [])

  return null
}
