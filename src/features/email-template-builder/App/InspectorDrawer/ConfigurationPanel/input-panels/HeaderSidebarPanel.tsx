import React, { useState } from "react"
import {
  HeaderProps,
  HeaderPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-header"
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

type HeaderPanelProps = {
  data: HeaderProps
  setData: (v: HeaderProps) => void
}

const basePropsObj = (
  HeaderPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap()
  .unwrap()

const ExtendedHeaderPropsSchema = HeaderPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function HeaderSidebarPanel({
  data,
  setData,
}: HeaderPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedHeaderPropsSchema.safeParse(d)
    if (res.success) {
      setData(res.data as HeaderProps)
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  return (
    <BaseSidebarPanel title="Header Block">
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

      {/* Heading Text */}
      <TextField
        fullWidth
        label="Heading Text"
        value={(data.props as any)?.headingText || ""}
        onChange={(e) =>
          updateData({
            ...data,
            props: { ...(data.props as any), headingText: e.target.value },
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

      {/* Heading Horizontal Alignment */}
      <RadioGroupInput
        label="Text Horizontal Alignment"
        defaultValue={(data.props as any)?.headingTextAlign || "left"}
        onChange={(headingTextAlign: any) => {
          updateData({
            ...data,
            props: { ...(data.props as any), headingTextAlign },
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

      {/* Heading Vertical Alignment */}
      <RadioGroupInput
        label="Text Vertical Alignment"
        defaultValue={(data.props as any)?.headingVerticalAlignment || "top"}
        onChange={(headingVerticalAlignment: any) => {
          updateData({
            ...data,
            props: { ...(data.props as any), headingVerticalAlignment },
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

      {/* Heading Width */}
      <SliderInput
        label="Heading Width"
        iconLabel={<AspectRatioOutlined sx={{ color: "text.secondary" }} />}
        units="%"
        step={5}
        marks
        min={20}
        max={100}
        defaultValue={(data.props as any)?.headingWidth || 85}
        onChange={(headingWidth) =>
          updateData({
            ...data,
            props: { ...(data.props as any), headingWidth },
          })
        }
      />

      {/* Heading Font Size */}
      <SliderInput
        label="Font Size"
        iconLabel={<FormatSizeOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={2}
        marks
        min={20}
        max={60}
        defaultValue={(data.props as any)?.headingFontSize || 40}
        onChange={(headingFontSize) =>
          updateData({
            ...data,
            props: { ...(data.props as any), headingFontSize },
          })
        }
      />

      {/* Header Height */}
      <SliderInput
        label="Header Height"
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

      {/* Font Weight */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Font Weight</InputLabel>
        <Select
          value={(data.props as any)?.headingFontWeight || "700"}
          label="Font Weight"
          onChange={(e) =>
            updateData({
              ...data,
              props: {
                ...(data.props as any),
                headingFontWeight: e.target.value,
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

      {/* Heading Color */}
      <ColorInput
        label="Heading Color"
        defaultValue={(data.props as any)?.headingColor || "#333f5f"}
        onChange={(headingColor) =>
          updateData({
            ...data,
            props: { ...(data.props as any), headingColor },
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
