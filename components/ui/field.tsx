import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The one form-field look used across the site and portal: boxed, 44px tall,
 * hairline control border, white surface, ink on focus. Text, email, number,
 * date-picker triggers and selects all share it, so every field reads the same.
 */
export const fieldClass =
  "flex h-11 w-full items-center rounded-[2px] border border-control-border bg-surface px-3 text-sm text-ink font-light placeholder:text-faint transition-colors focus:outline-none focus-visible:outline-none focus:border-ink focus-visible:border-ink disabled:cursor-not-allowed disabled:opacity-50"

/** Same as `fieldClass`, sized for multi-line text. */
export const textareaClass =
  "block w-full min-h-[7rem] rounded-[2px] border border-control-border bg-surface px-3 py-2.5 text-sm text-ink font-light leading-relaxed placeholder:text-faint transition-colors focus:outline-none focus:border-ink disabled:cursor-not-allowed disabled:opacity-50 resize-y"

/**
 * Add to a native <input type="date">. iOS Safari gives date inputs a wide
 * built-in minimum width and centres the value; this lets the field shrink to
 * its column and lines the value up with the other fields.
 */
export const dateField =
  "min-w-0 appearance-none [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:m-0"

/** Native <select>: field look plus room for a chevron overlay. */
export const selectClass = cn(fieldClass, "appearance-none pr-9")

/** The one label look: the system's uppercase eyebrow, above the field. */
export const fieldLabelClass = "eyebrow block mb-2"

export function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn(fieldLabelClass, className)} {...props} />
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(textareaClass, className)} {...props} />
)
Textarea.displayName = "Textarea"
