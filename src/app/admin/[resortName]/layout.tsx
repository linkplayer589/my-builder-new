import React from "react"
import { validateResortAccess } from "@/features/resorts/resort-utils"
import { SignedIn } from "@clerk/nextjs"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"

interface ResortLayoutProps {
  children: React.ReactNode
  params: Promise<{ resortName: string }>
}

export default async function ResortLayout({
  children,
  params,
}: ResortLayoutProps) {
  const resolvedParams = await params
  // Validate resort access at the layout level
  await validateResortAccess(resolvedParams.resortName)

  return (
    <SignedIn>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-screen w-full overflow-x-auto">
          <div className="container mx-auto max-w-full px-4 py-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SignedIn>
  )
}
