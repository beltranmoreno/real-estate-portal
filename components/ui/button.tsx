import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer",
  {
    variants: {
      variant: {
        // Primary — one filled button per view. Ink → Minitas green on hover.
        default:
          "bg-ink text-surface border border-ink uppercase tracking-[0.14em] text-xs font-medium hover:bg-brand hover:border-brand",
        // Attention — desaturated, never a loud red.
        destructive:
          "bg-status-attention text-surface uppercase tracking-[0.14em] text-xs font-medium hover:opacity-90",
        // Secondary — outline, transparent. Border darkens to ink on hover.
        outline:
          "border border-control-border bg-transparent text-ink uppercase tracking-[0.14em] text-xs font-medium hover:border-ink",
        // Quiet filled — sand.
        secondary:
          "bg-sand text-ink uppercase tracking-[0.14em] text-xs font-medium hover:bg-line",
        ghost: "text-ink hover:bg-sand",
        // Tertiary / inline link — brand text with a hairline underline.
        link: "text-brand underline-offset-4 decoration-brand-line hover:underline",
      },
      size: {
        default: "h-11 px-7 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }