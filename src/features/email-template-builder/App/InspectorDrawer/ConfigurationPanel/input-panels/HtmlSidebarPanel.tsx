import React, { useState } from "react"
import {
  HtmlProps,
  HtmlPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-html"
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import TextInput from "./helpers/inputs/TextInput"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type HtmlSidebarPanelProps = {
  data: HtmlProps
  setData: (v: HtmlProps) => void
}

const basePropsObj = (
  HtmlPropsSchema.shape.props as z.ZodNullable<z.ZodOptional<z.ZodObject<any>>>
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedHtmlPropsSchema = HtmlPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.array(z.string()).optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function HtmlSidebarPanel({
  data,
  setData,
}: HtmlSidebarPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedHtmlPropsSchema.safeParse(d)
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

  const currentPurposes = (data.props as any)?.purpose || []

  return (
    <BaseSidebarPanel title="Html block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>HTML Purpose</InputLabel>
        <Select
          multiple
          value={currentPurposes}
          label="HTML Purpose"
          onChange={(e: any) => {
            const value = e.target.value
            // If "none" is selected, clear all purposes
            if (value.includes("")) {
              updateData({
                ...data,
                props: { ...data.props, purpose: [] },
              })
            } else {
              // Ensure we always have an array of strings
              const purposes = Array.isArray(value) ? value : [value]
              updateData({
                ...data,
                props: { ...data.props, purpose: purposes },
              })
            }
          }}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value: string) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
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
          <MenuItem value="orderDetailsLink">Order Details Link</MenuItem>
          <MenuItem value="websiteLink">Website Link</MenuItem>
          <MenuItem value="websiteLink">Instagram Link</MenuItem>
          <MenuItem value="facebookLink">Facebook Link</MenuItem>
          <MenuItem value="updateProfileLink">Update Profile Link</MenuItem>
          <MenuItem value="unsubscribeLink">Unsubscribe Link</MenuItem>
        </Select>
      </FormControl>

      <TextInput
        label="Content"
        rows={5}
        defaultValue={data.props?.contents ?? ""}
        onChange={(contents) =>
          updateData({ ...data, props: { ...data.props, contents } })
        }
      />
      <MultiStylePropertyPanel
        names={[
          "color",
          "backgroundColor",
          "fontFamily",
          "fontSize",
          "textAlign",
          "padding",
        ]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  )
}
