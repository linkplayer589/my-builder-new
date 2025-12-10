// import React, { CSSProperties, useState } from "react"
// import { Box } from "@mui/material"
// import { useDrag, useDrop } from "react-dnd"

// import { useCurrentBlockId } from "../../../editor/EditorBlock"
// import {
//   moveBlock,
//   setSelectedBlockId,
//   useSelectedBlockId,
// } from "../../../editor/EditorContext"
// import TuneMenu from "./TuneMenu"

// type TEditorBlockWrapperProps = {
//   children: JSX.Element
// }

// type DragItem = {
//   id: string
//   type: string
//   originalIndex: number
// }

// export default function EditorBlockWrapper({
//   children,
// }: TEditorBlockWrapperProps) {
//   const selectedBlockId = useSelectedBlockId()
//   const [mouseInside, setMouseInside] = useState(false)
//   const blockId = useCurrentBlockId()

//   const [{ isDragging }, drag] = useDrag(
//     () => ({
//       type: "BLOCK",
//       item: { id: blockId, type: "block", originalIndex: 0 },
//       collect: (monitor) => ({
//         isDragging: monitor.isDragging(),
//       }),
//     }),
//     [blockId]
//   )

//   const [{ isOver }, drop] = useDrop(
//     () => ({
//       accept: "BLOCK",
//       drop: (item: DragItem, monitor) => {
//         if (moveBlock && item.id !== blockId) {
//           moveBlock(item.id, blockId)
//         }
//       },
//       collect: (monitor) => ({
//         isOver: monitor.isOver(),
//       }),
//     }),
//     [blockId, moveBlock]
//   )

//   let outline: CSSProperties["outline"]
//   if (selectedBlockId === blockId) {
//     outline = "2px solid rgba(0,121,204, 1)"
//   } else if (mouseInside) {
//     outline = "2px solid rgba(0,121,204, 0.3)"
//   } else if (isOver) {
//     outline = "2px dashed rgba(0,121,204, 0.5)"
//   }

//   const opacity = isDragging ? 0.4 : 1

//   const renderMenu = () => {
//     if (selectedBlockId !== blockId) {
//       return null
//     }
//     return <TuneMenu blockId={blockId} />
//   }

//   return (
//     <Box
//       ref={(node) => {
//         drag(node as any)
//         drop(node as any)
//       }}
//       sx={{
//         position: "relative",
//         display: "inline-block",
//         maxWidth: "100%",
//         outlineOffset: "-1px",
//         outline,
//         opacity,
//         cursor: isDragging ? "grabbing" : "grab",
//         verticalAlign: "top",
//       }}
//       onMouseEnter={(ev) => {
//         setMouseInside(true)
//         ev.stopPropagation()
//       }}
//       onMouseLeave={() => {
//         setMouseInside(false)
//       }}
//       onClick={(ev) => {
//         setSelectedBlockId(blockId)
//         ev.stopPropagation()
//         ev.preventDefault()
//       }}
//     >
//       {renderMenu()}
//       {children}
//     </Box>
//   )
// }

// In EditorBlockWrapper.tsx
// import React, { CSSProperties, useState } from "react"
// import { Box } from "@mui/material"
// import { useDrag, useDrop } from "react-dnd"

// import { useCurrentBlockId } from "../../../editor/EditorBlock"
// import {
//   moveBlock,
//   setSelectedBlockId,
//   useSelectedBlockId,
// } from "../../../editor/EditorContext"
// import TuneMenu from "./TuneMenu"

// type TEditorBlockWrapperProps = {
//   children: JSX.Element
//   isAbsolutePositioned?: boolean
//   position?: { x: number; y: number }
// }

// type DragItem = {
//   id: string
//   type: string
//   originalIndex: number
// }

// export default function EditorBlockWrapper({
//   children,
//   isAbsolutePositioned = false,
//   position = { x: 0, y: 0 },
// }: TEditorBlockWrapperProps) {
//   const selectedBlockId = useSelectedBlockId()
//   const [mouseInside, setMouseInside] = useState(false)
//   const blockId = useCurrentBlockId()

//   const [{ isDragging }, drag] = useDrag(
//     () => ({
//       type: "BLOCK",
//       item: { id: blockId, type: "block", originalIndex: 0 },
//       collect: (monitor) => ({
//         isDragging: monitor.isDragging(),
//       }),
//     }),
//     [blockId]
//   )

//   const [{ isOver }, drop] = useDrop(
//     () => ({
//       accept: "BLOCK",
//       drop: (item: DragItem, monitor) => {
//         if (moveBlock && item.id !== blockId) {
//           moveBlock(item.id, blockId)
//         }
//       },
//       collect: (monitor) => ({
//         isOver: monitor.isOver(),
//       }),
//     }),
//     [blockId, moveBlock]
//   )

//   let outline: CSSProperties["outline"]
//   if (selectedBlockId === blockId) {
//     outline = "2px solid rgba(0,121,204, 1)"
//   } else if (mouseInside) {
//     outline = "2px solid rgba(0,121,204, 0.3)"
//   } else if (isOver) {
//     outline = "2px dashed rgba(0,121,204, 0.5)"
//   }

//   const opacity = isDragging ? 0.4 : 1

//   const renderMenu = () => {
//     if (selectedBlockId !== blockId) {
//       return null
//     }
//     return <TuneMenu blockId={blockId} />
//   }

//   // For absolute positioned blocks
//   if (isAbsolutePositioned) {
//     return (
//       <Box
//         ref={(node) => {
//           drag(node as any)
//           drop(node as any)
//         }}
//         sx={{
//           position: "absolute",
//           left: position.x,
//           top: position.y,
//           outlineOffset: "-1px",
//           outline,
//           opacity,
//           cursor: isDragging ? "grabbing" : "grab",
//           zIndex: selectedBlockId === blockId ? 1000 : 1,
//         }}
//         onMouseEnter={(ev) => {
//           setMouseInside(true)
//           ev.stopPropagation()
//         }}
//         onMouseLeave={() => {
//           setMouseInside(false)
//         }}
//         onClick={(ev) => {
//           setSelectedBlockId(blockId)
//           ev.stopPropagation()
//           ev.preventDefault()
//         }}
//       >
//         {renderMenu()}
//         {children}
//       </Box>
//     )
//   }

//   // Original behavior for normal blocks
//   return (
//     <Box
//       ref={(node) => {
//         drag(node as any)
//         drop(node as any)
//       }}
//       sx={{
//         position: "relative",
//         maxWidth: "100%",
//         outlineOffset: "-1px",
//         outline,
//         opacity,
//         cursor: isDragging ? "grabbing" : "grab",
//       }}
//       onMouseEnter={(ev) => {
//         setMouseInside(true)
//         ev.stopPropagation()
//       }}
//       onMouseLeave={() => {
//         setMouseInside(false)
//       }}
//       onClick={(ev) => {
//         setSelectedBlockId(blockId)
//         ev.stopPropagation()
//         ev.preventDefault()
//       }}
//     >
//       {renderMenu()}
//       {children}
//     </Box>
//   )
// }

// In EditorBlockWrapper.tsx
import React, { CSSProperties, useMemo, useRef, useState } from "react"
import { Box } from "@mui/material"
import { useDrag, useDrop } from "react-dnd"

import { useCurrentBlockId } from "../../../editor/EditorBlock"
import {
  moveBlock,
  setSelectedBlockId,
  useSelectedBlockId,
} from "../../../editor/EditorContext"
import TuneMenu from "./TuneMenu"

type TEditorBlockWrapperProps = {
  children: JSX.Element
  isAbsolutePositioned?: boolean
  position?: { x: number; y: number }
}

type DragItem = {
  id: string
  type: string
  originalIndex: number
}

// Helper hook to check if DnD is available
// const useDnDAvailable = () => {
//   const [isAvailable, setIsAvailable] = useState(false)

//   React.useEffect(() => {
//     // Check if we're in a context where DnD should work
//     // You might need to adjust this condition based on your app
//     const shouldEnableDnD = true // Add your actual condition here
//     setIsAvailable(shouldEnableDnD)
//   }, [])

//   return isAvailable
// }

const useDnDAvailable = () => {
  return false
}

export default function EditorBlockWrapper({
  children,
  isAbsolutePositioned = false,
  position = { x: 0, y: 0 },
}: TEditorBlockWrapperProps) {
  const selectedBlockId = useSelectedBlockId()
  const [mouseInside, setMouseInside] = useState(false)
  const blockId = useCurrentBlockId()
  const isDnDAvailable = useDnDAvailable()

  // ALWAYS call the hooks, but conditionally use their results
  const [{ isDragging: dragIsDragging }, drag] = useDrag(
    () => ({
      type: "BLOCK",
      item: { id: blockId, type: "block", originalIndex: 0 },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: isDnDAvailable, // Disable drag when not available
    }),
    [blockId, isDnDAvailable]
  )

  const [{ isOver: dropIsOver }, drop] = useDrop(
    () => ({
      accept: "BLOCK",
      drop: (item: DragItem, monitor) => {
        if (isDnDAvailable && moveBlock && item.id !== blockId) {
          moveBlock(item.id, blockId)
        }
      },
      canDrop: () => isDnDAvailable, // Disable drop when not available
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [blockId, moveBlock, isDnDAvailable]
  )

  // Conditionally apply the drag/drop states only when DnD is available
  const isDragging = isDnDAvailable ? dragIsDragging : false
  const isOver = isDnDAvailable ? dropIsOver : false

  let outline: CSSProperties["outline"]
  if (selectedBlockId === blockId) {
    outline = "2px solid rgba(0,121,204, 1)"
  } else if (mouseInside) {
    outline = "2px solid rgba(0,121,204, 0.3)"
  } else if (isOver) {
    outline = "2px dashed rgba(0,121,204, 0.5)"
  }

  const opacity = isDragging ? 0.4 : 1

  const renderMenu = () => {
    if (selectedBlockId !== blockId) {
      return null
    }
    return <TuneMenu blockId={blockId} />
  }

  // Create refs conditionally
  const combinedRef = useRef(null)
  const setRefs = useMemo(() => {
    if (!isDnDAvailable) return undefined

    return (node: any) => {
      drag(node)
      drop(node)
    }
  }, [isDnDAvailable, drag, drop])

  const commonProps = {
    ref: setRefs,
    sx: {
      position: isAbsolutePositioned ? "absolute" : "relative",
      left: isAbsolutePositioned ? position.x : undefined,
      top: isAbsolutePositioned ? position.y : undefined,
      maxWidth: "100%",
      outlineOffset: "-1px",
      outline,
      opacity,
      cursor: isDnDAvailable ? (isDragging ? "grabbing" : "grab") : "default",
      zIndex: selectedBlockId === blockId ? 1000 : 1,
    },
    onMouseEnter: (ev: React.MouseEvent) => {
      setMouseInside(true)
      ev.stopPropagation()
    },
    onMouseLeave: () => {
      setMouseInside(false)
    },
    onClick: (ev: React.MouseEvent) => {
      setSelectedBlockId(blockId)
      ev.stopPropagation()
      ev.preventDefault()
    },
  }

  return (
    <Box {...(commonProps as any)}>
      {renderMenu()}
      {children}
    </Box>
  )
}
