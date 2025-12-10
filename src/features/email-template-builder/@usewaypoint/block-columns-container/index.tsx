// // absolute positioning removed
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

// const FIXED_WIDTHS_SCHEMA = z
//   .tuple([z.number().nullish(), z.number().nullish(), z.number().nullish()])
//   .optional()
//   .nullable()

// const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
//   padding
//     ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
//     : undefined

// export const ColumnsContainerPropsSchema = z.object({
//   style: z
//     .object({
//       backgroundColor: COLOR_SCHEMA,
//       padding: PADDING_SCHEMA,
//     })
//     .optional()
//     .nullable(),
//   props: z
//     .object({
//       fixedWidths: FIXED_WIDTHS_SCHEMA,
//       columnsCount: z
//         .union([z.literal(2), z.literal(3)])
//         .optional()
//         .nullable(),
//       position: z
//         .object({ x: z.number(), y: z.number() })
//         .optional()
//         .nullable(),
//       columnsGap: z.number().optional().nullable(),
//       contentAlignment: z
//         .enum(["top", "middle", "bottom"])
//         .optional()
//         .nullable(),
//     })
//     .optional()
//     .nullable(),
// })

// type TColumn = JSX.Element | JSX.Element[] | null
// export type ColumnsContainerProps = z.infer<
//   typeof ColumnsContainerPropsSchema
// > & {
//   columns?: TColumn[]
// }

// const ColumnsContainerPropsDefaults = {
//   columnsCount: 2,
//   columnsGap: 0,
//   contentAlignment: "middle",
// } as const

// export function ColumnsContainer({
//   style,
//   columns,
//   props,
// }: ColumnsContainerProps) {
//   const position = props?.position || { x: 50, y: 50 }

//   const wStyle: CSSProperties = {
//     backgroundColor: style?.backgroundColor ?? undefined,
//     padding: getPadding(style?.padding),
//     left: `${position.x}px`,
//     top: `${position.y}px`,
//   }

//   const blockProps = {
//     columnsCount:
//       props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount,
//     columnsGap: props?.columnsGap ?? ColumnsContainerPropsDefaults.columnsGap,
//     contentAlignment:
//       props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment,
//     fixedWidths: props?.fixedWidths,
//   }

//   return (
//     <div style={wStyle}>
//       <table
//         align="center"
//         width="100%"
//         cellPadding="0"
//         border={0}
//         style={{ tableLayout: "fixed", borderCollapse: "collapse" }}
//       >
//         <tbody style={{ width: "100%" }}>
//           <tr style={{ width: "100%" }}>
//             <TableCell index={0} props={blockProps} columns={columns} />
//             <TableCell index={1} props={blockProps} columns={columns} />
//             <TableCell index={2} props={blockProps} columns={columns} />
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   )
// }

// type Props = {
//   props: {
//     fixedWidths: z.infer<typeof FIXED_WIDTHS_SCHEMA>
//     columnsCount: 2 | 3
//     columnsGap: number
//     contentAlignment: "top" | "middle" | "bottom"
//   }
//   index: number
//   columns?: TColumn[]
// }
// function TableCell({ index, props, columns }: Props) {
//   const contentAlignment =
//     props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment
//   const columnsCount =
//     props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount

//   if (columnsCount === 2 && index === 2) {
//     return null
//   }

//   const style: CSSProperties = {
//     boxSizing: "content-box",
//     verticalAlign: contentAlignment,
//     paddingLeft: getPaddingBefore(index, props),
//     paddingRight: getPaddingAfter(index, props),
//     width: props.fixedWidths?.[index] ?? undefined,
//   }
//   const children = (columns && columns[index]) ?? null
//   return <td style={style}>{children}</td>
// }

// function getPaddingBefore(
//   index: number,
//   { columnsGap, columnsCount }: Props["props"]
// ) {
//   if (index === 0) {
//     return 0
//   }
//   if (columnsCount === 2) {
//     return columnsGap / 2
//   }
//   if (index === 1) {
//     return columnsGap / 3
//   }
//   return (2 * columnsGap) / 3
// }

// function getPaddingAfter(
//   index: number,
//   { columnsGap, columnsCount }: Props["props"]
// ) {
//   if (columnsCount === 2) {
//     if (index === 0) {
//       return columnsGap / 2
//     }
//     return 0
//   }

//   if (index === 0) {
//     return (2 * columnsGap) / 3
//   }
//   if (index === 1) {
//     return columnsGap / 3
//   }
//   return 0
// }
"use client"

import { CSSProperties } from "react"
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

const FIXED_WIDTHS_SCHEMA = z.string().optional().nullable()

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding
    ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`
    : undefined

export const ColumnsContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      fixedWidths: FIXED_WIDTHS_SCHEMA,
      columnsCount: z
        .union([z.literal(2), z.literal(3), z.literal(4)])
        .optional()
        .nullable(),
      // position: z
      //   .object({ x: z.number(), y: z.number() })
      //   .optional()
      //   .nullable(),
      columnsGap: z.number().optional().nullable(),
      contentAlignment: z
        .enum(["top", "middle", "bottom"])
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
})

type TColumn = React.ReactNode

export type ColumnsContainerProps = z.infer<
  typeof ColumnsContainerPropsSchema
> & {
  columns?: TColumn[]
}

const ColumnsContainerPropsDefaults = {
  columnsCount: 2,
  columnsGap: 0,
  contentAlignment: "middle",
} as const

export function ColumnsContainer({
  style,
  columns,
  props,
}: ColumnsContainerProps) {
  // const position = props?.position || { x: 50, y: 50 }

  const wStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    padding: getPadding(style?.padding),
    // left: `${position.x}px`,
    // top: `${position.y}px`,
  }

  const blockProps = {
    columnsCount:
      props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount,
    columnsGap: props?.columnsGap ?? ColumnsContainerPropsDefaults.columnsGap,
    contentAlignment:
      props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment,
    fixedWidths: props?.fixedWidths,
  }

  const columnWidths = blockProps.fixedWidths
    ? blockProps.fixedWidths.split(" ").map((width: any) => width.trim())
    : null

  const actualColumnsCount = columnWidths
    ? columnWidths.length
    : Math.max(columns?.length || 0, blockProps.columnsCount)

  return (
    <div style={wStyle}>
      <table
        align="center"
        width="100%"
        cellPadding="0"
        border={0}
        style={{ tableLayout: "fixed", borderCollapse: "collapse" }}
      >
        <tbody style={{ width: "100%" }}>
          <tr style={{ width: "100%" }}>
            <TableCell
              index={0}
              props={blockProps}
              columns={columns}
              columnWidths={columnWidths}
              actualColumnsCount={actualColumnsCount}
            />
            <TableCell
              index={1}
              props={blockProps}
              columns={columns}
              columnWidths={columnWidths}
              actualColumnsCount={actualColumnsCount}
            />
            <TableCell
              index={2}
              props={blockProps}
              columns={columns}
              columnWidths={columnWidths}
              actualColumnsCount={actualColumnsCount}
            />
            <TableCell
              index={3}
              props={blockProps}
              columns={columns}
              columnWidths={columnWidths}
              actualColumnsCount={actualColumnsCount}
            />
          </tr>
        </tbody>
      </table>
    </div>
  )
}

type TableCellProps = {
  props: {
    fixedWidths: z.infer<typeof FIXED_WIDTHS_SCHEMA>
    columnsCount: 2 | 3 | 4
    columnsGap: number
    contentAlignment: "top" | "middle" | "bottom"
  }
  index: number
  columns?: TColumn[]
  columnWidths: string[] | null
  actualColumnsCount: number
}

function TableCell({
  index,
  props,
  columns,
  columnWidths,
  actualColumnsCount,
}: TableCellProps) {
  const contentAlignment =
    props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment

  if (index >= actualColumnsCount) {
    return null
  }

  const width =
    columnWidths?.[index] || getDefaultWidth(index, actualColumnsCount)

  const style: CSSProperties = {
    boxSizing: "content-box",
    verticalAlign: contentAlignment,
    paddingLeft: getPaddingBefore(index, props, actualColumnsCount),
    paddingRight: getPaddingAfter(index, props, actualColumnsCount),
    width: width,
  }
  const children = (columns && columns[index]) ?? null
  return <td style={style}>{children}</td>
}

function getDefaultWidth(index: number, columnsCount: number): string {
  switch (columnsCount) {
    case 2:
      return "50%"
    case 3:
      return "33.33%"
    case 4:
      return "25%"
    default:
      return "100%"
  }
}

function getPaddingBefore(
  index: number,
  { columnsGap }: TableCellProps["props"],
  columnsCount: number
) {
  if (index === 0) return 0
  switch (columnsCount) {
    case 2:
      return columnsGap / 2
    case 3:
      if (index === 1) return columnsGap / 3
      if (index === 2) return (2 * columnsGap) / 3
      return 0
    case 4:
      if (index === 1) return columnsGap / 4
      if (index === 2) return columnsGap / 2
      if (index === 3) return (3 * columnsGap) / 4
      return 0
    default:
      return 0
  }
}

function getPaddingAfter(
  index: number,
  { columnsGap }: TableCellProps["props"],
  columnsCount: number
) {
  switch (columnsCount) {
    case 1:
      return "100%"
    case 2:
      if (index === 0) return columnsGap / 2
      return 0
    case 3:
      if (index === 0) return (2 * columnsGap) / 3
      if (index === 1) return columnsGap / 3
      return 0
    case 4:
      if (index === 0) return (3 * columnsGap) / 4
      if (index === 1) return columnsGap / 2
      if (index === 2) return columnsGap / 4
      return 0
    default:
      return 0
  }
}
