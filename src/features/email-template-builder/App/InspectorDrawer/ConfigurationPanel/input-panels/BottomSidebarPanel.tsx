import React, { useState } from "react"
import {
  BottomSectionProps,
  BottomSectionPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-bottom"
import {
  AspectRatioOutlined,
  FormatAlignCenterOutlined,
  FormatAlignLeftOutlined,
  FormatAlignRightOutlined,
  FormatSizeOutlined,
  ImageOutlined,
  TextFieldsOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignCenterOutlined,
  VerticalAlignTopOutlined,
} from "@mui/icons-material"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
} from "@mui/material"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import ColorInput from "./helpers/inputs/ColorInput/BaseColorInput"
import RadioGroupInput from "./helpers/inputs/RadioGroupInput"
import SliderInput from "./helpers/inputs/SliderInput"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type BottomSectionPanelProps = {
  data: BottomSectionProps
  setData: (v: BottomSectionProps) => void
}

const basePropsObj = (
  BottomSectionPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap()
  .unwrap()

const ExtendedBottomSectionPropsSchema = BottomSectionPropsSchema.extend({
  props: basePropsObj.optional().nullable(),
})

export default function BottomSectionSidebarPanel({
  data,
  setData,
}: BottomSectionPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedBottomSectionPropsSchema.safeParse(d)
    if (res.success) {
      setData(res.data as BottomSectionProps)
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  return (
    <BaseSidebarPanel title="Dual Text Header Block">
      {/* Background Image */}
      <TextField
        fullWidth
        label="Background Image URL"
        value={(data.props as any)?.backgroundImage || ""}
        onChange={(e) =>
          updateData({
            ...data,
            props: { ...(data.props as any), backgroundImage: e.target.value },
          })
        }
        margin="normal"
        InputProps={{
          startAdornment: (
            <ImageOutlined sx={{ color: "text.secondary", mr: 1 }} />
          ),
        }}
      />

      {/* Logo Settings */}
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Logo URL"
          value={(data.props as any)?.logoUrl || ""}
          onChange={(e) =>
            updateData({
              ...data,
              props: { ...(data.props as any), logoUrl: e.target.value },
            })
          }
          margin="normal"
        />
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <TextField
            label="Logo Width"
            type="number"
            value={(data.props as any)?.logoWidth || 120}
            onChange={(e) =>
              updateData({
                ...data,
                props: {
                  ...(data.props as any),
                  logoWidth: parseInt(e.target.value),
                },
              })
            }
          />
          <TextField
            label="Logo Height"
            type="number"
            value={(data.props as any)?.logoHeight || 48}
            onChange={(e) =>
              updateData({
                ...data,
                props: {
                  ...(data.props as any),
                  logoHeight: parseInt(e.target.value),
                },
              })
            }
          />
        </Box>

        {/* Logo Horizontal Alignment */}
        <RadioGroupInput
          label="Logo Horizontal Alignment"
          defaultValue={(data.props as any)?.logoAlignment || "center"}
          onChange={(logoAlignment: any) => {
            updateData({
              ...data,
              props: { ...(data.props as any), logoAlignment },
            })
          }}
        >
          <ToggleButton value="left">
            <FormatAlignLeftOutlined fontSize="small" />
          </ToggleButton>
          <ToggleButton value="center">
            <FormatAlignCenterOutlined fontSize="small" />
          </ToggleButton>
          <ToggleButton value="right">
            <FormatAlignRightOutlined fontSize="small" />
          </ToggleButton>
        </RadioGroupInput>

        {/* Logo Vertical Alignment */}
        <RadioGroupInput
          label="Logo Vertical Alignment"
          defaultValue={(data.props as any)?.logoVerticalAlignment || "top"}
          onChange={(logoVerticalAlignment: any) => {
            updateData({
              ...data,
              props: { ...(data.props as any), logoVerticalAlignment },
            })
          }}
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
      </Box>

      {/* Primary Text */}
      <TextField
        fullWidth
        label="Primary Text"
        value={(data.props as any)?.primaryText || ""}
        onChange={(e) =>
          updateData({
            ...data,
            props: { ...(data.props as any), primaryText: e.target.value },
          })
        }
        margin="normal"
        multiline
        rows={2}
        InputProps={{
          startAdornment: (
            <TextFieldsOutlined sx={{ color: "text.secondary", mr: 1 }} />
          ),
        }}
      />

      {/* Primary Text Horizontal Alignment */}
      <RadioGroupInput
        label="Primary Text Horizontal Alignment"
        defaultValue={(data.props as any)?.primaryTextAlign || "left"}
        onChange={(primaryTextAlign: any) => {
          updateData({
            ...data,
            props: { ...(data.props as any), primaryTextAlign },
          })
        }}
      >
        <ToggleButton value="left">
          <FormatAlignLeftOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="center">
          <FormatAlignCenterOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="right">
          <FormatAlignRightOutlined fontSize="small" />
        </ToggleButton>
      </RadioGroupInput>

      {/* Primary Text Vertical Alignment */}
      <RadioGroupInput
        label="Primary Text Vertical Alignment"
        defaultValue={(data.props as any)?.primaryVerticalAlignment || "top"}
        onChange={(primaryVerticalAlignment: any) => {
          updateData({
            ...data,
            props: { ...(data.props as any), primaryVerticalAlignment },
          })
        }}
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

      {/* Primary Text Width */}
      <SliderInput
        label="Primary Text Width"
        iconLabel={<AspectRatioOutlined sx={{ color: "text.secondary" }} />}
        units="%"
        step={5}
        marks
        min={20}
        max={100}
        defaultValue={(data.props as any)?.primaryWidth || 85}
        onChange={(primaryWidth) =>
          updateData({
            ...data,
            props: { ...(data.props as any), primaryWidth },
          })
        }
      />

      {/* Primary Text Font Size */}
      <SliderInput
        label="Primary Text Font Size"
        iconLabel={<FormatSizeOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={2}
        marks
        min={10}
        max={60}
        defaultValue={(data.props as any)?.primaryFontSize || 40}
        onChange={(primaryFontSize) =>
          updateData({
            ...data,
            props: { ...(data.props as any), primaryFontSize },
          })
        }
      />

      {/* Secondary Text */}
      <TextField
        fullWidth
        label="Secondary Text"
        value={(data.props as any)?.secondaryText || ""}
        onChange={(e) =>
          updateData({
            ...data,
            props: { ...(data.props as any), secondaryText: e.target.value },
          })
        }
        margin="normal"
        multiline
        rows={2}
        InputProps={{
          startAdornment: (
            <TextFieldsOutlined sx={{ color: "text.secondary", mr: 1 }} />
          ),
        }}
      />

      {/* Secondary Text Horizontal Alignment */}
      <RadioGroupInput
        label="Secondary Text Horizontal Alignment"
        defaultValue={(data.props as any)?.secondaryTextAlign || "left"}
        onChange={(secondaryTextAlign: any) => {
          updateData({
            ...data,
            props: { ...(data.props as any), secondaryTextAlign },
          })
        }}
      >
        <ToggleButton value="left">
          <FormatAlignLeftOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="center">
          <FormatAlignCenterOutlined fontSize="small" />
        </ToggleButton>
        <ToggleButton value="right">
          <FormatAlignRightOutlined fontSize="small" />
        </ToggleButton>
      </RadioGroupInput>

      {/* Secondary Text Vertical Alignment */}
      {/* <RadioGroupInput
        label="Secondary Text Vertical Alignment"
        defaultValue={(data.props as any)?.secondaryVerticalAlignment || "top"}
        onChange={(secondaryVerticalAlignment: any) => {
          updateData({
            ...data,
            props: { ...(data.props as any), secondaryVerticalAlignment },
          })
        }}
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
      </RadioGroupInput> */}

      {/* Secondary Text Width */}
      <SliderInput
        label="Secondary Text Width"
        iconLabel={<AspectRatioOutlined sx={{ color: "text.secondary" }} />}
        units="%"
        step={1}
        marks
        min={10}
        max={100}
        defaultValue={(data.props as any)?.secondaryWidth || 85}
        onChange={(secondaryWidth) =>
          updateData({
            ...data,
            props: { ...(data.props as any), secondaryWidth },
          })
        }
      />

      {/* Secondary Text Font Size */}
      <SliderInput
        label="Secondary Text Font Size"
        iconLabel={<FormatSizeOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={1}
        marks
        min={10}
        max={50}
        defaultValue={(data.props as any)?.secondaryFontSize || 24}
        onChange={(secondaryFontSize) =>
          updateData({
            ...data,
            props: { ...(data.props as any), secondaryFontSize },
          })
        }
      />

      {/* Text Spacing */}
      <SliderInput
        label="Text Spacing"
        iconLabel={
          <VerticalAlignCenterOutlined sx={{ color: "text.secondary" }} />
        }
        units="px"
        step={2}
        marks
        min={0}
        max={40}
        defaultValue={(data.props as any)?.textSpacing || 8}
        onChange={(textSpacing) =>
          updateData({
            ...data,
            props: { ...(data.props as any), textSpacing },
          })
        }
      />

      {/* Header Height */}
      <SliderInput
        label="Bottom Section Height"
        iconLabel={<ImageOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={20}
        marks
        min={200}
        max={800}
        defaultValue={(data.props as any)?.headerHeight || 460}
        onChange={(headerHeight) =>
          updateData({
            ...data,
            props: { ...(data.props as any), headerHeight },
          })
        }
      />

      {/* Container Width */}
      <SliderInput
        label="Container Width"
        iconLabel={<AspectRatioOutlined sx={{ color: "text.secondary" }} />}
        units="%"
        step={5}
        marks
        min={10}
        max={100}
        defaultValue={parseInt((data.props as any)?.containerWidth || "100")}
        onChange={(containerWidth) =>
          updateData({
            ...data,
            props: {
              ...(data.props as any),
              containerWidth: `${containerWidth}%`,
            },
          })
        }
      />

      {/* Primary Text Font Weight */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Primary Text Font Weight</InputLabel>
        <Select
          value={(data.props as any)?.primaryFontWeight || "700"}
          label="Primary Text Font Weight"
          onChange={(e) =>
            updateData({
              ...data,
              props: {
                ...(data.props as any),
                primaryFontWeight: e.target.value,
              },
            })
          }
        >
          <MenuItem value="400">Normal</MenuItem>
          <MenuItem value="500">Medium</MenuItem>
          <MenuItem value="600">Semi Bold</MenuItem>
          <MenuItem value="700">Bold</MenuItem>
          <MenuItem value="800">Extra Bold</MenuItem>
        </Select>
      </FormControl>

      {/* Secondary Text Font Weight */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Secondary Text Font Weight</InputLabel>
        <Select
          value={(data.props as any)?.secondaryFontWeight || "400"}
          label="Secondary Text Font Weight"
          onChange={(e) =>
            updateData({
              ...data,
              props: {
                ...(data.props as any),
                secondaryFontWeight: e.target.value,
              },
            })
          }
        >
          <MenuItem value="300">Light</MenuItem>
          <MenuItem value="400">Normal</MenuItem>
          <MenuItem value="500">Medium</MenuItem>
          <MenuItem value="600">Semi Bold</MenuItem>
          <MenuItem value="700">Bold</MenuItem>
        </Select>
      </FormControl>

      {/* Primary Text Color */}
      <ColorInput
        label="Primary Text Color"
        defaultValue={(data.props as any)?.primaryTextColor || "#333f5f"}
        onChange={(primaryTextColor) =>
          updateData({
            ...data,
            props: { ...(data.props as any), primaryTextColor },
          })
        }
        nullable={false}
      />

      {/* Secondary Text Color */}
      <ColorInput
        label="Secondary Text Color"
        defaultValue={(data.props as any)?.secondaryTextColor || "#333f5f"}
        onChange={(secondaryTextColor) =>
          updateData({
            ...data,
            props: { ...(data.props as any), secondaryTextColor },
          })
        }
        nullable={false}
      />

      <MultiStylePropertyPanel
        names={["backgroundColor", "padding"]}
        value={data.style as any}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  )
}
