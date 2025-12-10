import React, { useState } from "react"
import {
  ImageProps,
  ImagePropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-image"
import {
  VerticalAlignBottomOutlined,
  VerticalAlignCenterOutlined,
  VerticalAlignTopOutlined,
} from "@mui/icons-material"
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
} from "@mui/material"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import RadioGroupInput from "./helpers/inputs/RadioGroupInput"
import TextDimensionInput from "./helpers/inputs/TextDimensionInput"
import TextInput from "./helpers/inputs/TextInput"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type ImageSidebarPanelProps = {
  data: ImageProps
  setData: (v: ImageProps) => void
}

const basePropsObj = (
  ImagePropsSchema.shape.props as z.ZodNullable<z.ZodOptional<z.ZodObject<any>>>
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedImagePropsSchema = ImagePropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function ImageSidebarPanel({
  data,
  setData,
}: ImageSidebarPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedImagePropsSchema.safeParse(d)
    if (res.success) {
      const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }

      setData({
        ...(res.data as any),
        props: {
          ...(res.data as any).props,
          position: currentPosition,
        },
      })
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  return (
    <BaseSidebarPanel title="Image block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Image Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Image Purpose"
          onChange={(e: any) =>
            updateData({
              ...data,
              props: { ...data.props, purpose: e.target.value },
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="logo">Logo</MenuItem>
          <MenuItem value="qr-code">QR Code</MenuItem>
          <MenuItem value="header">Header Image</MenuItem>
          <MenuItem value="footer">Footer Image</MenuItem>
          <MenuItem value="banner">Banner</MenuItem>
          <MenuItem value="product">Product Image</MenuItem>
          <MenuItem value="icon">Icon</MenuItem>
        </Select>
      </FormControl>

      <TextInput
        label="Source URL"
        defaultValue={data.props?.url ?? ""}
        onChange={(v) => {
          const url = v.trim().length === 0 ? null : v.trim()
          updateData({ ...data, props: { ...data.props, url } })
        }}
      />

      <TextInput
        label="Alt text"
        defaultValue={data.props?.alt ?? ""}
        onChange={(alt) =>
          updateData({ ...data, props: { ...data.props, alt } })
        }
      />
      <TextInput
        label="Click through URL"
        defaultValue={data.props?.linkHref ?? ""}
        onChange={(v) => {
          const linkHref = v.trim().length === 0 ? null : v.trim()
          updateData({ ...data, props: { ...data.props, linkHref } })
        }}
      />
      <Stack direction="row" spacing={2}>
        <TextDimensionInput
          label="Width"
          defaultValue={data.props?.width}
          onChange={(width) =>
            updateData({ ...data, props: { ...data.props, width } })
          }
        />
        <TextDimensionInput
          label="Height"
          defaultValue={data.props?.height}
          onChange={(height) =>
            updateData({ ...data, props: { ...data.props, height } })
          }
        />
      </Stack>

      <RadioGroupInput
        label="Alignment"
        defaultValue={data.props?.contentAlignment ?? "middle"}
        onChange={(contentAlignment) =>
          updateData({ ...data, props: { ...data.props, contentAlignment } })
        }
      >
        <ToggleButton value="top">
          <VerticalAlignTopOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="middle">
          <VerticalAlignCenterOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="bottom">
          <VerticalAlignBottomOutlined fontSize="small" />
        </ToggleButton>
      </RadioGroupInput>

      <MultiStylePropertyPanel
        names={["backgroundColor", "textAlign", "padding"]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  )
}
