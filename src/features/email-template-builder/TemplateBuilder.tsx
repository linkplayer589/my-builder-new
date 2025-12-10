"use client"

import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"

import App from "./App/index"
import DndContext from "./documents/editor/DndContext"
import theme from "./theme"

export default function TemplateBuilder() {
  return (
    <ThemeProvider theme={theme}>
      <DndContext>
        <CssBaseline />
        <App />
      </DndContext>
    </ThemeProvider>
  )
}
