"use client"

import { CSSProperties } from "react"
import { z } from "zod"

export const SpacerPropsSchema = z.object({
  props: z
    .object({
      height: z.number().gte(0).optional().nullish(),
      width: z.number().gte(0).optional().nullish(),
      // position: z
      //   .object({ x: z.number(), y: z.number() })
      //   .optional()
      //   .nullable(),
    })
    .optional()
    .nullable(),
})

export type SpacerProps = z.infer<typeof SpacerPropsSchema>

export const SpacerPropsDefaults = {
  height: 16,
  width: undefined, // No default width - will use container width by default
}

export function Spacer({ props }: SpacerProps) {
  const style: CSSProperties = {
    height: props?.height ?? SpacerPropsDefaults.height,
    width: props?.width ? `${props.width}px` : "100%", // Use px if width specified, otherwise 100%
    minWidth: props?.width ? `${props.width}px` : undefined,
  }
  return <div style={style} />
}
