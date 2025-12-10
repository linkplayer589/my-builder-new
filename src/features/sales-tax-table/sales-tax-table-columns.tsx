"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { FlaskConical, MoreHorizontal } from "lucide-react"

import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { type ReconciliationItem } from "./_actions/db-get-sales-tax-data"

interface GetColumnsProps {
  resortId: number
  isMobile: boolean
  /** Callback to toggle an order's test status */
  onToggleTestOrder?: (orderId: number) => void
}

/**
 * Get sales tax table columns configuration
 *
 * @param props - Column configuration props
 * @param props.resortId - Resort ID (reserved for future actions)
 * @param props.isMobile - Whether to show mobile-optimized columns
 * @param props.onToggleTestOrder - Callback to toggle test order status
 * @returns Column definitions for the table
 */
export function getSalesTaxTableColumns({
  resortId: _resortId,
  isMobile,
  onToggleTestOrder,
}: GetColumnsProps): ColumnDef<ReconciliationItem>[] {
  const columns: ColumnDef<ReconciliationItem>[] = [
    {
      accessorKey: "reconciliationStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("reconciliationStatus") as ReconciliationItem["reconciliationStatus"]
        const hasOrderId = row.original.hasOrderId

        // Determine badge variant and text based on status
        let variant: "default" | "destructive" | "secondary" | "outline" = "secondary"
        let text = ""

        switch (status) {
          case "matched":
            variant = "default"
            text = "✓ Matched"
            break
          case "only-skidata":
            variant = "destructive"
            text = "🚨 External"
            break
          case "missing-device":
            variant = "outline"
            text = "⚠️ Missing Device"
            break
          case "only-internal":
            variant = "secondary"
            text = "📝 Internal Only"
            break
        }

        return (
          <div className="flex flex-col gap-1">
            <Badge variant={variant} className="whitespace-nowrap text-xs">
              {text}
            </Badge>
            {!hasOrderId && status === "only-skidata" && (
              <span className="text-[10px] text-red-600">No orderId!</span>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value
      },
    },
    {
      accessorKey: "orderId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order ID" />
      ),
      cell: ({ row }) => <div>{row.getValue("orderId") || "N/A"}</div>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ cell }) => {
        const dateValue = cell.getValue() as string
        if (!dateValue) return <div>N/A</div>

        const date = new Date(dateValue)
        const formattedDate = date.toISOString().split("T")

        return (
          <div className="flex items-center gap-1">
            <div>
              {formattedDate[0]} {formattedDate[1]?.slice(0, 5)}
            </div>
            <RelativeDayBadge date={date} />
          </div>
        )
      },
    },
    {
      accessorKey: "productName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
      cell: ({ row }) => {
        const productName = row.getValue("productName") as string
        const productId = row.original.productId
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help underline decoration-dotted">
                  {productName}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">ID: {productId}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: "consumerCategoryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const categoryName = row.getValue("consumerCategoryName") as string
        const categoryId = row.original.consumerCategoryId
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help underline decoration-dotted">
                  {categoryName}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">ID: {categoryId}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: "skipassTotal",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Skipass Price" />
      ),
      cell: ({ row }) => {
        const total = row.getValue("skipassTotal") as number
        const tax = row.original.skipassTaxAmount
        const status = row.original.reconciliationStatus

        // For skidata-only items, show the gross price from skidata
        if (status === "only-skidata") {
          return (
            <div className="text-right">
              <div className="font-semibold text-muted-foreground">
                €{total.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                (from Skidata)
              </div>
            </div>
          )
        }

        return (
          <div className="text-right">
            <div className="font-semibold">€{total.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Tax: €{tax.toFixed(2)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "lifepassRentalTotal",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lifepass Price" />
      ),
      cell: ({ row }) => {
        const total = row.getValue("lifepassRentalTotal") as number
        const tax = row.original.lifepassRentalTaxAmount
        const status = row.original.reconciliationStatus

        if (status === "only-skidata") {
          return (
            <div className="text-right text-muted-foreground">
              —
            </div>
          )
        }

        return (
          <div className="text-right">
            <div className="font-semibold">€{total.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Tax: €{tax.toFixed(2)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "insuranceTotal",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Insurance Price" />
      ),
      cell: ({ row }) => {
        const total = row.getValue("insuranceTotal") as number
        const tax = row.original.insuranceTaxAmount
        const hasInsurance = row.original.hasInsurance
        const status = row.original.reconciliationStatus

        if (status === "only-skidata" || !hasInsurance || total === 0) {
          return (
            <div className="text-right text-muted-foreground">
              —
            </div>
          )
        }

        return (
          <div className="text-right">
            <div className="font-semibold">€{total.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              Tax: €{tax.toFixed(2)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "totalPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-bold">
          €{Number(row.getValue("totalPrice")).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "salesChannel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Channel" />
      ),
      cell: ({ row }) => {
        const channel = row.getValue("salesChannel") as string
        return (
          <Badge variant="outline" className="whitespace-nowrap">
            {channel || "unknown"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "hasInsurance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Insurance" />
      ),
      cell: ({ row }) => (
        <div>
          {row.getValue("hasInsurance") ? (
            <Badge variant="default">Yes</Badge>
          ) : (
            <Badge variant="secondary">No</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "lifepassDeviceId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lifepass ID" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.getValue("lifepassDeviceId") ?? "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "skidataDeviceSerial",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Skidata Serial" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.getValue("skidataDeviceSerial") ?? "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const order = row.original
        const orderId = order.orderId
        const isTestOrder = order.testOrder

        // Don't show actions for external Skidata items (no orderId)
        if (!orderId || orderId === 0) {
          return null
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleTestOrder?.(orderId)
                }}
                className="gap-2"
              >
                <FlaskConical className="size-4" />
                {isTestOrder ? "Mark as Live" : "Mark as Test"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
  ]

  // On mobile, show only essential columns (Status, Order ID, Skipass, Total, Actions)
  if (isMobile) {
    return columns.filter((col) => {
      const id = col.id || (col as { accessorKey?: string }).accessorKey
      return (
        id === "reconciliationStatus" ||
        id === "orderId" ||
        id === "skipassTotal" ||
        id === "totalPrice" ||
        id === "actions"
      )
    })
  }

  return columns
}
