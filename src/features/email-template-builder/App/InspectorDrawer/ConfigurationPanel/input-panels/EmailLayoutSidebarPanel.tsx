import React, { useEffect, useState } from "react"
import { RoundedCornerOutlined, WidthNormalOutlined } from "@mui/icons-material"

import EmailLayoutPropsSchema, {
  EmailLayoutProps,
} from "../../../../documents/blocks/EmailLayout/EmailLayoutPropsSchema"
import BaseSidebarPanel from "./helpers/BaseSidebarPanel"
import ColorInput, { NullableColorInput } from "./helpers/inputs/ColorInput"
import { NullableFontFamily } from "./helpers/inputs/FontFamily"
import SliderInput from "./helpers/inputs/SliderInput"

type EmailLayoutSidebarFieldsProps = {
  data: EmailLayoutProps
  setData: (v: EmailLayoutProps) => void
}
export default function EmailLayoutSidebarFields({
  data,
  setData,
}: EmailLayoutSidebarFieldsProps) {
  const [, setErrors] = useState<unknown | null>(null)
  // const [widthValue, setWidthValue] = useState(data.width ?? 600)

  console.log("data.width ========>", JSON.stringify(data.width))

  // // Update local state when data.width changes
  // useEffect(() => {
  //   if (data.width != null) {
  //     setWidthValue(data.width)
  //   }
  // }, [data.width])

  const updateData = (d: unknown) => {
    const res = EmailLayoutPropsSchema.safeParse(d)
    if (res.success) {
      setData(res.data)
      setErrors(null)
    } else {
      setErrors(res.error)
    }
  }

  // const handleWidthChange = (newWidth: number) => {
  //   setWidthValue(newWidth)
  //   updateData({ ...data, width: newWidth })
  // }

  return (
    <BaseSidebarPanel title="Global">
      <ColorInput
        label="Backdrop color"
        defaultValue={data.backdropColor ?? "#F5F5F5"}
        onChange={(backdropColor) => updateData({ ...data, backdropColor })}
      />
      <ColorInput
        label="Canvas color"
        defaultValue={data.canvasColor ?? "#FFFFFF"}
        onChange={(canvasColor) => updateData({ ...data, canvasColor })}
      />
      <NullableColorInput
        label="Canvas border color"
        defaultValue={data.borderColor ?? null}
        onChange={(borderColor) => updateData({ ...data, borderColor })}
      />
      <SliderInput
        iconLabel={<RoundedCornerOutlined />}
        units="px"
        step={4}
        marks
        min={0}
        max={48}
        label="Canvas border radius"
        defaultValue={data.borderRadius ?? 0}
        onChange={(borderRadius) => updateData({ ...data, borderRadius })}
      />

      <SliderInput
        iconLabel={<WidthNormalOutlined />}
        label="Width"
        units="px"
        step={1}
        marks
        min={400}
        max={800}
        defaultValue={data.width ?? 600}
        onChange={(width) => updateData({ ...data, width })}
      />

      <NullableFontFamily
        label="Font family"
        defaultValue="MODERN_SANS"
        onChange={(fontFamily) => updateData({ ...data, fontFamily })}
      />
      <ColorInput
        label="Text color"
        defaultValue={data.textColor ?? "#262626"}
        onChange={(textColor) => updateData({ ...data, textColor })}
      />
    </BaseSidebarPanel>
  )
}
