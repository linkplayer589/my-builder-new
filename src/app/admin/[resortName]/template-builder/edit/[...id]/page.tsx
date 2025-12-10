"use client"

import EditTemplatePanel from "@/features/email-template-builder/App/TemplatePanel/EditTemplatePanel"
import DndContext from "@/features/email-template-builder/documents/editor/DndContext"
import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import theme from "tailwindcss/defaultTheme"

export default function TemplateBuilder() {
  return (
    <ThemeProvider theme={theme}>
      <DndContext>
        <CssBaseline />
        <EditTemplatePanel />
      </DndContext>
    </ThemeProvider>
  )
}
