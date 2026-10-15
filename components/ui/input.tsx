import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldClass } from "./field"

export interface InputProps extends React.ComponentProps<"input"> {
  /**
   * Kept for compatibility with older call sites. Every input now uses the
   * single site-wide field style (see components/ui/field.tsx).
   */
  variant?: "default" | "underline"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(fieldClass, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
