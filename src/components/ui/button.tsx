import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:from-purple-700 hover:via-pink-700 hover:to-red-700",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40",
        outline:
          "border-2 border-gradient-to-r from-purple-600 to-pink-600 bg-transparent text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white shadow-lg shadow-purple-500/10 hover:shadow-purple-500/25",
        secondary:
          "bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:from-slate-700 hover:to-slate-800 shadow-lg shadow-slate-500/20",
        ghost: "text-purple-600 hover:bg-purple-100 hover:text-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20",
        link: "text-purple-600 underline-offset-4 hover:underline hover:text-purple-700",
        glow: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70 border border-cyan-400/50"
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
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
