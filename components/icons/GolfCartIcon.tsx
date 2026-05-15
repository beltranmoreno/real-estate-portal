import React from 'react'

interface Props {
  className?: string
}

/**
 * Golf cart icon — Lucide doesn't ship one, so this is a hand-drawn
 * SVG that matches Lucide's stroke style (1.5 stroke width, rounded
 * caps/joins, currentColor). Looks at home next to the other concierge
 * service icons.
 *
 * Composition: roofline + two roof supports + a body bar + two wheels +
 * a small steering nub up front.
 */
export function GolfCartIcon({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Roof */}
      <path d="M3 7h15" />
      {/* Roof supports (front + rear pillar) */}
      <path d="M4.5 7v6" />
      <path d="M16.5 7v6" />
      {/* Body / seat line */}
      <path d="M3 13h18" />
      {/* Front bumper extension to the right of the roof */}
      <path d="M18 9h3v4" />
      {/* Steering wheel nub */}
      <path d="M14 10v3" />
      {/* Wheels */}
      <circle cx="7" cy="16.5" r="1.75" />
      <circle cx="17" cy="16.5" r="1.75" />
    </svg>
  )
}

export default GolfCartIcon
