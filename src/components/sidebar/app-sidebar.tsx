"use client"

import * as React from "react"
import { useResort } from "@/features/resorts"
import { ResortSwitcher } from "@/features/resorts/resort-components/resort-switcher"
import { useUser } from "@clerk/nextjs"
import { X } from "lucide-react"

import { sidebarConfig } from "@/config/sidebar-config"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

import { NavMain } from "./nav-main"
import { NavMainMob } from "./nav-main-mob"
import { NavUser } from "./nav-user"

// This is sample data.

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onClose?: () => void
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { toggleSidebar } = useSidebar()
  const { user } = useUser()
  const { resorts } = useResort()
  const isMobile = useIsMobile()
  
  // Update the data object with the user's email
  React.useEffect(() => {
    if (user?.emailAddresses[0]?.emailAddress) {
      sidebarConfig.user.email = user.emailAddresses[0].emailAddress
    }
  }, [user])

  return (
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "icon"} 
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <ResortSwitcher resorts={resorts ?? []} />
          <button
            aria-label="Close Sidebar"
            onClick={() => toggleSidebar()}
            className="block rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isMobile ? <NavMainMob /> : <NavMain items={sidebarConfig.navMain} />}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarConfig.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
