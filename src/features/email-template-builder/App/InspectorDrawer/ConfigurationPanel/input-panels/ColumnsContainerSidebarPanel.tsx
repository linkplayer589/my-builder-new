// import React, { useState } from "react"
// import {
//   ColumnsContainerProps,
//   ColumnsContainerPropsSchema,
// } from "@/features/email-template-builder/@usewaypoint/block-columns-container"
// import {
//   SpaceBarOutlined,
//   VerticalAlignBottomOutlined,
//   VerticalAlignCenterOutlined,
//   VerticalAlignTopOutlined,
// } from "@mui/icons-material"
// import {
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   ToggleButton,
// } from "@mui/material"
// import { z } from "zod"

// import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
// import ColumnWidthsInput from "./helpers/inputs/ColumnWidthsInput"
// import RadioGroupInput from "./helpers/inputs/RadioGroupInput"
// import SliderInput from "./helpers/inputs/SliderInput"
// import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

// type ColumnsContainerPanelProps = {
//   data: ColumnsContainerProps
//   setData: (v: ColumnsContainerProps) => void
// }

// const basePropsObj = (
//   ColumnsContainerPropsSchema.shape.props as z.ZodNullable<
//     z.ZodOptional<z.ZodObject<any>>
//   >
// )
//   .unwrap() // remove Nullable
//   .unwrap() // remove Optional

// const ExtendedColumnsContainerPropsSchema = ColumnsContainerPropsSchema.extend({
//   props: basePropsObj
//     .extend({
//       purpose: z.string().optional().nullable(),
//     })
//     .optional()
//     .nullable(),
// })

// export default function ColumnsContainerPanel({
//   data,
//   setData,
// }: ColumnsContainerPanelProps) {
//   console.log("ColumnsContainerPanel data:", data)
//   console.log("Current fixedWidths:", (data.props as any)?.fixedWidths)

//   const [, setErrors] = useState<Zod.ZodError | null>(null)
//   const updateData = (d: unknown) => {
//     const res = ExtendedColumnsContainerPropsSchema.safeParse(d)
//     if (res.success) {
//       const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }
//       const newData = {
//         ...(res.data as any),
//         props: {
//           ...(res.data.props as any),
//           position: currentPosition, // KEEP POSITION
//         },
//       }
//       console.log("Setting new data:", newData)
//       setData(newData)
//       setErrors(null)
//     } else {
//       setErrors(res.error)
//     }
//   }

//   return (
//     <BaseSidebarPanel title="Columns block">
//       {/* Add Purpose Selection */}
//       <FormControl fullWidth sx={{ mb: 2 }}>
//         <InputLabel>Columns Purpose</InputLabel>
//         <Select
//           value={(data.props as any)?.purpose || ""}
//           label="Columns Purpose"
//           onChange={(e: any) =>
//             updateData({
//               ...data,
//               props: { ...(data as any).props, purpose: e.target.value },
//             })
//           }
//         >
//           <MenuItem value="">None</MenuItem>
//           <MenuItem value="features">Features List</MenuItem>
//           <MenuItem value="pricing">Pricing Columns</MenuItem>
//           <MenuItem value="team">Team Members</MenuItem>
//           <MenuItem value="testimonials">Testimonials</MenuItem>
//           <MenuItem value="products">Product Grid</MenuItem>
//           <MenuItem value="stats">Statistics</MenuItem>
//           <MenuItem value="comparison">Comparison Table</MenuItem>
//         </Select>
//       </FormControl>

//       {/* <RadioGroupInput
//         label="Number of columns"
//         defaultValue={(data.props as any)?.columnsCount === 2 ? "2" : "3"}
//         onChange={(v) => {
//           updateData({
//             ...data,
//             props: { ...(data.props as any), columnsCount: v === "2" ? 2 : 3 },
//           })
//         }}
//       >
//         <ToggleButton value="2">2</ToggleButton>
//         <ToggleButton value="3">3</ToggleButton>
//       </RadioGroupInput> */}
//       <ColumnWidthsInput
//         defaultValue={(data.props as any)?.fixedWidths}
//         onChange={(fixedWidths) => {
//           console.log("ColumnWidthsInput onChange called with:", fixedWidths)
//           updateData({
//             ...data,
//             props: { ...(data.props as any), fixedWidths },
//           })
//         }}
//       />
//       <SliderInput
//         label="Columns gap"
//         iconLabel={<SpaceBarOutlined sx={{ color: "text.secondary" }} />}
//         units="px"
//         step={4}
//         marks
//         min={0}
//         max={80}
//         defaultValue={(data.props as any)?.columnsGap ?? 0}
//         onChange={(columnsGap) =>
//           updateData({ ...data, props: { ...(data.props as any), columnsGap } })
//         }
//       />
//       <RadioGroupInput
//         label="Alignment"
//         defaultValue={(data.props as any)?.contentAlignment ?? "middle"}
//         onChange={(contentAlignment) => {
//           updateData({
//             ...data,
//             props: { ...(data.props as any), contentAlignment },
//           })
//         }}
//       >
//         <ToggleButton value="top">
//           <VerticalAlignTopOutlined fontSize="small" />
//         </ToggleButton>
//         <ToggleButton value="middle">
//           <VerticalAlignCenterOutlined fontSize="small" />
//         </ToggleButton>
//         <ToggleButton value="bottom">
//           <VerticalAlignBottomOutlined fontSize="small" />
//         </ToggleButton>
//       </RadioGroupInput>

//       <MultiStylePropertyPanel
//         names={["backgroundColor", "padding"]}
//         value={data.style as any}
//         onChange={(style) =>
//           updateData({ ...data, style: { ...(data.style as any), ...style } })
//         }
//       />
//     </BaseSidebarPanel>
//   )
// }

import React, { useState } from "react"
import {
  ColumnsContainerProps,
  ColumnsContainerPropsSchema,
} from "@/features/email-template-builder/@usewaypoint/block-columns-container"
import {
  SpaceBarOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignCenterOutlined,
  VerticalAlignTopOutlined,
} from "@mui/icons-material"
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
} from "@mui/material"
import { z } from "zod"

import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import ColumnWidthsInput from "./helpers/inputs/ColumnWidthsInput"
import RadioGroupInput from "./helpers/inputs/RadioGroupInput"
import SliderInput from "./helpers/inputs/SliderInput"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type ColumnsContainerPanelProps = {
  data: ColumnsContainerProps
  setData: (v: ColumnsContainerProps) => void
}

const basePropsObj = (
  ColumnsContainerPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedColumnsContainerPropsSchema = ColumnsContainerPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function ColumnsContainerPanel({
  data,
  setData,
}: ColumnsContainerPanelProps) {
  console.log("ColumnsContainerPanel data:", data)
  console.log("Current fixedWidths:", (data.props as any)?.fixedWidths)

  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedColumnsContainerPropsSchema.safeParse(d)
    if (res.success) {
      // Preserve ALL existing props and only update what's necessary
      const currentProps = (data.props as any) || {}
      const newProps = {
        ...currentProps, // Keep all existing props
        ...(res.data as any).props, // Apply new props
      }

      const newData = {
        ...(res.data as any),
        props: newProps, // Use the merged props
      }
      console.log("Setting new data:", newData)
      setData(newData)
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  return (
    <BaseSidebarPanel title="Columns block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Columns Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Columns Purpose"
          onChange={(e: any) =>
            updateData({
              ...data,
              props: {
                ...(data.props as any), // Preserve all existing props
                purpose: e.target.value, // Only update purpose
              },
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="features">Features List</MenuItem>
          <MenuItem value="pricing">Pricing Columns</MenuItem>
          <MenuItem value="team">Team Members</MenuItem>
          <MenuItem value="testimonials">Testimonials</MenuItem>
          <MenuItem value="products">Product Grid</MenuItem>
          <MenuItem value="stats">Statistics</MenuItem>
          <MenuItem value="comparison">Comparison Table</MenuItem>
        </Select>
      </FormControl>

      <ColumnWidthsInput
        defaultValue={(data.props as any)?.fixedWidths}
        onChange={(fixedWidths) => {
          console.log("ColumnWidthsInput onChange called with:", fixedWidths)
          updateData({
            ...data,
            props: {
              ...(data.props as any), // Preserve all existing props
              fixedWidths, // Only update fixedWidths
            },
          })
        }}
      />

      <SliderInput
        label="Columns gap"
        iconLabel={<SpaceBarOutlined sx={{ color: "text.secondary" }} />}
        units="px"
        step={4}
        marks
        min={0}
        max={80}
        defaultValue={(data.props as any)?.columnsGap ?? 0}
        onChange={(columnsGap) =>
          updateData({
            ...data,
            props: {
              ...(data.props as any), // Preserve all existing props
              columnsGap, // Only update columnsGap
            },
          })
        }
      />

      <RadioGroupInput
        label="Alignment"
        defaultValue={(data.props as any)?.contentAlignment ?? "middle"}
        onChange={(contentAlignment) => {
          updateData({
            ...data,
            props: {
              ...(data.props as any), // Preserve all existing props
              contentAlignment, // Only update contentAlignment
            },
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

      <MultiStylePropertyPanel
        names={["backgroundColor", "padding"]}
        value={data.style as any}
        onChange={(style) =>
          updateData({
            ...data,
            style: {
              ...(data.style as any), // Preserve existing style properties
              ...style, // Update only the changed style properties
            },
          })
        }
      />
    </BaseSidebarPanel>
  )
}
