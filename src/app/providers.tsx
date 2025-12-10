// app/providers.js
"use client"

import { type Resort } from "@/db/schema"
import { ResortProvider } from "@/features/resorts"
import { Toaster } from "sonner"

interface ProvidersProps {
  children: React.ReactNode
  initialResorts?: Resort[]
}

export function Providers({ children, initialResorts }: ProvidersProps) {
  return (
    <ResortProvider initialResorts={initialResorts}>
      {children}
      <Toaster position="bottom-right" />
    </ResortProvider>
  )
}
