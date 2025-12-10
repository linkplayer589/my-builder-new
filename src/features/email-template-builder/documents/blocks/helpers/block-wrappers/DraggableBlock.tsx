// // DraggableBlock.tsx
// import React from "react"
// import { useDraggable } from "@dnd-kit/core"
// import { CSS } from "@dnd-kit/utilities"
// import { Box } from "@mui/material"

// import EditorBlock from "../../../editor/EditorBlock"

// type DraggableBlockProps = {
//   id: string
//   position: { x: number; y: number }
// }

// export default function DraggableBlock({ id, position }: DraggableBlockProps) {
//   const { attributes, listeners, setNodeRef, transform, isDragging } =
//     useDraggable({
//       id: id,
//     })

//   const style = {
//     transform: CSS.Translate.toString(transform),
//     left: `${position.x}px`,
//     top: `${position.y}px`,
//   }

//   return (
//     <Box
//       ref={setNodeRef}
//       style={style}
//       {...listeners}
//       {...attributes}
//       sx={{
//         position: "absolute",
//         cursor: isDragging ? "grabbing" : "grab",
//         opacity: isDragging ? 0.8 : 1,
//         border: isDragging ? "2px solid #0079CC" : "1px solid transparent",
//         "&:hover": {
//           border: "1px dashed #0079CC",
//         },
//         transform: isDragging ? "scale(1.02)" : "scale(1)",
//         transition: "transform 0.2s, opacity 0.2s",
//         zIndex: isDragging ? 1000 : 1,
//       }}
//     >
//       <EditorBlock id={id} />
//     </Box>
//   )
// }

// export default function DraggableBlock({ id, position }: DraggableBlockProps) {
//   const { attributes, listeners, setNodeRef, transform, isDragging } =
//     useDraggable({
//       id: id,
//     })

//   const style = {
//     transform: CSS.Translate.toString(transform),
//     left: `${position.x}px`,
//     top: `${position.y}px`,
//   }

//   return (
//     <Box
//       ref={setNodeRef}
//       style={style}
//       sx={{
//         position: "absolute",
//         opacity: isDragging ? 0.8 : 1,
//         border: isDragging ? "2px solid #0079CC" : "1px solid transparent",
//         "&:hover": {
//           border: "1px dashed #0079CC",
//         },
//         transform: isDragging ? "scale(1.02)" : "scale(1)",
//         transition: "transform 0.2s, opacity 0.2s",
//         zIndex: isDragging ? 1000 : 1,
//       }}
//     >
//       {/* Drag handle */}
//       <Box
//         {...listeners}
//         {...attributes}
//         sx={{
//           position: "absolute",
//           top: 4,
//           right: 4,
//           width: 20,
//           height: 20,
//           backgroundColor: "#0079CC",
//           borderRadius: "50%",
//           cursor: "grab",
//           zIndex: 10,
//           "&:active": {
//             cursor: "grabbing",
//           },
//         }}
//       />

//       {/* The actual block content */}
//       <Box sx={{ pointerEvents: "auto" }}>
//         <EditorBlock id={id} />
//       </Box>
//     </Box>
//   )
// }

// DraggableBlock.tsx - Alternative approach
// import React from "react"
// import { useDraggable } from "@dnd-kit/core"
// import { CSS } from "@dnd-kit/utilities"
// import { Box } from "@mui/material"

// import EditorBlock from "../../../editor/EditorBlock"

// type DraggableBlockProps = {
//   id: string
//   position: { x: number; y: number }
// }

// export default function DraggableBlock({ id, position }: DraggableBlockProps) {
//   const { attributes, listeners, setNodeRef, transform, isDragging } =
//     useDraggable({
//       id: id,
//     })

//   const style = {
//     transform: CSS.Translate.toString(transform),
//     left: `${position.x}px`,
//     top: `${position.y}px`,
//   }

//   return (
//     <Box
//       ref={setNodeRef}
//       style={style}
//       sx={{
//         position: "absolute",
//         opacity: isDragging ? 0.8 : 1,
//         border: isDragging ? "2px solid #0079CC" : "1px solid transparent",
//         "&:hover": {
//           border: "1px dashed #0079CC",
//         },
//         transform: isDragging ? "scale(1.02)" : "scale(1)",
//         transition: "transform 0.2s, opacity 0.2s",
//         zIndex: isDragging ? 1000 : 1,
//         // Use the entire area for drag (for constraints) but allow content clicks
//         "& > *:not(.drag-handle)": {
//           pointerEvents: "auto",
//         },
//       }}
//     >
//       {/* Full-area invisible drag layer for constraints */}
//       <Box
//         {...listeners}
//         {...attributes}
//         className="drag-handle"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           cursor: "grab",
//           zIndex: 1,
//           backgroundColor: "transparent",
//           "&:active": {
//             cursor: "grabbing",
//           },
//         }}
//       />

//       {/* Visual drag indicator */}
//       <Box
//         className="drag-handle"
//         sx={{
//           position: "absolute",
//           top: 4,
//           right: 4,
//           width: 16,
//           height: 16,
//           backgroundColor: isDragging ? "#005a9c" : "#0079CC",
//           borderRadius: "50%",
//           cursor: "grab",
//           zIndex: 2,
//           "&:active": {
//             cursor: "grabbing",
//           },
//           opacity: 0.7,
//           "&:hover": {
//             opacity: 1,
//           },
//         }}
//         {...listeners}
//         {...attributes}
//       />

//       {/* The actual block content */}
//       <Box
//         sx={{
//           width: "100%",
//           height: "100%",
//           position: "relative",
//           zIndex: 3,
//         }}
//       >
//         <EditorBlock id={id} />
//       </Box>
//     </Box>
//   )
// }

// DraggableBlock.tsx
import React, { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Box } from "@mui/material"

import EditorBlock from "../../../editor/EditorBlock"
import { useDocument } from "../../../editor/EditorContext"

type DraggableBlockProps = {
  id: string
  position: { x: number; y: number }
  onBlockClick?: (id: string) => void
  isSelected?: boolean
}

export default function DraggableBlock({
  id,
  position,
  onBlockClick,
  isSelected = false,
}: DraggableBlockProps) {
  const document = useDocument()
  const [isClick, setIsClick] = useState(false)
  const [mouseDownTime, setMouseDownTime] = useState(0)
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 })
  const block = document[id]
  // Check if this is a Spacer or Divider
  const isSpacer = block?.type === "Spacer"
  const isDivider = block?.type === "Divider"
  const needsVisualBoundary = isSpacer || isDivider

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
    left: `${position.x}px`,
    top: `${position.y}px`,
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle left clicks
    if (e.button !== 0) return

    setMouseDownTime(Date.now())
    setMouseDownPosition({ x: e.clientX, y: e.clientY })
    setIsClick(true)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button !== 0) return

    const mouseUpTime = Date.now()
    const timeDiff = mouseUpTime - mouseDownTime
    const distance = Math.sqrt(
      Math.pow(e.clientX - mouseDownPosition.x, 2) +
        Math.pow(e.clientY - mouseDownPosition.y, 2)
    )

    // If it was a quick click with minimal movement, treat it as a click
    if (timeDiff < 200 && distance < 5 && isClick) {
      e.stopPropagation()
      onBlockClick?.(id)
    }

    setIsClick(false)
  }

  const handleDragHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent this from triggering block selection
  }

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      sx={{
        position: "absolute",
        cursor: isDragging ? "grabbing" : "pointer",
        opacity: isDragging ? 0.8 : 1,
        // border: isDragging
        //   ? "2px solid #0079CC"
        //   : isSelected
        //     ? "2px solid #FF6B35"
        //     : "1px solid transparent",
        border: isDragging
          ? "2px solid #0079CC"
          : isSelected
            ? "2px solid #FF6B35"
            : needsVisualBoundary
              ? "1px dashed #ccc"
              : "1px solid transparent",

        "&:hover": {
          border: isSelected
            ? "2px solid #FF6B35"
            : needsVisualBoundary
              ? "1px dashed #0079CC"
              : "1px dashed #0079CC",
        },
        // "&:hover": {
        //   border: isSelected ? "2px solid #FF6B35" : "1px dashed #0079CC",
        // },
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.2s, opacity 0.2s, border 0.2s",
        zIndex: isDragging || isSelected ? 1000 : 1,
        backgroundColor: isSelected
          ? "rgba(255, 107, 53, 0.05)"
          : "transparent",
        minWidth: needsVisualBoundary ? "100px" : "auto",
        minHeight: needsVisualBoundary ? "40px" : "auto",
      }}
    >
      {/* Drag handle - only this area triggers dragging */}
      <Box
        {...listeners}
        {...attributes}
        onMouseDown={handleDragHandleMouseDown}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          width: 20,
          height: 20,
          backgroundColor: isDragging ? "#005a9c" : "#0079CC",
          borderRadius: "50%",
          cursor: "grab",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "white",
          "&:active": {
            cursor: "grabbing",
          },
          "&:hover": {
            backgroundColor: "#005a9c",
            transform: "scale(1.1)",
          },
          transition: "background-color 0.2s, transform 0.2s",
        }}
      >
        ⋮
      </Box>

      {/* The actual block content - clickable for selection */}
      <Box
        sx={{
          //   width: "100%",
          //   height: "100%",
          width: needsVisualBoundary ? "100%" : "auto",
          height: needsVisualBoundary ? "100%" : "auto",
          pointerEvents: "auto",
          //   padding: "8px",
          padding: needsVisualBoundary ? "8px" : "8px",
        }}
      >
        <EditorBlock id={id} />

        {needsVisualBoundary && (
          <Box
            sx={{
              position: "absolute",
              bottom: 2,
              right: 2,
              fontSize: "10px",
              color: "#999",
              backgroundColor: "rgba(255,255,255,0.8)",
              padding: "1px 4px",
              borderRadius: "2px",
              pointerEvents: "none",
            }}
          >
            {isSpacer ? "Spacer" : "Divider"}
          </Box>
        )}
      </Box>
    </Box>
  )
}
