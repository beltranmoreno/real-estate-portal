import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  /** `default` = boxed field; `underline` = editorial borderless field. */
  variant?: "default" | "underline"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full bg-surface text-base text-ink font-light placeholder:text-faint focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          variant === "underline"
            ? "border-0 border-b border-control-border bg-transparent px-0 py-2.5 rounded-none focus-visible:border-brand"
            : "rounded-[2px] border border-line px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }