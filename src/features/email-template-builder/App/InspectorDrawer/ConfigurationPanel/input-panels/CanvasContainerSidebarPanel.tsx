// CanvasContainerSidebarPanel.tsx
import React, { useState } from "react"
import {
  CanvasContainerProps,
  CanvasContainerPropsSchema,
} from "@/features/email-template-builder/documents/blocks/helpers/block-wrappers/CanvasContainerPropsSchema"
import { FormControl, InputLabel, TextField } from "@mui/material"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type CanvasContainerPanelProps = {
  data: CanvasContainerProps
  setData: (v: CanvasContainerProps) => void
}

const basePropsObj = (
  CanvasContainerPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap()
  .unwrap()

const ExtendedCanvasContainerPropsSchema = CanvasContainerPropsSchema.extend({
  props: basePropsObj.optional().nullable(),
})

export default function CanvasContainerSidebarPanel({
  data,
  setData,
}: CanvasContainerPanelProps) {
  const [, setErrors] = useState<z.ZodError | null>(null)
  const updateData = (d: unknown) => {
    const res = ExtendedCanvasContainerPropsSchema.safeParse(d)
    if (res.success) {
      const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }

      setData({
        ...(res.data as any),
        props: {
          ...(res.data as any).props,
          position: currentPosition, // KEEP POSITION
        },
      })
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  return (
    <BaseSidebarPanel title="Canvas block">
      <TextField
        label="Width (px)"
        type="number"
        value={data.style?.width || ""}
        onChange={(e: any) =>
          updateData({
            ...data,
            style: {
              ...data.style,
              width: e.target.value ? parseInt(e.target.value) : undefined,
            },
          })
        }
        fullWidth
        margin="normal"
      />

      <TextField
        label="Height (px)"
        type="number"
        value={data.style?.height || ""}
        onChange={(e: any) =>
          updateData({
            ...data,
            style: {
              ...data.style,
              height: e.target.value ? parseInt(e.target.value) : undefined,
            },
          })
        }
        fullWidth
        margin="normal"
      />

      <MultiStylePropertyPanel
        names={["backgroundColor", "padding"]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  )
}
