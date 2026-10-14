import * as React from "react"

import { cn } from "@/lib/utils"

interface FilterChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Selected state — drives the filled/outlined look and aria-pressed. */
  pressed?: boolean
}

/**
 * Toggleable filter chip used in search. A native button with aria-pressed;
 * filled ink when active, hairline outline when not.
 */
const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ className, pressed = false, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-4 py-2 text-xs tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        pressed
          ? "border-ink bg-ink text-surface"
          : "border-control-border text-body-strong hover:border-ink",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
FilterChip.displayName = "FilterChip"

export { FilterChip }
