"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SegmentedOption<T extends string = string> {
  value: T
  label: React.ReactNode
}

interface SegmentedControlProps<T extends string = string> {
  options: SegmentedOption<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
  /** Accessible group label (visually hidden via aria-label). */
  ariaLabel?: string
}

/**
 * Single-select segmented control (e.g. For rent / For sale). Radiogroup
 * semantics with arrow-key roving for keyboard users.
 */
function SegmentedControl<T extends string = string>({
  options,
  value,
  onValueChange,
  className,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    e.preventDefault()
    const dir = e.key === "ArrowRight" ? 1 : -1
    const next = (index + dir + options.length) % options.length
    onValueChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-fit overflow-hidden rounded-[2px] border border-line",
        className
      )}
    >
      {options.map((opt, i) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onValueChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "px-5 py-2.5 text-xs uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              active
                ? "bg-ink text-surface"
                : "bg-transparent text-muted-2 hover:text-ink"
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export { SegmentedControl }
