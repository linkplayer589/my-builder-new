import React, { useState } from "react"
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
} from "@mui/material"
import { z } from "zod"

import {
  ButtonProps,
  ButtonPropsDefaults,
  ButtonPropsSchema,
} from "../../../../@usewaypoint/block-button"
import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import ColorInput from "./helpers/inputs/ColorInput"
import RadioGroupInput from "./helpers/inputs/RadioGroupInput"
import TextInput from "./helpers/inputs/TextInput"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type ButtonSidebarPanelProps = {
  data: ButtonProps
  setData: (v: ButtonProps) => void
}

const basePropsObj = (
  ButtonPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedButtonPropsSchema = ButtonPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function ButtonSidebarPanel({
  data,
  setData,
}: ButtonSidebarPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedButtonPropsSchema.safeParse(d)
    if (res.success) {
      // const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }

      // setData({
      //   ...res.data,
      //   props: {
      //     ...res.data.props,
      //     position: currentPosition,
      //   },
      // })
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  const text = data.props?.text ?? ButtonPropsDefaults.text
  const url = data.props?.url ?? ButtonPropsDefaults.url
  const fullWidth = data.props?.fullWidth ?? ButtonPropsDefaults.fullWidth
  const size = data.props?.size ?? ButtonPropsDefaults.size
  const buttonStyle = data.props?.buttonStyle ?? ButtonPropsDefaults.buttonStyle
  const buttonTextColor =
    data.props?.buttonTextColor ?? ButtonPropsDefaults.buttonTextColor
  const buttonBackgroundColor =
    data.props?.buttonBackgroundColor ??
    ButtonPropsDefaults.buttonBackgroundColor

  return (
    <BaseSidebarPanel title="Button block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Button Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Button Purpose"
          onChange={(e: any) =>
            updateData({
              ...data,
              props: { ...data.props, purpose: e.target.value },
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="cta-primary">Primary CTA</MenuItem>
          <MenuItem value="cta-secondary">Secondary CTA</MenuItem>
          <MenuItem value="link">Link Button</MenuItem>
          <MenuItem value="action">Action Button</MenuItem>
          <MenuItem value="download">Download</MenuItem>
          <MenuItem value="subscribe">Subscribe</MenuItem>
          <MenuItem value="purchase">Purchase</MenuItem>
        </Select>
      </FormControl>

      <TextInput
        label="Text"
        defaultValue={text}
        onChange={(text) =>
          updateData({ ...data, props: { ...data.props, text } })
        }
      />
      <TextInput
        label="Url"
        defaultValue={url}
        onChange={(url) =>
          updateData({ ...data, props: { ...data.props, url } })
        }
      />
      <RadioGroupInput
        label="Width"
        defaultValue={fullWidth ? "FULL_WIDTH" : "AUTO"}
        onChange={(v) =>
          updateData({
            ...data,
            props: { ...data.props, fullWidth: v === "FULL_WIDTH" },
          })
        }
      >
        <ToggleButton value="FULL_WIDTH">Full</ToggleButton>
        <ToggleButton value="AUTO">Auto</ToggleButton>
      </RadioGroupInput>
      <RadioGroupInput
        label="Size"
        defaultValue={size}
        onChange={(size) =>
          updateData({ ...data, props: { ...data.props, size } })
        }
      >
        <ToggleButton value="x-small">Xs</ToggleButton>
        <ToggleButton value="small">Sm</ToggleButton>
        <ToggleButton value="medium">Md</ToggleButton>
        <ToggleButton value="large">Lg</ToggleButton>
      </RadioGroupInput>
      <RadioGroupInput
        label="Style"
        defaultValue={buttonStyle}
        onChange={(buttonStyle) =>
          updateData({ ...data, props: { ...data.props, buttonStyle } })
        }
      >
        <ToggleButton value="rectangle">Rectangle</ToggleButton>
        <ToggleButton value="rounded">Rounded</ToggleButton>
        <ToggleButton value="pill">Pill</ToggleButton>
      </RadioGroupInput>
      <ColorInput
        label="Text color"
        defaultValue={buttonTextColor}
        onChange={(buttonTextColor) =>
          updateData({ ...data, props: { ...data.props, buttonTextColor } })
        }
      />
      <ColorInput
        label="Button color"
        defaultValue={buttonBackgroundColor}
        onChange={(buttonBackgroundColor) =>
          updateData({
            ...data,
            props: { ...data.props, buttonBackgroundColor },
          })
        }
      />
      <MultiStylePropertyPanel
        names={[
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
