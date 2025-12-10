// DividerSidebarPanel.tsx
import React, { useState } from "react"
import {
  DividerProps,
  DividerPropsDefaults,
  DividerPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-divider"
import {
  ColorLensOutlined,
  HeightOutlined,
  WidthFullOutlined,
} from "@mui/icons-material"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import ColorInput from "./helpers/inputs/ColorInput"
import SliderInput from "./helpers/inputs/SliderInput"

type DividerSidebarPanelProps = {
  data: DividerProps
  setData: (v: DividerProps) => void
}

const basePropsObj = (
  DividerPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedDividerPropsSchema = DividerPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
      width: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function DividerSidebarPanel({
  data,
  setData,
}: DividerSidebarPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedDividerPropsSchema.safeParse(d)
    if (res.success) {
      const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }
      setData({
        ...res.data,
        props: {
          ...res.data.props,
          width:
            res.data.props?.width != null ? Number(res.data.props.width) : null,
          // position: currentPosition, // KEEP POSITION
        },
      })
      // setData(res.data as DividerProps)
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  return (
    <BaseSidebarPanel title="Divider block">
      {/* Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Divider Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Divider Purpose"
          onChange={(e: any) =>
            updateData({
              ...data,
              props: { ...data.props, purpose: e.target.value },
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="section-separator">Section Separator</MenuItem>
          <MenuItem value="content-divider">Content Divider</MenuItem>
          <MenuItem value="visual-separation">Visual Separation</MenuItem>
          <MenuItem value="thematic-break">Thematic Break</MenuItem>
        </Select>
      </FormControl>

      {/* Line Thickness */}
      <SliderInput
        label="Line Thickness"
        iconLabel={<HeightOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={1}
        min={1}
        max={10}
        defaultValue={data.props?.lineHeight ?? DividerPropsDefaults.lineHeight}
        onChange={(lineHeight) =>
          updateData({ ...data, props: { ...data.props, lineHeight } })
        }
      />

      {/* Width Control */}
      <SliderInput
        label="Width"
        iconLabel={<WidthFullOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={4}
        min={0} // 0 means "auto" or "100%"
        max={800}
        defaultValue={(data.props as any)?.width ?? 0}
        onChange={(width) => {
          // If width is 0, set it to undefined (meaning use container width)
          const widthValue = width === 0 ? undefined : width
          updateData({ ...data, props: { ...data.props, width: widthValue } })
        }}
      />

      {/* Line Color */}
      <ColorInput
        label="Line Color"
        // iconLabel={<ColorLensOutlined sx={{ color: "text.secondary" }} />}
        defaultValue={data.props?.lineColor ?? DividerPropsDefaults.lineColor}
        onChange={(lineColor) =>
          updateData({ ...data, props: { ...data.props, lineColor } })
        }
      />
    </BaseSidebarPanel>
  )
}
