import React from "react"
import { Box } from "@mui/material"

import { useCurrentBlockId } from "../../editor/EditorBlock"
import { setDocument, useDocument } from "../../editor/EditorContext"
import EditorChildrenIds from "../helpers/EditorChildrenIds"
import { OverlayContainerProps } from "./OverlayContainerPropsSchema"

export default function OverlayContainerEditor(props: OverlayContainerProps) {
  const childrenIds = props.childrenIds ?? []
  const document = useDocument()
  const currentBlockId = useCurrentBlockId()

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "200px",
        border: "1px dashed #ccc",
        borderRadius: "4px",
      }}
    >
      <EditorChildrenIds
        childrenIds={childrenIds}
        onChange={({ block, blockId, childrenIds }) => {
          const currentBlockData = document[currentBlockId]?.data
          if (!currentBlockData) return

          setDocument({
            [blockId]: block,
            [currentBlockId]: {
              type: "OverlayContainer",
              data: {
                ...currentBlockData,
                childrenIds: childrenIds,
                maxLayers: 3,
              },
            },
          })
        }}
      />

      {/* Stacking visual guide */}
      {childrenIds.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "2px 6px",
            borderRadius: "3px",
            fontSize: "12px",
          }}
        >
          {childrenIds.length}/3 layers
        </Box>
      )}
    </Box>
  )
}
