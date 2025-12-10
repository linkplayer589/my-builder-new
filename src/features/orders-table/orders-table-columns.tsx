import * as React from "react"
import { orders, type Order } from "@/db/schema"
import { ClickAndCollectButton } from "@/features/order-collect/order-collect-components/order-collect-button"
import { type ColumnDef } from "@tanstack/react-table"
import { ChevronDown, ChevronRight, MoreHorizontal, FlaskConical, StickyNote, AlertTriangle, CheckCircle2 } from "lucide-react"

import { type DataTableRowAction, type FilterableColumnMeta } from "@/types/index"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { DataTableColumnHeader } from "@/components/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { OrdersTableClientDialog } from "./orders-table-features/orders-table-client-dialog"
import { MythDialog } from "./orders-table-features/orders-table-myth-dialog"
import { OrdersTablePriceDialog } from "./orders-table-features/orders-table-price-dialog"
import {
  SkidataDialog,
  type SkidataDialogProps,
} from "./orders-table-features/orders-table-skidata-dialog"
import { SkidataAutoFetch } from "./orders-table-features/orders-table-skidata-dialog/orders-table-skidata-dialog-components/orders-table-skidata-auto-fetch"
import { getMythButtonStatus } from "./orders-table-utils/get-myth-button-status"
import { getSkidataButtonStatus } from "./orders-table-utils/get-skidata-button-status"
import { StripeDialog } from "./orders-table-features/orders-table-stripe-dialog"
import { type StripeInvoiceData } from "@/types/stripe-types"
import { getOrderStatusIcon, getPaymentStatusIcon } from "./orders-table-utils/get-status-icon"

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Order> | null>
  >
  isMobile: boolean
  resort? : string
  expandedRowId?: number | null
  setExpandedRowId?: (id: number) => void
  onToggleTestOrder?: (orderId: number) => void
  onOpenNotes?: (orderId: number, notes: unknown, defaultType?: "note" | "error") => void
  onToggleError?: (orderId: number) => void
  /** Whether bulk edit mode is enabled */
  bulkEditMode?: boolean
  /** Set of selected order IDs in bulk edit mode */
  selectedOrderIds?: Set<number>
  /** Toggle selection of an order in bulk edit mode */
  onToggleSelection?: (orderId: number) => void
  /** Select all orders on current page */
  onSelectAll?: () => void
  /** Whether all orders on current page are selected */
  allSelected?: boolean
}

export function getOrdersTableColumns({
  setRowAction: _setRowAction,
  isMobile,
  resort: _resort,
  expandedRowId = null,
  setExpandedRowId = () => {},
  onToggleTestOrder,
  onOpenNotes,
  onToggleError,
  bulkEditMode = false,
  selectedOrderIds = new Set(),
  onToggleSelection,
  onSelectAll,
  allSelected = false,
}: GetColumnsProps): ColumnDef<Order>[] {

  const columns: ColumnDef<Order>[] = [
    {
      id: "expand",
      header: () => {
        if (bulkEditMode) {
          return (
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => onSelectAll?.()}
              aria-label="Select all orders"
              className="ml-1"
            />
          )
        }
        return <span className="sr-only">Expand</span>
      },
      cell: ({ row }) => {
        if (bulkEditMode) {
          const isSelected = selectedOrderIds.has(row.original.id)
          return (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection?.(row.original.id)}
              aria-label={`Select order ${row.original.id}`}
              className="ml-1"
            />
          )
        }

        const isExpanded = expandedRowId === row.original.id

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setExpandedRowId(row.original.id)
            }}
            className="flex size-8 items-center justify-center p-0"
            aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
          >
            {isExpanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        )
      },
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" className="justify-center" />
      ),
      cell: ({ row }) => {
        // Check for resolved errors (error notes with resolution)
        const notes = Array.isArray(row.original.notes) ? row.original.notes as { type?: string; resolution?: unknown }[] : []
        const hasResolvedErrors = notes.some((n) => n.type === "error" && n.resolution)

        return (
          <div className="flex items-center justify-center gap-1">
            <span>{row.getValue("id")}</span>
            {row.original.testOrder && (
              <FlaskConical className="size-3 text-orange-500" title="Test Order" />
            )}
            {row.original.wasError && (
              <AlertTriangle className="size-3 text-destructive" title="Has Unresolved Error" />
            )}
            {!row.original.wasError && hasResolvedErrors && (
              <CheckCircle2 className="size-3 text-green-600" title="Errors Resolved" />
            )}
          </div>
        )
      },
      size: 70,
      meta: {
        filterable: true,
        filterType: "number",
        filterLabel: "Order ID",
        filterPlaceholder: "Enter order ID...",
      } as FilterableColumnMeta<Order>,
    },
    {
      accessorKey: "orderStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" className="justify-center" />
      ),
      cell: ({ row }) => {
        const orderStatus = orders.orderStatus.enumValues.find(
          (status) => status === row.original.orderStatus
        )
        if (!orderStatus) return null

        const IconComponent = getOrderStatusIcon(orderStatus) as React.ComponentType<{
          className: string
          "aria-hidden": boolean
        }>

        return (
          <div className="flex w-full flex-col items-center gap-1">
            <IconComponent
              className="size-5 text-muted-foreground"
              aria-hidden={true}
            />
            <span className="text-center text-xs capitalize leading-tight">{orderStatus.replace(/-/g, " ")}</span>
          </div>
        )
      },
      size: 110,
      meta: {
        filterable: true,
        filterType: "multi-select",
        filterLabel: "Status",
        filterOptions: [
          { label: "Ordered", value: "ordered" },
          { label: "Awaiting Collection", value: "awaiting-collection" },
          { label: "Order Active", value: "order-active" },
          { label: "Cancelled", value: "cancelled" },
          { label: "Cancelled & Refunded", value: "cancelled-refunded" },
          { label: "Order Complete", value: "order-complete" },
        ],
      } as FilterableColumnMeta<Order>,
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Paid" className="justify-center" />
      ),
      cell: ({ row }) => {
        const paymentStatus = orders.paymentStatus.enumValues.find(
          (status) => status === row.original.paymentStatus
        )
        if (!paymentStatus) return null

        const IconComponent = getPaymentStatusIcon(paymentStatus) as React.ComponentType<{
          className: string
          "aria-hidden": boolean
        }>

        // Determine icon color based on payment status
        const getIconColor = (status: string) => {
          if (status === "fully-paid") return "text-green-600"
          if (status.includes("failed") || status.includes("cancelled") || status.includes("expired")) return "text-red-500"
          if (status === "deposit-paid" || status === "partially-funded") return "text-yellow-500"
          return "text-muted-foreground"
        }

        return (
          <div className="flex w-full items-center justify-center" title={paymentStatus.replace(/-/g, " ")}>
            <IconComponent
              className={`size-5 ${getIconColor(paymentStatus)}`}
              aria-hidden={true}
            />
            <span className="sr-only">{paymentStatus.replace(/-/g, " ")}</span>
          </div>
        )
      },
      size: 70,
      meta: {
        filterable: true,
        filterType: "multi-select",
        filterLabel: "Paid",
        filterOptions: [
          { label: "Intent Payment Pending", value: "intent-payment-pending" },
          { label: "Payment Processing", value: "payment-processing" },
          { label: "Payment Requires Action", value: "payment-requires-action" },
          { label: "Payment Sent To Terminal", value: "payment-sent-to-terminal" },
          { label: "Deposit Paid", value: "deposit-paid" },
          { label: "Fully Paid", value: "fully-paid" },
          { label: "Payment Failed", value: "payment-failed" },
          { label: "Payment Cancelled", value: "payment-cancelled" },
          { label: "Payment Expired", value: "payment-expired" },
          { label: "Partially Funded", value: "partially-funded" },
          { label: "Capturable", value: "capturable" },
        ],
      } as FilterableColumnMeta<Order>,
    },
    {
      accessorKey: "clientDetails",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.clientDetails ? (
            <OrdersTableClientDialog clientDetails={row.original.clientDetails} />
          ) : (
            "N/A"
          )}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => {
        if (!row.original.orderDetails?.startDate) return "N/A"
        const startDate = new Date(row.original.orderDetails.startDate)

        return (
          <div className="flex flex-col gap-1">
            <span>{startDate.toISOString().split("T")[0]}</span>
            <RelativeDayBadge date={startDate} />
          </div>
        )
      },
    },
    {
      accessorKey: "mythOrderSubmissionData",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Myth Submitted" className="justify-center" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.mythOrderSubmissionData ? (
            <MythDialog
              mythOrderSubmissionData={row.original.mythOrderSubmissionData}
              buttonStatus={getMythButtonStatus(row.original)}
            />
          ) : (
            <span className="text-muted-foreground">Not Added</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "skidataOrderSubmissionData",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Skidata Details" className="justify-center" />
      ),
      cell: ({ row }) => {
        const initialStatus = getSkidataButtonStatus(row.original)

        return (
          <div className="flex justify-center">
            {row.original.skidataOrderSubmissionData ? (
              <SkidataAutoFetch
                order={row.original}
                skidataOrderSubmissionData={
                  row.original
                    .skidataOrderSubmissionData as SkidataDialogProps["skidataOrderSubmissionData"]
                }
                initialButtonStatus={initialStatus}
              />
            ) : (
              <span className="text-muted-foreground">Not Submitted</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "calculatedOrderPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Details" />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.calculatedOrderPrice && (
            <OrdersTablePriceDialog priceObject={row.original.calculatedOrderPrice} />
          )}
        </div>
      ),
    },
    {
      accessorKey: "salesChannel",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sales Channel" />
      ),
      cell: ({ row }) => {
        if (row.original.salesChannel === "click-and-collect") {
          return (
            <ClickAndCollectButton
              orderId={row.original.id}
              calculatedOrderPrice={row.original.calculatedOrderPrice}
              halfWidth={false}
              isCollected={row.original.orderStatus === 'order-active' ||
                row.original.orderStatus === 'order-complete' ||
                Boolean(row.original.mythOrderSubmissionData?.devices?.length) ||
                Boolean(row.original.skidataOrderSubmissionData)}
            />
          )
        }
        return <div>{row.original.salesChannel}</div>
      },
      filterFn: (row, id, value) =>
        Array.isArray(value) && value.includes(row.getValue(id)),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => {
        const date = new Date(cell.getValue() as Date).toISOString().split("T")
        return (
          <div>
            {date?.[0]} {date?.[1]?.slice(0, 5)}
          </div>
        )
      },
    },
    {
      accessorKey: "stripePaymentIntentId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stripe" />
      ),
      cell: ({ row }) => {
        const paymentIntentIds = row.original.stripePaymentIntentIds
        const invoiceId = row.original.stripeInvoiceId
        const invoiceDatas = row.original.stripeInvoiceDatas
        const transactionDatas = row.original.stripeTransactionDatas

        if (!paymentIntentIds?.length && !invoiceId) return null

        const paymentCount = paymentIntentIds?.length ?? 0

        return (
          <StripeDialog
            orderId={row.original.id}
            stripePaymentIntentIds={paymentIntentIds ?? undefined}
            stripeInvoiceId={invoiceId ?? undefined}
            stripeInvoiceDatas={(invoiceDatas as unknown as StripeInvoiceData[]) ?? undefined}
            stripeTransactionDatas={transactionDatas ?? undefined}
            stripePaymentIntentId={paymentIntentIds?.[0]}
            stripeTransactionData={transactionDatas?.[0] || null}
            buttonLabel={paymentCount > 0 ? `${paymentCount} payment${paymentCount > 1 ? 's' : ''}` : undefined}
          />
        )
      },
      size: 90,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const order = row.original
        const notes = Array.isArray(order.notes) ? order.notes as { type?: string }[] : []
        const noteCount = notes.filter((n) => (n.type || "note") === "note").length
        const errorCount = notes.filter((n) => n.type === "error").length
        const totalNotes = notes.length

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem
                onClick={() => onToggleTestOrder?.(order.id)}
                className="gap-2"
              >
                <FlaskConical className="size-4" />
                {order.testOrder ? "Mark as Live" : "Mark as Test"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onOpenNotes?.(order.id, order.notes, "note")}
                className="gap-2"
              >
                <StickyNote className="size-4" />
                {noteCount > 0 ? `Notes (${noteCount})` : "Add Note"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onOpenNotes?.(order.id, order.notes, "error")}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <AlertTriangle className="size-4" />
                {errorCount > 0 ? `Errors (${errorCount})` : "Add Error"}
              </DropdownMenuItem>
              {totalNotes > 0 && (
                <DropdownMenuItem
                  onClick={() => onOpenNotes?.(order.id, order.notes)}
                  className="gap-2 text-muted-foreground"
                >
                  <StickyNote className="size-4" />
                  View All ({totalNotes})
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onToggleError?.(order.id)}
                className={order.wasError ? "gap-2 text-green-600 focus:text-green-600" : "gap-2 text-destructive focus:text-destructive"}
              >
                <AlertTriangle className="size-4" />
                {order.wasError ? "Clear Error Flag" : "Set Error Flag"}
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

  return isMobile
    ? columns.filter(
      (column, index) => index === 0 || (index >= 1 && index < 4) || index === columns.length - 2 || index === columns.length - 1
    ) // Show expand, id, orderStatus, paymentStatus, createdAt, and actions on mobile
    : columns
}
