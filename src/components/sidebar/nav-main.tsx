"use client"

import { CreateNewOrderSheet } from "@/features/create-new-order/create-new-order-components/create-new-order-sheet"
import { OrderSearchDialog as OrderSearchDialogComponent } from "@/features/order-search/order-search-components/order-search-dialog"
import { OrderSearchDialog } from "@/features/order-search-mob/order-search-components/order-search-dialog"
import { useResort } from "@/features/resorts"
import { TroubleshooterMain } from "@/features/troubleshooter"
import { ChevronRight, FileText, Monitor, Package, RefreshCw, Search, ShoppingCart, Undo2, Wrench, type LucideIcon } from "lucide-react"

import * as React from "react"
import { useAllSidebarSheets } from "@/hooks/use-sidebar-sheet-state"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const { activeResort } = useResort()
  const { state } = useSidebar()

  // Use URL-based sheet state management
  const { sheets } = useAllSidebarSheets()
  const resortPrefix = activeResort
    ? `/${activeResort.name.toLowerCase().replace(/\s+/g, "-")}`
    : ""

  const updatedItems = items.map((item) => ({
    ...item,
    url: `/admin${resortPrefix}${item.url}`,
    items: item.items?.map((subItem) => ({
      ...subItem,
      url: `/admin${resortPrefix}${subItem.url}`,
    })),
  }))

  // Quick actions data for collapsed sidebar
  const quickActions = [
    {
      icon: ShoppingCart,
      label: "Rent",
      color: "bg-green-500 hover:bg-green-600",
      tooltipColor: "bg-green-500",
      action: sheets.rent.openSheet,
    },
    {
      icon: Undo2,
      label: "Return",
      color: "bg-blue-500 hover:bg-blue-600",
      tooltipColor: "bg-blue-500",
      action: sheets.return.openSheet,
    },
    {
      icon: RefreshCw,
      label: "Swap",
      color: "bg-orange-500 hover:bg-orange-600",
      tooltipColor: "bg-orange-500",
      action: sheets.swap.openSheet,
    },
    {
      icon: FileText,
      label: "Orders",
      color: "bg-purple-500 hover:bg-purple-600",
      tooltipColor: "bg-purple-500",
      action: () => {
        window.location.href = `/admin${resortPrefix}/orders`
      },
    },
    {
      icon: Wrench,
      label: "Troubleshoot",
      color: "bg-red-500 hover:bg-red-600",
      tooltipColor: "bg-red-500",
      action: sheets.troubleshoot.openSheet,
    },
    {
      icon: Monitor,
      label: "Access Kiosk",
      color: "bg-indigo-500 hover:bg-indigo-600",
      tooltipColor: "bg-indigo-500",
      action: sheets.accessKiosk.openSheet,
    },
    {
      icon: Package,
      label: "Inventory Management",
      color: "bg-teal-500 hover:bg-teal-600",
      tooltipColor: "bg-teal-500",
      action: sheets.inventory.openSheet,
    },
  ]

  // Show collapsed view when sidebar is collapsed
  if (state === "collapsed") {
    return (
      <TooltipProvider>
        <SidebarGroup className="flex h-full flex-col">
          <div className="flex flex-1 flex-col items-center space-y-2 py-4">
            {/* Main Navigation Icons */}
            {updatedItems.map((item) => (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="size-8 p-0 sm:size-10"
                    asChild
                  >
                    <a href={item.url}>
                      {item.icon && <item.icon className="size-3 sm:size-4" />}
                    </a>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-sidebar-foreground text-sidebar-foreground">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Separator */}
            <div className="my-2 h-px w-8 bg-border" />

            {/* Quick Action Icons */}
            {quickActions.map((action) => (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className={`size-8 p-0 ${action.color} sm:size-10`}
                    onClick={action.action}
                  >
                    <action.icon className="size-3 sm:size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className={`${action.tooltipColor} border-0 text-white`}>
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Search Icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="size-8 bg-gray-500 p-0 hover:bg-gray-600 sm:size-10"
                  onClick={sheets.search.openSheet}
                >
                  <Search className="size-3 sm:size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="border-0 bg-gray-500 text-white">
                <p>Search Orders</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* All Sheets and Dialogs for collapsed sidebar */}
          {/* Search Dialog */}
          <Dialog open={sheets.search.isOpen} onOpenChange={(open) => open ? sheets.search.openSheet() : sheets.search.closeSheet()}>
            <DialogContent className="max-h-[90vh] sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Search Orders</DialogTitle>
              </DialogHeader>
              <OrderSearchDialogComponent />
            </DialogContent>
          </Dialog>

          {/* Rent Sheet */}
          <Sheet open={sheets.rent.isOpen} onOpenChange={(open) => open ? sheets.rent.openSheet() : sheets.rent.closeSheet()}>
            <SheetContent className="flex w-full flex-col gap-6 overflow-y-scroll">
              <CreateNewOrderSheet />
            </SheetContent>
          </Sheet>

          {/* Return Sheet */}
          <Sheet open={sheets.return.isOpen} onOpenChange={(open) => open ? sheets.return.openSheet() : sheets.return.closeSheet()}>
            <SheetContent className="flex h-full w-full flex-col overflow-hidden p-0">
              <SheetHeader className="shrink-0 px-6 pt-6">
                <SheetTitle>Return</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto pt-4">
                <OrderSearchDialog />
              </div>
            </SheetContent>
          </Sheet>

          {/* Swap Sheet */}
          <Sheet open={sheets.swap.isOpen} onOpenChange={(open) => open ? sheets.swap.openSheet() : sheets.swap.closeSheet()}>
            <SheetContent className="flex h-full w-full flex-col overflow-hidden p-0">
              <SheetHeader className="shrink-0 px-6 pt-6">
                <SheetTitle>Swap Pass</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto pt-4">
                <OrderSearchDialog isSwap={true} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Troubleshoot Sheet */}
          <Sheet open={sheets.troubleshoot.isOpen} onOpenChange={(open) => open ? sheets.troubleshoot.openSheet() : sheets.troubleshoot.closeSheet()}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-[50vw]">
              <SheetHeader>
                <SheetTitle>Troubleshoot</SheetTitle>
                <SheetDescription>
                  LifePass troubleshooting workflows
                </SheetDescription>
              </SheetHeader>
              <TroubleshooterMain />
            </SheetContent>
          </Sheet>

          {/* Access Kiosk Sheet */}
          <Sheet open={sheets.accessKiosk.isOpen} onOpenChange={(open) => open ? sheets.accessKiosk.openSheet() : sheets.accessKiosk.closeSheet()}>
            <SheetContent className="flex w-full">
              <SheetTitle>Access Kiosk</SheetTitle>
            </SheetContent>
          </Sheet>

          {/* Inventory Management Sheet */}
          <Sheet open={sheets.inventory.isOpen} onOpenChange={(open) => open ? sheets.inventory.openSheet() : sheets.inventory.closeSheet()}>
            <SheetContent className="flex w-full">
              <SheetTitle>Inventory Management</SheetTitle>
            </SheetContent>
          </Sheet>
        </SidebarGroup>
      </TooltipProvider>
    )
  }

  return (
    <SidebarGroup className="flex h-full flex-col">
      <div className="flex-1">
        <SidebarGroupLabel>Admin Center</SidebarGroupLabel>
        <SidebarMenu>
          {updatedItems.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </div>

      <div className="mt-auto space-y-3 px-4 pb-4">
        {/* Quick Actions Section */}
        <div className="space-y-2">
          <h4 className="text-center text-sm font-medium text-muted-foreground">Quick Actions</h4>

          {/* Row 1: Primary actions - Rent & Return */}
          <div className="grid grid-cols-2 gap-2">
            {/* Rent Button */}
            <Button
              size="sm"
              className="flex h-12 flex-col items-center gap-1 bg-green-500 text-xs hover:bg-green-600"
              onClick={sheets.rent.openSheet}
            >
              <ShoppingCart className="size-4" />
              <span>Rent</span>
            </Button>

            {/* Return Button */}
            <Button
              size="sm"
              variant="outline"
              className="flex h-12 flex-col items-center gap-1 border-blue-600 bg-blue-500 text-xs text-white hover:bg-blue-600 hover:text-white"
              onClick={sheets.return.openSheet}
            >
              <Undo2 className="size-4" />
              <span>Return</span>
            </Button>
          </div>

          {/* Row 2: Secondary actions - Swap & Orders */}
          <div className="grid grid-cols-2 gap-2">
            {/* Swap Button */}
            <Button
              size="sm"
              variant="outline"
              className="flex h-12 flex-col items-center gap-1 border-orange-600 bg-orange-500 text-xs text-white hover:bg-orange-600 hover:text-white"
              onClick={sheets.swap.openSheet}
            >
              <RefreshCw className="size-4" />
              <span>Swap</span>
            </Button>

            {/* Orders Button */}
            <Button
              size="sm"
              className="flex h-12 flex-col items-center gap-1 bg-purple-500 text-xs hover:bg-purple-600"
            >
              <a
                href={`/admin/${activeResort?.name.toLowerCase().replace(/\s+/g, "-")}/orders`}
                className="flex w-full flex-col items-center gap-1"
              >
                <FileText className="size-4" />
                <span>Orders</span>
              </a>
            </Button>
          </div>

          {/* Row 3: Management actions - Troubleshoot & Access Kiosk */}
          <div className="grid grid-cols-2 gap-2">
            {/* Troubleshoot Button */}
            <Button
              size="sm"
              variant="outline"
              className="flex h-12 flex-col items-center gap-1 border-red-600 bg-red-500 text-xs text-white hover:bg-red-600 hover:text-white"
              onClick={sheets.troubleshoot.openSheet}
            >
              <Wrench className="size-4" />
              <span>Troubleshoot</span>
            </Button>

            {/* Access Kiosk Button */}
            <Button
              size="sm"
              variant="outline"
              className="flex h-12 flex-col items-center gap-1 border-indigo-600 bg-indigo-500 text-xs text-white hover:bg-indigo-600 hover:text-white"
              onClick={sheets.accessKiosk.openSheet}
            >
              <Monitor className="size-4" />
              <span>Access Kiosk</span>
            </Button>
          </div>

          {/* Row 4: Inventory Management - Full width */}
          <Button
            size="sm"
            variant="outline"
            className="flex h-12 w-full flex-col items-center gap-1 border-teal-600 bg-teal-500 text-xs text-white hover:bg-teal-600 hover:text-white"
            onClick={sheets.inventory.openSheet}
          >
            <Package className="size-4" />
            <span>Inventory Management</span>
          </Button>

          {/* Search - Full width */}
          <Button
            variant="outline"
            className="flex h-12 w-full items-center justify-center gap-2 border-slate-500 bg-slate-600 text-white hover:bg-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            onClick={sheets.search.openSheet}
          >
            <Search className="size-4" />
            <span>Search Orders</span>
          </Button>

          {/* Rent Sheet */}
          <Sheet open={sheets.rent.isOpen} onOpenChange={(open) => open ? sheets.rent.openSheet() : sheets.rent.closeSheet()}>
            <SheetContent className="flex w-full flex-col gap-6 overflow-y-scroll">
              <CreateNewOrderSheet />
            </SheetContent>
          </Sheet>

          {/* Return Sheet */}
          <Sheet open={sheets.return.isOpen} onOpenChange={(open) => open ? sheets.return.openSheet() : sheets.return.closeSheet()}>
            <SheetContent className="flex h-full w-full flex-col overflow-hidden p-0">
              <SheetHeader className="shrink-0 px-6 pt-6">
                <SheetTitle>Return</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto pt-4">
                <OrderSearchDialog />
              </div>
            </SheetContent>
          </Sheet>

          {/* Swap Sheet */}
          <Sheet open={sheets.swap.isOpen} onOpenChange={(open) => open ? sheets.swap.openSheet() : sheets.swap.closeSheet()}>
            <SheetContent className="flex h-full w-full flex-col overflow-hidden p-0">
              <SheetHeader className="shrink-0 px-6 pt-6">
                <SheetTitle>Swap Pass</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto pt-4">
                <OrderSearchDialog isSwap={true} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Troubleshoot Sheet */}
          <Sheet open={sheets.troubleshoot.isOpen} onOpenChange={(open) => open ? sheets.troubleshoot.openSheet() : sheets.troubleshoot.closeSheet()}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-[50vw]">
              <SheetHeader>
                <SheetTitle>Troubleshoot</SheetTitle>
                <SheetDescription>
                  LifePass troubleshooting workflows
                </SheetDescription>
              </SheetHeader>
              <TroubleshooterMain />
            </SheetContent>
          </Sheet>

          {/* Access Kiosk Sheet */}
          <Sheet open={sheets.accessKiosk.isOpen} onOpenChange={(open) => open ? sheets.accessKiosk.openSheet() : sheets.accessKiosk.closeSheet()}>
            <SheetContent className="flex w-full">
              <SheetTitle>Access Kiosk</SheetTitle>
            </SheetContent>
          </Sheet>

          {/* Inventory Sheet */}
          <Sheet open={sheets.inventory.isOpen} onOpenChange={(open) => open ? sheets.inventory.openSheet() : sheets.inventory.closeSheet()}>
            <SheetContent className="flex w-full">
              <SheetTitle>Inventory Management</SheetTitle>
            </SheetContent>
          </Sheet>

          {/* Search Dialog */}
          <Dialog open={sheets.search.isOpen} onOpenChange={(open) => open ? sheets.search.openSheet() : sheets.search.closeSheet()}>
            <DialogContent className="max-h-[90vh] sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Search Orders</DialogTitle>
              </DialogHeader>
              <OrderSearchDialogComponent />
            </DialogContent>
          </Dialog>
        </div>
      </div>

    </SidebarGroup>
  )
}
