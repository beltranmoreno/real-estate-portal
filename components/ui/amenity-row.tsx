import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Amenity item — a 5px brand dot + label. Deliberately no icon set; the dot
 * is the mark. Use inside a multi-column grid.
 */
const AmenityRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 text-[15px] font-light text-body-strong",
      className
    )}
    {...props}
  >
    <span
      aria-hidden="true"
      className="size-[5px] shrink-0 rounded-full bg-brand"
    />
    {children}
  </div>
))
AmenityRow.displayName = "AmenityRow"

export { AmenityRow }
