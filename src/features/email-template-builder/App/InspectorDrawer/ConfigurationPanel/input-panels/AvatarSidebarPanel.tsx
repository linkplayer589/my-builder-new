import React, { useState } from "react"
import { AspectRatioOutlined } from "@mui/icons-material"
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
} from "@mui/material"
import { z } from "zod"

import {
  AvatarProps,
  AvatarPropsDefaults,
  AvatarPropsSchema,
} from "../../../../@usewaypoint/block-avatar"
import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import RadioGroupInput from "./helpers/inputs/RadioGroupInput"
import SliderInput from "./helpers/inputs/SliderInput"
import TextInput from "./helpers/inputs/TextInput"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type AvatarSidebarPanelProps = {
  data: AvatarProps
  setData: (v: AvatarProps) => void
}

const basePropsObj = (
  AvatarPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedAvatarPropsSchema = AvatarPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function AvatarSidebarPanel({
  data,
  setData,
}: AvatarSidebarPanelProps) {
  const [, setErrors] = useState<z.ZodError | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedAvatarPropsSchema.safeParse(d)
    if (res.success) {
      const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }

      setData({
        ...(res.data as any),
        props: {
          ...(res.data.props as any),
          position: currentPosition,
        },
      } as AvatarProps)
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  const size = data.props?.size ?? AvatarPropsDefaults.size
  const imageUrl = data.props?.imageUrl ?? AvatarPropsDefaults.imageUrl
  const alt = data.props?.alt ?? AvatarPropsDefaults.alt
  const shape = data.props?.shape ?? AvatarPropsDefaults.shape

  return (
    <BaseSidebarPanel title="Avatar block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Avatar Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Avatar Purpose"
          onChange={(e: any) =>
            updateData({
              ...data,
              props: { ...data.props, purpose: e.target.value },
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="websiteLink">Website Link</MenuItem>
          <MenuItem value="instagramLink">Instagram Link</MenuItem>
          <MenuItem value="facebookLink">Facebook Link</MenuItem>
          <MenuItem value="updateProfileLink">Update ProfileLink</MenuItem>
          <MenuItem value="unsubscribeLink">Unsubscribe Link</MenuItem>
        </Select>
      </FormControl>

      <SliderInput
        label="Size"
        iconLabel={<AspectRatioOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={3}
        min={32}
        max={256}
        defaultValue={size}
        onChange={(size) => {
          updateData({ ...data, props: { ...data.props, size } })
        }}
      />
      <RadioGroupInput
        label="Shape"
        defaultValue={shape}
        onChange={(shape) => {
          updateData({ ...data, props: { ...data.props, shape } })
        }}
      >
        <ToggleButton value="circle">Circle</ToggleButton>
        <ToggleButton value="square">Square</ToggleButton>
        <ToggleButton value="rounded">Rounded</ToggleButton>
      </RadioGroupInput>
      <TextInput
        label="Image URL"
        defaultValue={imageUrl}
        onChange={(imageUrl) => {
          updateData({ ...data, props: { ...data.props, imageUrl } })
        }}
      />
      <TextInput
        label="Alt text"
        defaultValue={alt}
        onChange={(alt) => {
          updateData({ ...data, props: { ...data.props, alt } })
        }}
      />

      <MultiStylePropertyPanel
        names={["textAlign", "padding"]}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  )
}
