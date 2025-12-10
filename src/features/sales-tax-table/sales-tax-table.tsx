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
import { toast } from "sonner"

import { TableFilterSortWrapper, exportTableToCSV } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ordersTableToggleTestOrderAction } from "@/features/orders-table/orders-table-actions/orders-table-toggle-test-order-action"

import { type ReconciliationItem } from "./_actions/db-get-sales-tax-data"
import { getSalesTaxTableColumns } from "./sales-tax-table-columns"
import { SalesTaxDataTable } from "./salestax-data-table"

interface SalesTaxTableProps {
  data: ReconciliationItem[]
  resortId: number
}

/**
 * Client-side sales tax table component
 *
 * @description
 * Displays order items with pricing information including skipass, lifepass rental,
 * and insurance breakdowns. Shows reconciliation status between internal and Skidata.
 * Uses client-side filtering, sorting, and pagination.
 */
export function SalesTaxTable({ data, resortId }: SalesTaxTableProps) {
  const router = useRouter()

  // State hook for handling mobile viewport
  const [isMobile, setIsMobile] = React.useState(false)

  const handleRevalidate = React.useCallback(async () => {
    router.refresh()
  }, [router])

  // Hook to handle window resizing
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  /**
   * Handle toggling test order status
   */
  const handleToggleTestOrder = React.useCallback(async (orderId: number) => {
    try {
      const result = await ordersTableToggleTestOrderAction(orderId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error toggling test order:", error)
      toast.error("Failed to toggle test order")
    }
  }, [router])

  // Use useMemo to memoize the column definitions
  const columns = React.useMemo(() => {
    return getSalesTaxTableColumns({
      resortId,
      isMobile,
      onToggleTestOrder: handleToggleTestOrder,
    })
  }, [isMobile, resortId, handleToggleTestOrder])

  const filterFields: DataTableAdvancedFilterField<ReconciliationItem>[] = [
    {
      id: "reconciliationStatus",
      label: "Reconciliation Status",
      type: "text",
    },
    { id: "orderId", label: "Order ID", type: "number" },
    { id: "productId", label: "Product ID", type: "text" },
    { id: "productName", label: "Product Name", type: "text" },
    { id: "consumerCategoryId", label: "Consumer Category ID", type: "text" },
    { id: "consumerCategoryName", label: "Consumer Category Name", type: "text" },
    { id: "salesChannel", label: "Sales Channel", type: "text" },
    { id: "skipassTotal", label: "Skipass Price", type: "number" },
    { id: "lifepassRentalTotal", label: "Lifepass Price", type: "number" },
    { id: "insuranceTotal", label: "Insurance Price", type: "number" },
    { id: "totalPrice", label: "Total Price", type: "number" },
    { id: "lifepassDeviceId", label: "Lifepass Device ID", type: "text" },
    { id: "skidataDeviceSerial", label: "Skidata Serial", type: "text" },
    { id: "hasInsurance", label: "Has Insurance", type: "boolean" },
  ]

  const table = useReactTable({
    data,
    columns: columns as ColumnDef<ReconciliationItem, unknown>[],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: "reconciliationStatus", desc: false }],
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <SalesTaxDataTable table={table}>
      <div
        className={`flex w-full ${isMobile ? "flex-col" : "flex-row"} items-center justify-end gap-4`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportTableToCSV(table, {
              filename: "sales-tax-report",
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
    </SalesTaxDataTable>
  )
}
