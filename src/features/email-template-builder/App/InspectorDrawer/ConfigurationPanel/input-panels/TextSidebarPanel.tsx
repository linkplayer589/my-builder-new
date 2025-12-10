import React, { useState } from "react"
import {
  TextProps,
  TextPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-text"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import BooleanInput from "./helpers/inputs/BooleanInput"
import TextInput from "./helpers/inputs/TextInput"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type TextSidebarPanelProps = {
  data: TextProps
  setData: (v: TextProps) => void
}

const basePropsObj = (
  TextPropsSchema.shape.props as z.ZodNullable<z.ZodOptional<z.ZodObject<any>>>
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedTextPropsSchema = TextPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function TextSidebarPanel({
  data,
  setData,
}: TextSidebarPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedTextPropsSchema.safeParse(d)
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
    <BaseSidebarPanel title="Text block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Text Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Text Purpose"
          onChange={(e: any) =>
            updateData({
              ...data,
              props: { ...data.props, purpose: e.target.value },
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="previewText">Preview Text</MenuItem>
          <MenuItem value="firstName">First Name</MenuItem>
          <MenuItem value="orderId">Order Id</MenuItem>
          <MenuItem value="orderStart">Order Start</MenuItem>
          <MenuItem value="orderEnd">Order End</MenuItem>
          <MenuItem value="orderDateRange">
            Order Date Range (Start + End)
          </MenuItem>
          <MenuItem value="if3to5daysText">if 3to5 days Text</MenuItem>
          <MenuItem value="if6to7daysText">if 6to7 days Text</MenuItem>
          <MenuItem value="resortName">Resort Name</MenuItem>
          <MenuItem value="orderTotal">Order Total</MenuItem>
        </Select>
      </FormControl>

      <TextInput
        label="Content"
        rows={5}
        defaultValue={data.props?.text ?? ""}
        onChange={(text) =>
          updateData({ ...data, props: { ...data.props, text } })
        }
      />
      <BooleanInput
        label="Markdown"
        defaultValue={data.props?.markdown ?? false}
        onChange={(markdown) =>
          updateData({ ...data, props: { ...data.props, markdown } })
        }
      />

      <MultiStylePropertyPanel
        names={[
          "color",
          "backgroundColor",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "textAlign",
          "padding",
        ]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  )
}
