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
import { DataTablePagination } from "@/components/data-table"
import { Button } from "@/components/ui/button"

import { type TicketItem } from "@/features/skidata-table/_types/skidata"
import { LifePassDataTable } from "./lifepass-data-table"
import { getLifepassTableColumns } from "./lifepass-table-columns"

interface LifepassTableProps {
  data: TicketItem[]
  resortId: number
}

/**
 * Client-side lifepass table component
 *
 * @description
 * Displays Skidata ticket items (devices/lifepasses) in a table format.
 * Uses client-side filtering, sorting, and pagination.
 */
export function LifepassTable({ data, resortId }: LifepassTableProps) {
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
    return getLifepassTableColumns(resortId, isMobile)
  }, [isMobile, resortId])

  const filterFields: DataTableAdvancedFilterField<TicketItem>[] = [
    { id: "orderId", label: "Order ID", type: "number" },
    { id: "skidataOrderId", label: "SkiData Order ID", type: "text" },
    { id: "skidataOrderItemId", label: "SkiData Order Item ID", type: "text" },
    {
      id: "skidataOrderItemStatus",
      label: "Order Status",
      type: "text",
    },
    {
      id: "skidataConfirmationNumber",
      label: "Confirmation Number",
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
      label: "Price",
      type: "number",
    },
    { id: "ticketItemIds", label: "Ticket Item IDs", type: "text" },
    { id: "skipassDTAs", label: "DTA Numbers", type: "text" },
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
      sorting: [{ id: "date", desc: true }],
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <LifePassDataTable table={table}>
      <div
        className={`flex w-full ${isMobile ? "flex-col" : "flex-row"} items-center justify-end gap-4`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportTableToCSV(table, {
              filename: "lifepasses-report",
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
    </LifePassDataTable>
  )
}
