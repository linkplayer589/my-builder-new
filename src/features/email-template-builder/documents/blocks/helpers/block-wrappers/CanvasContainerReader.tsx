// // CanvasContainerReader.tsx
// import React from "react"

// import { useDocument } from "../../../editor/EditorContext"
// import { ReaderBlock, useReaderDocument } from "@/features/email-template-builder/@usewaypoint/email-builder/dist/index.mjs"

// interface Position {
//   x: number
//   y: number
// }

// interface BlockProps {
//   position?: Position
//   zIndex?: number
// }

// interface BlockData {
//   props?: BlockProps
//   style?: React.CSSProperties
// }

// interface Document {
//   [key: string]: {
//     type: string
//     data?: BlockData
//   }
// }

// interface CanvasContainerReaderProps {
//   style?: React.CSSProperties
//   props?: {
//     childrenIds?: string[]
//     position?: Position
//     zIndex?: number
//   }
//   data?: {
//     childrenIds?: string[]
//     props?: {
//       position?: Position
//       zIndex?: number
//     }
//     style?: React.CSSProperties
//   }
// }

// function CanvasContainerReader({
//   style,
//   props,
//   data,
// }: CanvasContainerReaderProps) {
//   const document = useReaderDocument()
//   const childrenIds = data?.childrenIds || props?.childrenIds || []

//   // Get container position and zIndex from either props or data
//   const containerPosition = data?.props?.position || props?.position
//   const containerZIndex = data?.props?.zIndex || props?.zIndex || 1

//   const containerStyle: React.CSSProperties = {
//     position: "relative",
//     minHeight: "400px",
//     backgroundColor: "#fafafa",
//     ...style,
//     ...data?.style,
//     // Apply container positioning if provided
//     ...(containerPosition && {
//       position: "absolute",
//       left: `${containerPosition.x}px`,
//       top: `${containerPosition.y}px`,
//     }),
//     zIndex: containerZIndex,
//   }

//   return (
//     <div style={containerStyle}>
//       {childrenIds.map((childId: string) => {
//         const childBlock = document[childId]
//         if (!childBlock) {
//           console.warn(`Child block ${childId} not found in document`)
//           return null
//         }

//         const position = childBlock.data?.props?.position || { x: 0, y: 0 }
//         const zIndex = childBlock.data?.props?.zIndex || 1

//         return (
//           <div
//             key={childId}
//             style={{
//               position: "absolute",
//               left: `${position.x}px`,
//               top: `${position.y}px`,
//               zIndex: zIndex,
//             }}
//           >
//             <ReaderBlock id={childId} />
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// export default CanvasContainerReader

// CanvasContainerReader.tsx
import React from "react"
import {
  ReaderBlock,
  useReaderDocument,
} from "@/features/email-template-builder/@usewaypoint/email-builder/dist/index.mjs"

interface Position {
  x: number
  y: number
}

interface BlockProps {
  position?: Position
  zIndex?: number
  [key: string]: any // Allow other props
}

interface BlockData {
  props?: BlockProps
  style?: any // Use any to avoid type conflicts
  childrenIds?: string[]
}

interface Document {
  [key: string]: {
    type: string
    data?: BlockData
  }
}

interface CanvasContainerReaderProps {
  style?: React.CSSProperties
  props?: {
    id?: string
    childrenIds?: string[]
    position?: Position
    zIndex?: number
  }
  data?: {
    childrenIds?: string[]
    props?: {
      position?: Position
      zIndex?: number
    }
    style?: React.CSSProperties
  }
}

export default function CanvasContainerReader({
  style,
  props,
  data,
}: CanvasContainerReaderProps) {
  const document = useReaderDocument() as Document

  // Get the current CanvasContainer block ID from props or find it
  // We need to know which block ID this CanvasContainer represents
  const blockId =
    props?.id ||
    Object.keys(document).find((key) => {
      const docItem = document[key]
      return (
        docItem?.type === "CanvasContainer" &&
        docItem?.data?.childrenIds &&
        docItem.data.childrenIds.length > 0
      )
    })

  const blockData = blockId ? document[blockId] : null
  const childrenIds = blockData?.data?.childrenIds || []

  console.log("CanvasContainerReader blockId:", blockId)
  console.log("CanvasContainerReader blockData:", blockData)
  console.log("CanvasContainerReader childrenIds:", childrenIds)

  // Get container data from the document
  const containerData = blockData?.data
  const containerPosition = containerData?.props?.position || { x: 0, y: 0 }
  const containerZIndex = containerData?.props?.zIndex || 1
  const containerStyleFromData = containerData?.style || {}

  // Handle padding
  let paddingString = undefined
  if (containerStyleFromData?.padding) {
    if (typeof containerStyleFromData.padding === "string") {
      paddingString = containerStyleFromData.padding
    } else if (typeof containerStyleFromData.padding === "object") {
      const p = containerStyleFromData.padding
      paddingString = `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`
    }
  }

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    minHeight: "400px",
    backgroundColor: "#fafafa",
    ...style,
    ...containerStyleFromData,
    left: `${containerPosition.x}px`,
    top: `${containerPosition.y}px`,
    ...(paddingString && { padding: paddingString }),
    zIndex: containerZIndex,
  }

  return (
    <div style={containerStyle}>
      {childrenIds.map((childId: string) => {
        const childBlock = document[childId]
        if (!childBlock) {
          console.warn(`Child block ${childId} not found in document`)
          return null
        }

        const childData = childBlock.data as BlockData | undefined
        const position = childData?.props?.position || { x: 0, y: 0 }
        const zIndex = childData?.props?.zIndex || 1

        return (
          <div
            key={childId}
            style={{
              position: "absolute",
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: zIndex,
              display: "inline-block",
            }}
          >
            <ReaderBlock id={childId} />
          </div>
        )
      })}
    </div>
  )
}
