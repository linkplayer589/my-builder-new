// import React, { useState } from "react"
// import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
// import { z } from "zod"

// import ContainerPropsSchema, {
//   ContainerProps,
// } from "../../../../documents/blocks/Container/ContainerPropsSchema"
// import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
// import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

// type ContainerSidebarPanelProps = {
//   data: ContainerProps
//   setData: (v: ContainerProps) => void
// }

// const basePropsObj = (
//   ContainerPropsSchema.shape.props as z.ZodNullable<
//     z.ZodOptional<z.ZodObject<any>>
//   >
// )
//   .unwrap() // remove Nullable
//   .unwrap() // remove Optional

// const ExtendedContainerPropsSchema = ContainerPropsSchema.extend({
//   props: basePropsObj
//     .extend({
//       purpose: z.string().optional().nullable(),
//     })
//     .optional()
//     .nullable(),
// })

// export default function ContainerSidebarPanel({
//   data,
//   setData,
// }: ContainerSidebarPanelProps) {
//   const [, setErrors] = useState<Zod.ZodError | null>(null)
//   const updateData = (d: unknown) => {
//     const res = ExtendedContainerPropsSchema.safeParse(d)
//     if (res.success) {
//       const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }

//       setData({
//         ...(res.data as any),
//         props: {
//           ...(res.data as any).props,
//           position: currentPosition, // KEEP POSITION
//         },
//       })
//       setErrors(null)
//     } else {
//       setErrors(res.error)
//     }
//   }

//   return (
//     <BaseSidebarPanel title="Container block">
//       {/* Add Purpose Selection */}
//       <FormControl fullWidth sx={{ mb: 2 }}>
//         <InputLabel>Container Purpose</InputLabel>
//         <Select
//           value={(data.props as any)?.purpose || ""}
//           label="Container Purpose"
//           onChange={(e: any) =>
//             updateData({
//               ...data,
//               props: { ...(data as any).props, purpose: e.target.value },
//             })
//           }
//         >
//           <MenuItem value="">None</MenuItem>
//           <MenuItem value="header">Header Section</MenuItem>
//           <MenuItem value="content">Content Section</MenuItem>
//           <MenuItem value="footer">Footer Section</MenuItem>
//           <MenuItem value="hero">Hero Section</MenuItem>
//           <MenuItem value="card">Card Container</MenuItem>
//           <MenuItem value="wrapper">Content Wrapper</MenuItem>
//           <MenuItem value="highlight">Highlight Box</MenuItem>
//         </Select>
//       </FormControl>

//       <MultiStylePropertyPanel
//         names={["backgroundColor", "borderColor", "borderRadius", "padding"]}
//         value={(data as any).style}
//         onChange={(style) => updateData({ ...data, style })}
//       />
//     </BaseSidebarPanel>
//   )
// }
import React, { useState } from "react"
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material"
import { z } from "zod"

import ContainerPropsSchema, {
  ContainerProps,
} from "../../../../documents/blocks/Container/ContainerPropsSchema"
import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel"

type ContainerSidebarPanelProps = {
  data: ContainerProps
  setData: (v: ContainerProps) => void
}

const basePropsObj = (
  ContainerPropsSchema.shape.props as z.ZodNullable<
    z.ZodOptional<z.ZodObject<any>>
  >
)
  .unwrap() // remove Nullable
  .unwrap() // remove Optional

const ExtendedContainerPropsSchema = ContainerPropsSchema.extend({
  props: basePropsObj
    .extend({
      purpose: z.string().optional().nullable(),
      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export default function ContainerSidebarPanel({
  data,
  setData,
}: ContainerSidebarPanelProps) {
  const [, setErrors] = useState<unknown | null>(null)

  const updateData = (d: unknown) => {
    const res = ExtendedContainerPropsSchema.safeParse(d)
    if (res.success) {
      const currentPosition = (data.props as any)?.position || { x: 50, y: 50 }

      setData({
        ...(res.data as any),
        props: {
          ...(res.data as any).props,
          position: currentPosition, // KEEP POSITION
        },
      })
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  return (
    <BaseSidebarPanel title="Container block">
      {/* Add Purpose Selection */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Container Purpose</InputLabel>
        <Select
          value={(data.props as any)?.purpose || ""}
          label="Container Purpose"
          onChange={(e: any) =>
            updateData({
              ...data,
              props: { ...(data as any).props, purpose: e.target.value },
            })
          }
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="header">Header Section</MenuItem>
          <MenuItem value="content">Content Section</MenuItem>
          <MenuItem value="footer">Footer Section</MenuItem>
          <MenuItem value="hero">Hero Section</MenuItem>
          <MenuItem value="card">Card Container</MenuItem>
          <MenuItem value="wrapper">Content Wrapper</MenuItem>
          <MenuItem value="highlight">Highlight Box</MenuItem>
        </Select>
      </FormControl>

      {/* Width and Height Inputs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Width (px)"
            type="number"
            value={
              (data.props as any)?.width || (data.style as any)?.width || ""
            }
            onChange={(e: any) => {
              const value =
                e.target.value === "" ? null : parseInt(e.target.value)
              updateData({
                ...data,
                props: { ...(data as any).props, width: value },
              })
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Height (px)"
            type="number"
            value={
              (data.props as any)?.height || (data.style as any)?.height || ""
            }
            onChange={(e: any) => {
              const value =
                e.target.value === "" ? null : parseInt(e.target.value)
              updateData({
                ...data,
                props: { ...(data as any).props, height: value },
              })
            }}
          />
        </div>
      </div>

      <MultiStylePropertyPanel
        names={[
          "backgroundColor",
          "borderColor",
          "borderRadius",
          "padding",
          "width",
          "height",
        ]}
        value={(data as any).style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  )
}
