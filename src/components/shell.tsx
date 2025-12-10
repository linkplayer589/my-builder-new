import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const shellVariants = cva("grid items-center pb-8 pt-0 md:py-0", {
  variants: {
    variant: {
      default: "container",
      sidebar: "",
      centered: "container max-w-2xl flex-col justify-center py-0",
      markdown: "container max-w-3xl py-0 md:py-0 lg:py-0",
      full: "container max-w-full flex-col justify-center py-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface ShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shellVariants> {
  as?: React.ElementType
}

function Shell({
  className,
  as: Comp = "section",
  variant,
  ...props
}: ShellProps) {
  return (
    <Comp className={cn(shellVariants({ variant }), className)} {...props} />
  )
}

export { Shell, shellVariants }
