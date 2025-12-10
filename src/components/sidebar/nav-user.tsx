"use client"

import { SignOutButton, UserProfile } from "@clerk/nextjs"
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun, User, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
  }
}) {
  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)

  /**
   * Handles theme change and logs the event to PostHog
   * @param newTheme - The selected theme (light, dark, or system)
   */
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    // PostHog logging for theme change
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('theme_changed', {
        theme: newTheme,
        user_email: user.email,
        location: 'nav_user_dropdown'
      })
    }
  }

  /**
   * Handles profile dialog open/close and logs the event
   */
  const handleProfileToggle = (isOpen: boolean) => {
    setProfileOpen(isOpen)
    // PostHog logging for profile interaction
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('profile_dialog_toggled', {
        action: isOpen ? 'opened' : 'closed',
        user_email: user.email,
        location: 'nav_user_dropdown'
      })
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">MT</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">MT</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Profile Management */}
            <Dialog open={profileOpen} onOpenChange={handleProfileToggle}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <User className="mr-2 size-4" />
                  <span>Manage Profile</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                  <DialogDescription>
                    Manage your account settings and preferences
                  </DialogDescription>
                </DialogHeader>
                <UserProfile 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0"
                    }
                  }}
                >
                  <UserProfile.Page label="account" />
                </UserProfile>
              </DialogContent>
            </Dialog>

            {/* Theme Switcher */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="mr-2 size-4" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem 
                  onClick={() => handleThemeChange("light")}
                  className={theme === "light" ? "bg-accent" : ""}
                >
                  <Sun className="mr-2 size-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleThemeChange("dark")}
                  className={theme === "dark" ? "bg-accent" : ""}
                >
                  <Moon className="mr-2 size-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleThemeChange("system")}
                  className={theme === "system" ? "bg-accent" : ""}
                >
                  <Monitor className="mr-2 size-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            
            <DropdownMenuSeparator />
            
            {/* Sign Out */}
            <DropdownMenuItem>
              <SignOutButton>
                <div className="flex size-full items-center">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </div>
              </SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
