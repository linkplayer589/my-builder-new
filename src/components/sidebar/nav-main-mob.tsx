"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { CreateNewOrderSheet } from "@/features/create-new-order/create-new-order-components/create-new-order-sheet"
import { OrderSearchDialog } from "@/features/order-search-mob/order-search-components/order-search-dialog"
import { OrderSearchDialog as OrderSearchDialogComponent } from "@/features/order-search/order-search-components/order-search-dialog"
import { useResort } from "@/features/resorts"
import { TroubleshooterMain } from "@/features/troubleshooter"
import {
  FileText,
  Menu,
  Monitor,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Undo2,
  Wrench,
} from "lucide-react"

import { sidebarConfig } from "@/config/sidebar-config"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSidebar } from "@/components/ui/sidebar"

import { NavMain } from "./nav-main"

export function NavMainMob() {
  const { activeResort } = useResort()
  const [showNavMain, setShowNavMain] = React.useState(false)
  const [showSearchDialog, setShowSearchDialog] = React.useState(false)
  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()

  // Ensure mobile behavior is enforced
  React.useEffect(() => {
    // PostHog logging for mobile navigation usage
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('mobile_nav_loaded', {
        active_resort: activeResort?.name,
        location: 'nav_main_mob'
      })
    }
  }, [activeResort])

  // Toggle showing full NavMain
  const toggleNavMain = () => setShowNavMain((prev) => !prev)

  // Handle Orders button click
  const handleOrdersClick = () => {
    const ordersUrl = `/admin/${activeResort?.name.toLowerCase().replace(/\s+/g, "-")}/orders`
    if (pathname === ordersUrl) {
      // Already on orders page, close sidebar
      toggleSidebar()
    } else {
      // Navigate to orders page
      router.push(ordersUrl)
    }
  }

  if (showNavMain) {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Main Navigation</h2>
          <Button variant="outline" onClick={toggleNavMain}>
            Close
          </Button>
        </div>
        <NavMain items={sidebarConfig.navMain} />
      </div>
    )
  }

  return (
    <div className="mobile-sidebar-content flex h-full flex-col justify-center px-4 py-6">
      {/* Button to toggle NavMain - Enhanced styling */}
      <div className="mb-6 flex justify-center">
        <Button
          onClick={toggleNavMain}
          className="mobile-nav-button flex h-20 w-full max-w-sm flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl active:scale-95 sm:h-24 sm:gap-2 sm:py-4 sm:text-lg"
        >
          <Menu className="size-6 sm:size-7" />
          <span>Show Main Navigation</span>
        </Button>
      </div>

      {/* Rearranged mobile UI layout with improved spacing */}
      <div className="mobile-nav-container flex w-full flex-row flex-wrap justify-center gap-3 sm:gap-6">
        {/* Row 1: Troubleshoot & Orders side by side */}
        {/* Troubleshoot Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="mobile-nav-button flex h-16 w-[45%] flex-col items-center gap-1 rounded-lg border-2 border-red-600 bg-red-500 py-2 text-sm text-white hover:bg-red-600 hover:text-white sm:h-20 sm:gap-2 sm:py-4 sm:text-base"
            >
              <Wrench className="size-5 sm:size-6" />
              <span>Troubleshoot</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto">

            <TroubleshooterMain />
          </SheetContent>
        </Sheet>

        {/* Orders Button */}
        <Button
          size="sm"
          className="mobile-nav-button flex h-16 w-[45%] flex-col items-center gap-1 rounded-lg border-2 border-purple-600 bg-purple-500 py-2 text-sm text-white transition-colors hover:bg-purple-600 hover:text-white sm:h-20 sm:gap-2 sm:py-4 sm:text-base"
          onClick={handleOrdersClick}
        >
          <FileText className="size-5 sm:size-6" />
          <span>Orders</span>
        </Button>

        {/* Row 2: Swap & Access Kiosk side by side */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="mobile-nav-button flex h-16 w-[45%] flex-col items-center gap-1 rounded-lg border-2 border-orange-600 bg-orange-500 py-2 text-sm text-white hover:bg-orange-600 hover:text-white sm:h-20 sm:gap-2 sm:py-4 sm:text-base"
            >
              <RefreshCw className="size-5 sm:size-6" />
              <span>Swap</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex h-full w-full flex-col overflow-hidden p-0">
            <div className="shrink-0 px-6 pt-6">
              <SheetTitle>Swap Pass</SheetTitle>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pt-4">
              <OrderSearchDialog isSwap={true} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Access Kiosk Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="mobile-nav-button flex h-16 w-[45%] flex-col items-center gap-1 rounded-lg border-2 border-indigo-600 bg-indigo-500 py-2 text-sm text-white hover:bg-indigo-600 hover:text-white sm:h-20 sm:gap-2 sm:py-4 sm:text-base"
            >
              <Monitor className="size-5 sm:size-6" />
              <span>Access Kiosk</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-full">
            <SheetTitle>Access Kiosk Fullscreen</SheetTitle>
          </SheetContent>
        </Sheet>

        {/* Row 3: Inventory Management spanning 2 cols */}
        {/* Inventory Management Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="mobile-nav-button flex h-16 w-full flex-col items-center gap-1 rounded-lg border-2 border-teal-600 bg-teal-500 py-2 text-sm text-white hover:bg-teal-600 hover:text-white sm:h-20 sm:gap-2 sm:py-4 sm:text-base"
            >
              <Package className="size-5 sm:size-6" />
              <span>Inventory Management</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-full">
            <SheetTitle>Inventory Management Fullscreen</SheetTitle>
          </SheetContent>
        </Sheet>

        {/* Row 4: Return & Rent side by side */}
        {/* Return Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="mobile-nav-button flex h-16 w-[45%] flex-col items-center gap-1 rounded-lg border-2 border-blue-600 bg-blue-500 py-2 text-sm text-white hover:bg-blue-600 hover:text-white sm:h-20 sm:gap-2 sm:py-4 sm:text-base"
            >
              <Undo2 className="size-5 sm:size-6" />
              <span>Return</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex h-full w-full flex-col overflow-hidden p-0">
            <div className="shrink-0 px-6 pt-6">
              <SheetTitle>Return</SheetTitle>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pt-4">
              <OrderSearchDialog />
            </div>
          </SheetContent>
        </Sheet>

        {/* Rent Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="sm"
              className="mobile-nav-button flex h-16 w-[45%] flex-col items-center gap-1 rounded-lg border-2 border-green-600 bg-green-500 py-2 text-sm text-white hover:bg-green-600 hover:text-white sm:h-20 sm:gap-2 sm:py-4 sm:text-base"
              variant="outline"
            >
              <ShoppingCart className="size-5 sm:size-6" />
              <span>Rent</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col gap-6 overflow-y-scroll">
            <CreateNewOrderSheet />
          </SheetContent>
        </Sheet>

        {/* Row 5: Search spanning 2 cols */}
        {/* Enhanced Order Search Button with consistent sizing */}
        <Button
          variant="outline"
          className="mobile-nav-button flex h-16 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-gray-600 bg-gray-500 py-2 text-sm font-medium text-white hover:bg-gray-600 hover:text-white sm:h-20 sm:gap-2 sm:py-4 sm:text-base"
          onClick={() => setShowSearchDialog(true)}
        >
          <Search className="size-5 sm:size-6" />
          <span>Search Orders</span>
        </Button>
      </div>

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-h-[90vh] sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Search Orders</DialogTitle>
          </DialogHeader>
          <OrderSearchDialogComponent />
        </DialogContent>
      </Dialog>
    </div>
  )
}
