import React, { useState } from "react"
import {
  HeadingProps,
  HeadingPropsDefaults,
  HeadingPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-heading"
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
} from "@mui/material"
// import {
//   HeadingProps,
//   HeadingPropsDefaults,
//   HeadingPropsSchema,
// } from "@usewaypoint/block-heading"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import RadioGroupInput from "./helpers/inputs/RadioGroupInput"
import TextInput from "./helpers/inputs/TextInput"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type HeadingSidebarPanelProps = {
  data: HeadingProps
  setData: (v: HeadingProps) => void
}

const basePropsObj = (
  HeadingPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedHeadingPropsSchema = HeadingPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function HeadingSidebarPanel({
  data,
  setData,
}: HeadingSidebarPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedHeadingPropsSchema.safeParse(d)
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
    <BaseSidebarPanel title="Heading block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Heading Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Heading Purpose"
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
        rows={3}
        defaultValue={data.props?.text ?? HeadingPropsDefaults.text}
        onChange={(text) => {
          updateData({ ...data, props: { ...data.props, text } })
        }}
      />
      <RadioGroupInput
        label="Level"
        defaultValue={data.props?.level ?? HeadingPropsDefaults.level}
        onChange={(level) => {
          updateData({ ...data, props: { ...data.props, level } })
        }}
      >
        <ToggleButton value="h1">H1</ToggleButton>
        <ToggleButton value="h2">H2</ToggleButton>
        <ToggleButton value="h3">H3</ToggleButton>
      </RadioGroupInput>
      <MultiStylePropertyPanel
        names={[
          "color",
          "backgroundColor",
          "fontFamily",
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
