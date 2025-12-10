import React from "react"

import { useCurrentBlockId } from "../../editor/EditorBlock"
import {
  setDocument,
  setSelectedBlockId,
  useDocument,
} from "../../editor/EditorContext"
import EditorChildrenIds from "../helpers/EditorChildrenIds"
import { EmailLayoutProps } from "./EmailLayoutPropsSchema"

function getFontFamily(fontFamily: EmailLayoutProps["fontFamily"]) {
  const f = fontFamily ?? "MODERN_SANS"
  switch (f) {
    case "MODERN_SANS":
      return '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif'
    case "BOOK_SANS":
      return 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif'
    case "ORGANIC_SANS":
      return 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif'
    case "GEOMETRIC_SANS":
      return 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif'
    case "HEAVY_SANS":
      return 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif'
    case "ROUNDED_SANS":
      return 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif'
    case "MODERN_SERIF":
      return 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif'
    case "BOOK_SERIF":
      return '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
    case "MONOSPACE":
      return '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace'
  }
}

export default function EmailLayoutEditor(props: EmailLayoutProps) {
  const childrenIds = props.childrenIds ?? []
  const document = useDocument()
  const currentBlockId = useCurrentBlockId()

  return (
    <div
      onClick={() => {
        setSelectedBlockId(null)
      }}
      style={{
        backgroundColor: props.backdropColor ?? "#F5F5F5",
        color: props.textColor ?? "#262626",
        fontFamily: getFontFamily(props.fontFamily),
        fontSize: "16px",
        fontWeight: "400",
        letterSpacing: "0.15008px",
        lineHeight: "1.5",
        margin: "0",
        padding: "32px 0",
        width: "100%",
        minHeight: "100%",
      }}
    >
      <table
        align="center"
        width={props.width ? `${props.width}px` : "100%"}
        style={{
          margin: "0 auto",
          maxWidth: props.width ? `${props.width}px` : "100%",
          backgroundColor: props.canvasColor ?? "#FFFFFF",
          borderRadius: props.borderRadius ?? undefined,
          border: (() => {
            const v = props.borderColor
            if (!v) {
              return undefined
            }
            return `1px solid ${v}`
          })(),
        }}
        role="presentation"
        cellSpacing="0"
        cellPadding="0"
        border={0}
      >
        <tbody>
          <tr style={{ width: "100%" }}>
            <td>
              <EditorChildrenIds
                childrenIds={childrenIds}
                onChange={({ block, blockId, childrenIds }) => {
                  setDocument({
                    [blockId]: block,
                    [currentBlockId]: {
                      type: "EmailLayout",
                      data: {
                        ...(document as any)[currentBlockId].data,
                        childrenIds: childrenIds,
                      },
                    },
                  })
                  setSelectedBlockId(blockId)
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// import React from "react"

// import { TEditorBlock } from "../../editor/core"
// import EditorBlock, { useCurrentBlockId } from "../../editor/EditorBlock"
// import {
//   setDocument,
//   setSelectedBlockId,
//   useDocument,
// } from "../../editor/EditorContext"
// import AddBlockButton from "../helpers/EditorChildrenIds/AddBlockMenu"
// import { EmailLayoutProps } from "./EmailLayoutPropsSchema"

// function getFontFamily(fontFamily: EmailLayoutProps["fontFamily"]) {
//   const f = fontFamily ?? "MODERN_SANS"
//   switch (f) {
//     case "MODERN_SANS":
//       return '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif'
//     case "BOOK_SANS":
//       return 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif'
//     case "ORGANIC_SANS":
//       return 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif'
//     case "GEOMETRIC_SANS":
//       return 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif'
//     case "HEAVY_SANS":
//       return 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif'
//     case "ROUNDED_SANS":
//       return 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif'
//     case "MODERN_SERIF":
//       return 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif'
//     case "BOOK_SERIF":
//       return '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif'
//     case "MONOSPACE":
//       return '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace'
//   }
// }

// interface EmailInlineLayoutWrapperProps {
//   childrenIds: string[] | null | undefined
//   onChange: (val: {
//     blockId: string
//     block: TEditorBlock
//     childrenIds: string[]
//   }) => void
//   document: Record<string, TEditorBlock>
//   currentBlockId: string
// }

// interface BlockGroup {
//   type: "inline" | "block"
//   ids?: string[]
//   id?: string
// }

// // Custom inline layout wrapper for email compatibility
// function EmailInlineLayoutWrapper({
//   childrenIds,
//   onChange,
//   document,
//   currentBlockId,
// }: EmailInlineLayoutWrapperProps) {
//   const safeChildrenIds = childrenIds || []

//   // Group consecutive text blocks for inline display
//   const groupedBlocks: BlockGroup[] = []
//   let currentGroup: string[] = []

//   safeChildrenIds.forEach((childId) => {
//     const childBlock = document[childId]
//     const isTextBlock = childBlock?.type === "Text"

//     if (isTextBlock) {
//       currentGroup.push(childId)
//     } else {
//       if (currentGroup.length > 0) {
//         groupedBlocks.push({ type: "inline", ids: [...currentGroup] })
//         currentGroup = []
//       }
//       groupedBlocks.push({ type: "block", id: childId })
//     }
//   })

//   // Add any remaining group
//   if (currentGroup.length > 0) {
//     groupedBlocks.push({ type: "inline", ids: [...currentGroup] })
//   }

//   return (
//     <div style={{ padding: "16px 24px" }}>
//       {groupedBlocks.map((group, groupIndex) => {
//         if (group.type === "inline" && group.ids) {
//           return (
//             <div
//               key={`inline-${groupIndex}`}
//               style={{
//                 display: "table",
//                 width: "100%",
//                 marginBottom: "8px",
//               }}
//             >
//               <div style={{ display: "table-row" }}>
//                 {group.ids.map((childId, index) => (
//                   <div
//                     key={childId}
//                     style={{
//                       display: "table-cell",
//                       paddingRight:
//                         index < (group as any).ids.length - 1 ? "8px" : "0",
//                       verticalAlign: "middle",
//                       whiteSpace: "nowrap",
//                       // Override any padding from the block itself
//                       padding: "0 !important",
//                     }}
//                   >
//                     <EditorBlock id={childId} />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )
//         } else if (group.type === "block" && group.id) {
//           return (
//             <div key={group.id} style={{ marginBottom: "8px" }}>
//               <EditorBlock id={group.id} />
//             </div>
//           )
//         }
//         return null
//       })}

//       {/* Add Block Button */}
//       <div style={{ marginTop: "16px" }}>
//         <AddBlockButton
//           onSelect={(block: TEditorBlock) => {
//             const blockId = `block-${Date.now()}`
//             const newChildrenIds = [...safeChildrenIds, blockId]

//             onChange({
//               blockId,
//               block: block,
//               childrenIds: newChildrenIds,
//             })
//           }}
//         />
//       </div>
//     </div>
//   )
// }

// export default function EmailLayoutEditor(props: EmailLayoutProps) {
//   const childrenIds = props.childrenIds ?? []
//   const document = useDocument()
//   const currentBlockId = useCurrentBlockId()

//   return (
//     <div
//       onClick={() => {
//         setSelectedBlockId(null)
//       }}
//       style={{
//         backgroundColor: props.backdropColor ?? "#F5F5F5",
//         color: props.textColor ?? "#262626",
//         fontFamily: getFontFamily(props.fontFamily),
//         fontSize: "16px",
//         fontWeight: "400",
//         letterSpacing: "0.15008px",
//         lineHeight: "1.5",
//         margin: "0",
//         padding: "32px 0",
//         width: "100%",
//         minHeight: "100%",
//       }}
//     >
//       <table
//         align="center"
//         width="100%"
//         style={{
//           margin: "0 auto",
//           maxWidth: "600px",
//           backgroundColor: props.canvasColor ?? "#FFFFFF",
//           borderRadius: props.borderRadius ?? undefined,
//           border: (() => {
//             const v = props.borderColor
//             if (!v) {
//               return undefined
//             }
//             return `1px solid ${v}`
//           })(),
//         }}
//         role="presentation"
//         cellSpacing="0"
//         cellPadding="0"
//         border={0}
//       >
//         <tbody>
//           <tr style={{ width: "100%" }}>
//             <td>
//               {/* Use our custom inline layout wrapper */}
//               <EmailInlineLayoutWrapper
//                 childrenIds={childrenIds}
//                 onChange={({ block, blockId, childrenIds }) => {
//                   setDocument({
//                     [blockId]: block,
//                     [currentBlockId]: {
//                       type: "EmailLayout",
//                       data: {
//                         ...document[currentBlockId]?.data,
//                         childrenIds: childrenIds,
//                       },
//                     } as TEditorBlock,
//                   })
//                   setSelectedBlockId(blockId)
//                 }}
//                 document={document}
//                 currentBlockId={currentBlockId}
//               />
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   )
// }
