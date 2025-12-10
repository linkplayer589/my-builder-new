"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { type Resort } from "@/db/schema"
import { ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useResort } from "../resort-context/ResortProvider"

export function ResortSwitcher({ resorts }: { resorts: Resort[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const { activeResort, setActiveResort } = useResort()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeResort ? (
                  activeResort.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                ) : (
                  <div className="size-4 animate-pulse rounded-full bg-sidebar-primary-foreground/50" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {activeResort ? (
                  <>
                    <span className="truncate font-semibold">
                      {activeResort.name}
                    </span>
                    <span className="truncate text-xs">
                      {activeResort.name === "Verbier"
                        ? "Test Resort"
                        : "Live Resort"}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    <div className="mt-1 h-3 w-16 animate-pulse rounded bg-muted" />
                  </>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Resorts
            </DropdownMenuLabel>
            {resorts.map((resort, index) => (
              <DropdownMenuItem
                key={resort.id}
                onClick={() => setActiveResort(resort)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {resort.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </div>
                {resort.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
