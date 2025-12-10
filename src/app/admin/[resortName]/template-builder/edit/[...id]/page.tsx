"use client"

import App from "@/features/email-template-builder/App"
import EditTemplatePanel from "@/features/email-template-builder/App/TemplatePanel/EditTemplatePanel"
import DndContext from "@/features/email-template-builder/documents/editor/DndContext"
import theme from "@/features/email-template-builder/theme"
import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"

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
