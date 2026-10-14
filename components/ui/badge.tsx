import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-ink bg-ink text-surface",
        secondary: "border-transparent bg-sand text-ink",
        destructive:
          "text-status-attention bg-status-attention-bg border-status-attention-border",
        outline: "border-line text-muted bg-transparent",
        // Status semantics — the desaturated triples.
        success:
          "text-status-confirmed bg-status-confirmed-bg border-status-confirmed-border",
        warning:
          "text-status-pending bg-status-pending-bg border-status-pending-border",
        confirmed:
          "text-status-confirmed bg-status-confirmed-bg border-status-confirmed-border",
        pending:
          "text-status-pending bg-status-pending-bg border-status-pending-border",
        attention:
          "text-status-attention bg-status-attention-bg border-status-attention-border",
        info: "text-status-info bg-status-info-bg border-status-info-border",
        // Card / image tag — frosted, sits over photography.
        tag: "border-transparent bg-surface/90 text-ink backdrop-blur-sm tracking-[0.16em] text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }