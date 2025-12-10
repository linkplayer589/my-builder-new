// SpacerSidebarPanel.tsx
import React, { useState } from "react"
import {
  SpacerProps,
  SpacerPropsDefaults,
  SpacerPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-spacer"
import { HeightOutlined, WidthFullOutlined } from "@mui/icons-material" // Add Width icon
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
// import {
//   SpacerProps,
//   SpacerPropsDefaults,
//   SpacerPropsSchema,
// } from "@usewaypoint/block-spacer"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import SliderInput from "./helpers/inputs/SliderInput"

type SpacerSidebarPanelProps = {
  data: SpacerProps
  setData: (v: SpacerProps) => void
}

const basePropsObj = (
  SpacerPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedSpacerPropsSchema = SpacerPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
      width: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function SpacerSidebarPanel({
  data,
  setData,
}: SpacerSidebarPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedSpacerPropsSchema.safeParse(d)
    if (res.success) {
      // const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }
      // setData({
      //   ...res.data,
      //   props: {
      //     ...res.data.props,
      //     width:
      //       res.data.props?.width != null ? Number(res.data.props.width) : null,
      //     position: currentPosition,
      //   },
      // })
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  return (
    <BaseSidebarPanel title="Spacer block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Spacer Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Spacer Purpose"
          onChange={(e: any) =>
            updateData({
              ...data,
              props: { ...data.props, purpose: e.target.value },
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="section-spacing">Section Spacing</MenuItem>
          <MenuItem value="content-separation">Content Separation</MenuItem>
          <MenuItem value="visual-break">Visual Break</MenuItem>
          <MenuItem value="whitespace">Whitespace</MenuItem>
        </Select>
      </FormControl>

      <SliderInput
        label="Height"
        iconLabel={<HeightOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={4}
        min={4}
        max={128}
        defaultValue={data.props?.height ?? SpacerPropsDefaults.height}
        onChange={(height) =>
          updateData({ ...data, props: { ...data.props, height } })
        }
      />

      {/* Add Width Slider */}
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
    </BaseSidebarPanel>
  )
}
