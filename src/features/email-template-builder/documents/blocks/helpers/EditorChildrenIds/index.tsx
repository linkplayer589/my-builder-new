// import React, { Fragment } from "react"
// import { DndContext, useDroppable } from "@dnd-kit/core"
// import { Box } from "@mui/material"

// import { TEditorBlock } from "../../../editor/core"
// import EditorBlock, { useCurrentBlockId } from "../../../editor/EditorBlock"
// import { setDocument, useDocument } from "../../../editor/EditorContext"
// import DraggableBlock from "../block-wrappers/DraggableBlock"
// import AddBlockButton from "./AddBlockMenu"

// export type EditorChildrenChange = {
//   blockId: string
//   block: TEditorBlock
//   childrenIds: string[]
// }

// type DragItem = {
//   id: string
//   type: string
// }

// function generateId() {
//   return `block-${Date.now()}`
// }

// export type EditorChildrenIdsProps = {
//   childrenIds: string[] | null | undefined
//   onChange: (val: EditorChildrenChange) => void
//   layout?: "vertical" | "horizontal" | "canvas"
// }

// type DropZoneProps = {
//   onDrop: (id: string, position: string) => void
//   position: string
// }

// function DropZone({ onDrop, position }: DropZoneProps) {
//   return (
//     <div
//       style={{
//         height: "10px",
//         background: "transparent",
//       }}
//     />
//   )
// }

// export default function EditorChildrenIds({
//   childrenIds,
//   onChange,
//   layout = "vertical",
// }: EditorChildrenIdsProps) {
//   const document = useDocument()
//   const currentBlockId = useCurrentBlockId()
//   const safeChildrenIds = childrenIds || []

//   const { setNodeRef } = useDroppable({
//     id: "canvas-drop-area",
//   })

//   const handleDragEnd = (event: any) => {
//     const { active, delta } = event

//     if (layout === "canvas" && active) {
//       const blockId = active.id
//       const currentBlock = document[blockId]

//       if (currentBlock) {
//         const currentPosition = (currentBlock.data as any)?.props?.position || {
//           x: 50,
//           y: 50,
//         }

//         const newX = currentPosition.x + delta.x
//         const newY = currentPosition.y + delta.y

//         // Constrain to canvas boundaries
//         const canvasElement = window.document.getElementById("canvas-container")
//         if (canvasElement) {
//           const rect = canvasElement.getBoundingClientRect()
//           const constrainedX = Math.max(10, Math.min(newX, rect.width - 200))
//           const constrainedY = Math.max(60, Math.min(newY, rect.height - 100))

//           setDocument({
//             [blockId]: {
//               ...currentBlock,
//               data: {
//                 ...currentBlock.data,
//                 props: {
//                   ...(currentBlock.data as any).props,
//                   position: { x: constrainedX, y: constrainedY },
//                 },
//               },
//             } as TEditorBlock,
//           })
//         }
//       }
//     }
//   }

//   const handleChildrenChange = (newChildrenIds: string[]) => {
//     const currentBlock = document[currentBlockId]
//     if (!currentBlock) return

//     setDocument({
//       [currentBlockId]: {
//         type: currentBlock.type,
//         data: {
//           ...currentBlock.data,
//           childrenIds: newChildrenIds,
//         },
//       } as TEditorBlock,
//     })
//   }

//   const insertBlock = (blockOrId: TEditorBlock | string, index: number) => {
//     const blockId = typeof blockOrId === "string" ? blockOrId : generateId()
//     const newChildrenIds = [...safeChildrenIds]
//     newChildrenIds.splice(index, 0, blockId)

//     if (typeof blockOrId !== "string") {
//       onChange({
//         blockId,
//         block: blockOrId,
//         childrenIds: newChildrenIds,
//       })
//     } else {
//       handleChildrenChange(newChildrenIds)
//     }
//   }

//   if (!childrenIds || childrenIds.length === 0) {
//     return (
//       <Box>
//         <DropZone onDrop={(id) => insertBlock(id, 0)} position="start" />
//         <AddBlockButton
//           placeholder
//           onSelect={(block) => insertBlock(block, 0)}
//         />
//       </Box>
//     )
//   }

//   // Canvas Layout with @dnd-kit
//   if (layout === "canvas") {
//     return (
//       <DndContext onDragEnd={handleDragEnd}>
//         <Box
//           id="canvas-container"
//           ref={setNodeRef}
//           sx={{
//             position: "relative",
//             width: "100%",
//             height: "100%",
//             minHeight: "400px",
//             backgroundColor: "#fafafa",
//             border: "1px dashed #ccc",
//             borderRadius: "4px",
//             overflow: "hidden",
//           }}
//         >
//           {/* Render draggable blocks */}
//           {safeChildrenIds.map((childId) => {
//             const childBlock = document[childId]
//             const position = (childBlock?.data as any)?.props?.position || {
//               x: 50,
//               y: 50,
//             }

//             return (
//               <DraggableBlock key={childId} id={childId} position={position} />
//             )
//           })}

//           {/* Simple visible Add Block Button */}
//           <Box
//             sx={{
//               position: "absolute",
//               bottom: 16,
//               right: 16,
//               zIndex: 1000,
//               width: 100,
//               height: 100,
//               border: "1px solid black",
//             }}
//           >
//             <AddBlockButton
//               onSelect={(block) => {
//                 const newBlock = {
//                   ...block,
//                   data: {
//                     ...block.data,
//                     props: {
//                       ...(block.data as any).props,
//                       position: {
//                         x: Math.random() * 300 + 50,
//                         y: Math.random() * 200 + 50,
//                       },
//                     },
//                   },
//                 }
//                 insertBlock(newBlock as any, safeChildrenIds.length)
//               }}
//             />
//           </Box>

//           {/* Empty state message */}
//           {safeChildrenIds.length === 0 && (
//             <Box
//               sx={{
//                 position: "absolute",
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 textAlign: "center",
//                 color: "#666",
//                 zIndex: 1,
//               }}
//             >
//               <Box sx={{ fontSize: "16px", mb: 1 }}>
//                 Click the + button to add blocks
//               </Box>
//               <Box sx={{ fontSize: "12px", color: "#999" }}>
//                 Drag and drop to position blocks anywhere
//               </Box>
//             </Box>
//           )}
//         </Box>
//       </DndContext>
//     )
//   }

//   // Horizontal Layout
//   if (layout === "horizontal") {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "row",
//           gap: 2,
//           alignItems: "flex-start",
//         }}
//       >
//         <DropZone onDrop={(id) => insertBlock(id, 0)} position="start" />

//         {safeChildrenIds.map((childId, i) => (
//           <Box key={childId} sx={{ flex: 1, minHeight: "100px" }}>
//             <EditorBlock id={childId} />
//             <DropZone
//               onDrop={(id) => insertBlock(id, i + 1)}
//               position={(i + 1).toString()}
//             />
//           </Box>
//         ))}

//         <AddBlockButton
//           onSelect={(block) => insertBlock(block, safeChildrenIds.length)}
//         />
//       </Box>
//     )
//   }

//   // Default Vertical Layout
//   return (
//     <Box>
//       <DropZone onDrop={(id) => insertBlock(id, 0)} position="start" />

//       {safeChildrenIds.map((childId, i) => (
//         <Fragment key={childId}>
//           <EditorBlock id={childId} />
//           <DropZone
//             onDrop={(id) => insertBlock(id, i + 1)}
//             position={(i + 1).toString()}
//           />
//         </Fragment>
//       ))}

//       <AddBlockButton
//         onSelect={(block) => insertBlock(block, safeChildrenIds.length)}
//       />
//     </Box>
//   )
// }

import React, { Fragment } from "react"
import { DndContext, useDroppable } from "@dnd-kit/core"
import { Box } from "@mui/material"

import { TEditorBlock } from "../../../editor/core"
import EditorBlock, { useCurrentBlockId } from "../../../editor/EditorBlock"
import { setDocument, useDocument } from "../../../editor/EditorContext"
import DraggableBlock from "../block-wrappers/DraggableBlock"
import AddBlockButton from "./AddBlockMenu"

export type EditorChildrenChange = {
  blockId: string
  block: TEditorBlock
  childrenIds: string[]
}

type DragItem = {
  id: string
  type: string
}

function generateId() {
  return `block-${Date.now()}`
}

export type EditorChildrenIdsProps = {
  childrenIds: string[] | null | undefined
  onChange: (val: EditorChildrenChange) => void
  layout?: "vertical" | "horizontal" | "canvas"
  containerStyle?: { width?: number; height?: number } // New prop for container style
}

type DropZoneProps = {
  onDrop: (id: string, position: string) => void
  position: string
}

function DropZone({ onDrop, position }: DropZoneProps) {
  return (
    <div
      style={{
        height: "10px",
        background: "transparent",
      }}
    />
  )
}

export default function EditorChildrenIds({
  childrenIds,
  onChange,
  layout = "vertical",
  containerStyle,
}: EditorChildrenIdsProps) {
  const document = useDocument()
  const currentBlockId = useCurrentBlockId()
  const safeChildrenIds = childrenIds || []

  const { setNodeRef } = useDroppable({
    id: "canvas-drop-area",
  })

  const handleDragEnd = (event: any) => {
    const { active, delta } = event

    if (layout === "canvas" && active) {
      const blockId = active.id
      const currentBlock = document[blockId]

      if (currentBlock) {
        const currentPosition = (currentBlock.data as any)?.props?.position || {
          x: 50,
          y: 50,
        }

        const newX = currentPosition.x + delta.x
        const newY = currentPosition.y + delta.y

        // Constrain to canvas boundaries
        const canvasElement = window.document.getElementById("canvas-container")
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect()
          const constrainedX = Math.max(5, Math.min(newX, rect.width - 50))
          const constrainedY = Math.max(5, Math.min(newY, rect.height - 30))

          setDocument({
            [blockId]: {
              ...currentBlock,
              data: {
                ...currentBlock.data,
                props: {
                  ...(currentBlock.data as any).props,
                  position: { x: constrainedX, y: constrainedY },
                },
              },
            } as TEditorBlock,
          })
        }
      }
    }
  }

  const handleChildrenChange = (newChildrenIds: string[]) => {
    const currentBlock = document[currentBlockId]
    if (!currentBlock) return

    setDocument({
      [currentBlockId]: {
        type: currentBlock.type,
        data: {
          ...currentBlock.data,
          childrenIds: newChildrenIds,
        },
      } as TEditorBlock,
    })
  }

  const insertBlock = (blockOrId: TEditorBlock | string, index: number) => {
    const blockId = typeof blockOrId === "string" ? blockOrId : generateId()
    const newChildrenIds = [...safeChildrenIds]
    newChildrenIds.splice(index, 0, blockId)

    if (typeof blockOrId !== "string") {
      onChange({
        blockId,
        block: blockOrId,
        childrenIds: newChildrenIds,
      })
    } else {
      handleChildrenChange(newChildrenIds)
    }
  }

  if (!childrenIds || childrenIds.length === 0) {
    return (
      <Box>
        <DropZone onDrop={(id) => insertBlock(id, 0)} position="start" />
        <AddBlockButton
          placeholder
          onSelect={(block) => insertBlock(block, 0)}
        />
      </Box>
    )
  }

  // Canvas Layout with @dnd-kit
  if (layout === "canvas") {
    return (
      <DndContext onDragEnd={handleDragEnd}>
        <Box
          id="canvas-container"
          ref={setNodeRef}
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: "400px",
            // backgroundColor: "#fafafa",
            border: "1px dashed #ccc",
            borderRadius: "4px",
            overflow: "hidden",
            // Apply container dimensions if available
            ...(containerStyle?.width && {
              width: `${containerStyle.width}px`,
            }),
            ...(containerStyle?.height && {
              height: `${containerStyle.height}px`,
              minHeight: `${containerStyle.height}px`,
            }),
          }}
        >
          {/* Render draggable blocks */}
          {safeChildrenIds.map((childId) => {
            const childBlock = document[childId]
            if (!childBlock) {
              console.warn(`Block with id ${childId} not found in document`)
              return null
            }
            const position = (childBlock?.data as any)?.props?.position || {
              x: 50,
              y: 50,
            }

            return (
              <DraggableBlock key={childId} id={childId} position={position} />
            )
          })}

          {/* Add Block Button - HIGH z-index to always stay on top */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              zIndex: 9999, // Very high z-index to ensure it's always on top
              width: 50,
              height: 50,
              border: "1px solid black",
              borderRadius: 50,
              background: "blue",
            }}
          >
            <AddBlockButton
              onSelect={(block) => {
                const newBlock = {
                  ...block,
                  data: {
                    ...block.data,
                    props: {
                      ...(block.data as any).props,
                      position: {
                        x: Math.random() * 300 + 50,
                        y: Math.random() * 200 + 50,
                      },
                    },
                  },
                }
                insertBlock(newBlock as any, safeChildrenIds.length)
              }}
            />
          </Box>

          {/* Empty state message */}
          {safeChildrenIds.length === 0 && (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                color: "#666",
                zIndex: 1,
              }}
            >
              <Box sx={{ fontSize: "16px", mb: 1 }}>
                Click the + button to add blocks
              </Box>
              <Box sx={{ fontSize: "12px", color: "#999" }}>
                Drag and drop to position blocks anywhere
              </Box>
            </Box>
          )}
        </Box>
      </DndContext>
    )
  }

  // Horizontal Layout
  if (layout === "horizontal") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        <DropZone onDrop={(id) => insertBlock(id, 0)} position="start" />

        {safeChildrenIds.map((childId, i) => (
          <Box key={childId} sx={{ flex: 1, minHeight: "100px" }}>
            <EditorBlock id={childId} />
            <DropZone
              onDrop={(id) => insertBlock(id, i + 1)}
              position={(i + 1).toString()}
            />
          </Box>
        ))}

        <AddBlockButton
          onSelect={(block) => insertBlock(block, safeChildrenIds.length)}
        />
      </Box>
    )
  }

  // Default Vertical Layout
  return (
    <Box>
      <DropZone onDrop={(id) => insertBlock(id, 0)} position="start" />

      {safeChildrenIds.map((childId, i) => (
        <Fragment key={childId}>
          <EditorBlock id={childId} />
          <DropZone
            onDrop={(id) => insertBlock(id, i + 1)}
            position={(i + 1).toString()}
          />
        </Fragment>
      ))}

      <AddBlockButton
        onSelect={(block) => insertBlock(block, safeChildrenIds.length)}
      />
    </Box>
  )
}
