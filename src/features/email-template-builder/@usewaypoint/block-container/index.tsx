// import React, { CSSProperties } from "react"
// import { z } from "zod"

// const COLOR_SCHEMA = z
//   .string()
//   .regex(/^#[0-9a-fA-F]{6}$/)
//   .nullable()
//   .optional()

// const PADDING_SCHEMA = z
//   .object({
//     top: z.number(),
//     bottom: z.number(),
//     right: z.number(),
//     left: z.number(),
//   })
//   .optional()
//   .nullable()

// const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
//   padding
//     ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
//     : undefined

// export const ContainerPropsSchema = z.object({
//   style: z
//     .object({
//       backgroundColor: COLOR_SCHEMA,
//       borderColor: COLOR_SCHEMA,
//       borderRadius: z.number().optional().nullable(),
//       padding: PADDING_SCHEMA,
//       position: z
//         .object({ x: z.number(), y: z.number() })
//         .optional()
//         .nullable(),
//     })
//     .optional()
//     .nullable(),
// })

// export type ContainerProps = {
//   style?: z.infer<typeof ContainerPropsSchema>["style"]
//   props?: z.infer<typeof ContainerPropsSchema>["props"]
//   children?: JSX.Element | JSX.Element[] | null
// }

// function getBorder(style: ContainerProps["style"]) {
//   if (!style || !style.borderColor) {
//     return undefined
//   }
//   return `1px solid ${style.borderColor}`
// }

// export function Container({ style, props, children }: ContainerProps) {
//   const position = props?.position || { x: 50, y: 50 }
//   const wStyle: CSSProperties = {
//     backgroundColor: style?.backgroundColor ?? undefined,
//     border: getBorder(style),
//     borderRadius: style?.borderRadius ?? undefined,
//     padding: getPadding(style?.padding),
//     left: `${position.x}px`,
//     top: `${position.y}px`,
//   }
//   if (!children) {
//     return <div style={wStyle} />
//   }
//   return <div style={wStyle}>{children}</div>
// }

"use client"

import { CSSProperties, ReactNode } from "react"
import { z } from "zod"

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional()

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable()

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding
    ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
    : undefined

export const ContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      borderColor: COLOR_SCHEMA,
      borderRadius: z.number().optional().nullable(),
      padding: PADDING_SCHEMA,
      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
      position: z
        .object({ x: z.number(), y: z.number() })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
  props: z
    .object({
      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
      // position: z
      //   .object({ x: z.number(), y: z.number() })
      //   .optional()
      //   .nullable(),
      childrenIds: z.array(z.string()).optional().nullable(), // ← Add childrenIds here
    })
    .optional()
    .nullable(),
})

export type ContainerProps = {
  style?: z.infer<typeof ContainerPropsSchema>["style"]
  props?: z.infer<typeof ContainerPropsSchema>["props"]
  children?: ReactNode
}

function getBorder(style: ContainerProps["style"]) {
  if (!style || !style.borderColor) {
    return undefined
  }
  return `1px solid ${style.borderColor}`
}

export function Container({ style, props, children }: ContainerProps) {
  // const position = props?.position || style?.position || { x: 50, y: 50 }

  // Use width/height from props first, then fall back to style
  const width = props?.width || style?.width
  const height = props?.height || style?.height

  const wStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    border: getBorder(style),
    borderRadius: style?.borderRadius ?? undefined,
    padding: getPadding(style?.padding),
    // left: `${position.x}px`,
    // top: `${position.y}px`,
    // Add width and height if they exist (check for null/undefined, not falsy)
    ...(width != null && { width: `${width}px` }),
    ...(height != null && { height: `${height}px` }),
  }

  if (!children) {
    return <div style={wStyle} />
  }
  return <div style={wStyle}>{children}</div>
}
