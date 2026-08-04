import * as React from "react"

import { cn } from "@/lib/utils"

interface SectionHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Uppercase letter-spaced label above the title. */
  eyebrow?: React.ReactNode
  /** Serif section title. */
  title: React.ReactNode
  /** Right-aligned action, e.g. a tertiary "All 32" link. */
  action?: React.ReactNode
  as?: "h2" | "h3"
  titleClassName?: string
}

/**
 * The design system's section header — eyebrow + serif title, baseline-bottom
 * aligned with an optional tertiary link, over a 1px hairline rule.
 */
const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ eyebrow, title, action, as = "h2", className, titleClassName, ...props }, ref) => {
    const Heading = as
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-end justify-between gap-6 border-b border-line pb-4",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-2">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <Heading
            className={cn("font-title text-2xl sm:text-3xl text-ink", titleClassName)}
          >
            {title}
          </Heading>
        </div>
        {action ? <div className="shrink-0 pb-1">{action}</div> : null}
      </div>
    )
  }
)
SectionHeader.displayName = "SectionHeader"

export { SectionHeader }
