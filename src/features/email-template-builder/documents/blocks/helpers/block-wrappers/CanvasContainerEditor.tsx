// CanvasContainerEditor.tsx
import React from "react"
import { Box } from "@mui/material"

import { useCurrentBlockId } from "../../../editor/EditorBlock"
import { setDocument, useDocument } from "../../../editor/EditorContext"
import EditorChildrenIds from "../EditorChildrenIds"
import { CanvasContainerProps } from "./CanvasContainerPropsSchema"

export default function CanvasContainerEditor(props: CanvasContainerProps) {
  const childrenIds = props.childrenIds ?? []
  const positionProps = props.props // Add this line to access position props
  const styleProps = props.style
  const document = useDocument()
  const currentBlockId = useCurrentBlockId()

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "400px",
        border: "1px dashed #ccc",
        borderRadius: "4px",
        backgroundColor: "#fafafa",
        overflow: "hidden",
        ...(styleProps?.width && {
          width: `${styleProps.width}px`,
        }),
        ...(styleProps?.height && {
          height: `${styleProps.height}px`,
          minHeight: `${styleProps.height}px`, // Override minHeight if height is specified
        }),
        // You can use positionProps here if needed for container styling
        ...(positionProps?.position && {
          position: "relative", // or other positioning
        }),
        ...(positionProps?.zIndex && {
          zIndex: positionProps.zIndex,
        }),
      }}
    >
      <EditorChildrenIds
        childrenIds={childrenIds}
        containerStyle={styleProps}
        onChange={({ block, blockId, childrenIds }) => {
          const currentBlockData = document[currentBlockId]?.data
          if (!currentBlockData) return

          setDocument({
            [blockId]: block,
            [currentBlockId]: {
              type: "CanvasContainer",
              data: {
                style: (currentBlockData as any)?.style,
                props: (currentBlockData as any)?.props || null,
                childrenIds: childrenIds,
              } as CanvasContainerProps,
            },
          })
        }}
        layout="canvas"
      />
    </Box>
  )
}
