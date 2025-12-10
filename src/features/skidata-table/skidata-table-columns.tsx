import { type ColumnDef } from "@tanstack/react-table"
import { Ellipsis } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table"

import { cancelSkidataOrder } from "./_actions/cancel-skidata-order"
import { cancelTicketItem } from "./_actions/cancel-ticket-item"
import { revalidateSkidataExport } from "./_actions/revalidate-skidata-export"
import { type TicketItem } from "./_types/skidata"

export function getSkidataTableColumns(
  resortId: number,
  isMobile: boolean 
): ColumnDef<TicketItem>[] {
  const columns: ColumnDef<TicketItem>[] = [
    {
      accessorKey: "orderId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order ID" />
      ),
      cell: ({ row }) => <div>{row.getValue("orderId")}</div>,
    },
    {
      accessorKey: "skidataOrderId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Skidata Order ID" />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {row.getValue("skidataOrderId")}
        </div>
      ),
    },
    {
      accessorKey: "skidataConfirmationNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Confirmation #" />
      ),
      cell: ({ row }) => <div>{row.getValue("skidataConfirmationNumber")}</div>,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ cell }) => {
        const date = new Date(cell.getValue() as string)
          .toISOString()
          .split("T")
        return (
          <div>
            {date[0]} {date[1]?.slice(0, 5)}
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
      accessorKey: "testOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Test Order" />
      ),
      cell: ({ row }) => <div>{row.getValue("testOrder") ? "Yes" : "No"}</div>,
    },
    {
      accessorKey: "ticketItemIds",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ticket Item IDs" />
      ),
      cell: ({ row }) => {
        const ticketItemIds: string[] = row.getValue("ticketItemIds")
        return <div>{ticketItemIds?.join(", ") || "-"}</div>
      },
    },
    {
      accessorKey: "skipassDTAs",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DTA Numbers" />
      ),
      cell: ({ row }) => {
        const dtas: string[] = row.getValue("skipassDTAs")
        return <div>{dtas?.join(", ") || "-"}</div>
      },
    },
    {
      accessorKey: "skidataOrderItemStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order Status" />
      ),
      enableColumnFilter: true,
      cell: ({ row }) => {
        const status = row.getValue("skidataOrderItemStatus")
        return (
          <div
            className={
              status === "CanceledAndTransferred"
                ? "text-red-500"
                : status === "BookedAndTransferred"
                  ? "text-green-500"
                  : "text-yellow-500"
            }
          >
            {status as string}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value === "" || row.getValue(id) === value
      },
    },
    {
      id: "actions",
      enableHiding: false,
      maxSize: 40,
      cell: function Cell({ row }) {
        const handleCancelOrder = async () => {
          try {
            const result = await cancelSkidataOrder({
              resortId,
              skidataOrderId: row.original.skidataOrderId,
            })

            if (result.data) {
              toast.success("Order cancelled successfully")
              await revalidateSkidataExport()
            } else {
              toast.error(result.error ?? "Failed to cancel order")
            }
          } catch (error) {
            toast.error("An unexpected error occurred")
            console.error(error)
          }
        }

        const handleCancelTicketItem = async () => {
          try {
            const result = await cancelTicketItem({
              orderId: row.original.skidataOrderId,
              orderItemId: row.original.skidataOrderItemId,
              ticketItemIdList: row.original.ticketItemIds,
              cancelationDate: new Date().toISOString(),
              resortId: 123456789,
              productId: row.original.productId,
              consumerCategoryId: row.original.consumerCategoryId,
            })

            if (result.data) {
              toast.success("Ticket item cancelled successfully")
              await revalidateSkidataExport()
            } else {
              toast.error(result.error ?? "Failed to cancel ticket item")
            }
          } catch (error) {
            toast.error("An unexpected error occurred")
            console.error(error)
          }
        }

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                >
                  <Ellipsis className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto">
                <DropdownMenuItem
                  className="text-red-600"
                  onSelect={handleCancelOrder}
                  disabled={
                    row.original.skidataOrderItemStatus ===
                    "CanceledAndTransferred"
                  }
                >
                  Cancel Order
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onSelect={handleCancelTicketItem}
                  disabled={
                    row.original.skidataOrderItemStatus ===
                      "CanceledAndTransferred" ||
                    !row.original.ticketItemIds?.length
                  }
                >
                  Cancel Ticket Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return isMobile
    ? columns.filter((column, index) => index === 0 || index === 2) // Show first and fifth columns on mobile
    : columns
}
