"use client"

import { type ColumnDef } from "@tanstack/react-table"

import { RelativeDayBadge } from "@/components/ui/relative-day-badge"
import { DataTableColumnHeader } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"

import { type TicketItem } from "@/features/skidata-table/_types/skidata"

/**
 * Get lifepass table columns configuration
 *
 * @param _resortId - Resort ID (reserved for future actions)
 * @param isMobile - Whether to show mobile-optimized columns
 * @returns Column definitions for the table
 */
export function getLifepassTableColumns(
  _resortId: number,
  isMobile: boolean
): ColumnDef<TicketItem>[] {
  const columns: ColumnDef<TicketItem>[] = [
    {
      accessorKey: "orderId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order ID" />
      ),
      cell: ({ row }) => <div>{row.getValue("orderId") ?? "N/A"}</div>,
    },
    {
      accessorKey: "skipassDTAs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DTA Numbers" />
      ),
      cell: ({ row }) => {
        const dtas: string[] = row.getValue("skipassDTAs")
        return (
          <div className="max-w-[200px] font-mono text-sm">
            {dtas?.length > 0 ? dtas.join(", ") : "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "skidataConfirmationNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Confirmation #" />
      ),
      cell: ({ row }) => (
        <div className="font-mono">{row.getValue("skidataConfirmationNumber")}</div>
      ),
    },
    {
      accessorKey: "date",
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
      cell: ({ row }) => <div>{row.getValue("productName")}</div>,
    },
    {
      accessorKey: "consumerCategoryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => <div>{row.getValue("consumerCategoryName")}</div>,
    },
    {
      accessorKey: "orderItemPriceGross",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <div>€{Number(row.getValue("orderItemPriceGross")).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "skidataOrderItemStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      enableColumnFilter: true,
      cell: ({ row }) => {
        const status = row.getValue("skidataOrderItemStatus") as string
        return (
          <Badge
            variant={
              status === "CanceledAndTransferred"
                ? "destructive"
                : status === "BookedAndTransferred"
                  ? "default"
                  : "secondary"
            }
            className="whitespace-nowrap"
          >
            {status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value
      },
    },
    {
      accessorKey: "testOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Test" />
      ),
      cell: ({ row }) => (
        <div>
          {row.getValue("testOrder") ? (
            <Badge variant="outline">Test</Badge>
          ) : (
            <Badge variant="secondary">Live</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "ticketItemIds",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ticket IDs" />
      ),
      cell: ({ row }) => {
        const ticketItemIds: string[] = row.getValue("ticketItemIds")
        return (
          <div className="max-w-[150px] truncate font-mono text-xs">
            {ticketItemIds?.join(", ") || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "skidataOrderId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Skidata Order" />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap font-mono text-xs">
          {row.getValue("skidataOrderId")}
        </div>
      ),
    },
  ]

  // On mobile, show only essential columns
  return isMobile
    ? columns.filter((column, index) => index === 0 || index === 1 || index === 7)
    : columns
}
