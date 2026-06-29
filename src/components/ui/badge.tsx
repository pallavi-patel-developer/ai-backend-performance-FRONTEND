import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-[#7C3AED] text-white": variant === "default",
          "border-transparent bg-[#10B981]/20 text-[#10B981]": variant === "success",
          "border-transparent bg-[#F59E0B]/20 text-[#F59E0B]": variant === "warning",
          "border-transparent bg-[#EF4444]/20 text-[#EF4444]": variant === "danger",
          "text-foreground": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
