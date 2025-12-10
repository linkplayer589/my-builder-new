"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type DataTableAdvancedFilterField } from "@/types"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { Download } from "lucide-react"

import { TableFilterSortWrapper, exportTableToCSV } from "@/components/data-table"
import { Button } from "@/components/ui/button"

import { type TicketItem } from "./_types/skidata"
import { SkiDataDataTable } from "./skidata-data-table"
import { getSkidataTableColumns } from "./skidata-table-columns"

interface SkiDataTableProps {
  data: TicketItem[]
  resortId: number
}

export function SkiDataTable({ data, resortId }: SkiDataTableProps) {
  const router = useRouter()

  // State hook for handling mobile viewport
  const [isMobile, setIsMobile] = React.useState(false)

  const handleRevalidate = React.useCallback(async () => {
    router.refresh()
  }, [router])

  // Hook to handle window resizing
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768) // Set to true for mobile devices
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Use useMemo to memoize the column definitions
  const columns = React.useMemo(() => {
    return getSkidataTableColumns(resortId, isMobile) // Pass down resortId and isMobile to columns
  }, [isMobile, resortId]) // Recompute when isMobile or resortId changes

  const filterFields: DataTableAdvancedFilterField<TicketItem>[] = [
    { id: "orderId", label: "Order ID", type: "text" },
    { id: "skidataOrderId", label: "SkiData Order ID", type: "text" },
    { id: "skidataOrderItemId", label: "SkiData Order Item ID", type: "text" },
    {
      id: "skidataOrderItemStatus",
      label: "SkiData Order Item Status",
      type: "text",
    },
    {
      id: "skidataConfirmationNumber",
      label: "SkiData Confirmation Number",
      type: "text",
    },
    { id: "productId", label: "Product ID", type: "text" },
    { id: "productName", label: "Product Name", type: "text" },
    { id: "consumerCategoryId", label: "Consumer Category ID", type: "text" },
    {
      id: "consumerCategoryName",
      label: "Consumer Category Name",
      type: "text",
    },
    {
      id: "orderItemPriceGross",
      label: "Order Item Price Gross",
      type: "number",
    },
    { id: "ticketItemIds", label: "Ticket Item IDs", type: "text" },
    { id: "skipassDTAs", label: "Skipass DTAs", type: "text" },
    { id: "testOrder", label: "Test Order", type: "boolean" },
  ]

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<TicketItem, unknown>[],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "orderId", desc: true }],
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <SkiDataDataTable table={table}>
      <div
        className={`flex w-full ${isMobile ? "flex-col" : "flex-row"} items-center justify-end gap-4`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportTableToCSV(table, {
              filename: "skidata-report",
            })
          }
          className="gap-2"
        >
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </Button>
        <div>
          <TableFilterSortWrapper
            table={table}
            onUpdate={handleRevalidate}
            filterFields={filterFields}
          />
        </div>
      </div>
    </SkiDataDataTable>
  )
}
