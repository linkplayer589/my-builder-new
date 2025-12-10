import * as React from "react"
import {
  flexRender,
  type Table as TanstackTable,
  type Row,
} from "@tanstack/react-table"

import { type ReconciliationItem } from "./_actions/db-get-sales-tax-data"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table"
import { cn } from "@/lib/utils"

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<ReconciliationItem>
  floatingBar?: React.ReactNode | null
  children?: React.ReactNode
}

/**
 * Sales Tax Data Table Component
 *
 * @description
 * Renders order data with price breakdowns in a table format with expandable rows.
 * Shows skipass, lifepass rental, and insurance pricing information.
 * Highlights reconciliation issues between internal and Skidata systems.
 */
export function SalesTaxDataTable({
  table,
  floatingBar = null,
  children,
  className,
  ...props
}: DataTableProps) {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768
      setIsMobile(isMobile)

      // If switching from mobile to desktop, close the expanded row
      if (!isMobile) {
        setExpandedRow(null)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const toggleRowExpansion = (rowId: string) => {
    if (isMobile) {
      setExpandedRow((prev) => (prev === rowId ? null : rowId))
    }
  }

  /**
   * Format camelCase keys to Title Case
   */
  function formatKey(key: string): string {
    const formattedKey = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)
  }

  /**
   * Render value based on type
   */
  function renderValue(key: string, value: unknown, _row: Row<ReconciliationItem>): React.ReactNode {
    const formattedKey = formatKey(key)

    // Skip rendering the skidataTicketItem object
    if (key === "skidataTicketItem") {
      return null
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <div
          className={`flex w-full p-1 ${
            isMobile
              ? "flex-col items-start gap-1"
              : "flex-row justify-between"
          }`}
        >
          <strong className="mr-2 shrink-0">{formattedKey}:</strong>
          <span className="grow font-mono text-sm text-left">
            {value.length > 0 ? value.join(", ") : "N/A"}
          </span>
        </div>
      )
    }

    // Handle price fields with formatting
    if (key.includes("Total") || key.includes("Price") || key.includes("Amount") || key.includes("Tax")) {
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        return (
          <div
            className={`flex w-full p-1 ${
              isMobile
                ? "flex-col items-start gap-1"
                : "flex-row justify-between"
            }`}
          >
            <strong className="mr-2 shrink-0">{formattedKey}:</strong>
            <span className="grow text-left font-semibold">€{numValue.toFixed(2)}</span>
          </div>
        )
      }
    }

    // Handle boolean values
    if (typeof value === "boolean") {
      return (
        <div
          className={`flex w-full p-1 ${
            isMobile
              ? "flex-col items-start gap-1"
              : "flex-row justify-between"
          }`}
        >
          <strong className="mr-2 shrink-0">{formattedKey}:</strong>
          <span className="grow text-left">{value ? "Yes" : "No"}</span>
        </div>
      )
    }

    // Handle reconciliation status
    if (key === "reconciliationStatus") {
      return (
        <div
          className={`flex w-full p-1 ${
            isMobile
              ? "flex-col items-start gap-1"
              : "flex-row justify-between"
          }`}
        >
          <strong className="mr-2 shrink-0">{formattedKey}:</strong>
          <span className={cn(
            "grow text-left font-semibold",
            value === "matched" && "text-green-600",
            value === "only-skidata" && "text-red-600",
            value === "missing-device" && "text-orange-600",
            value === "only-internal" && "text-yellow-600"
          )}>
            {value === "matched" ? "✓ Matched" :
             value === "only-skidata" ? "🚨 External (No orderId)" :
             value === "missing-device" ? "⚠️ Missing Device" :
             "📝 Internal Only"}
          </span>
        </div>
      )
    }

    return (
      <div
        className={`flex w-full p-1 ${
          isMobile
            ? "flex-col items-start gap-1"
            : "flex-row justify-between"
        }`}
      >
        <strong className="mr-2 shrink-0">{formattedKey}:</strong>
        <span className="grow text-left">{String(value ?? "N/A")}</span>
      </div>
    )
  }

  /**
   * Get row background color based on reconciliation status
   */
  function getRowClassName(row: Row<ReconciliationItem>): string {
    const status = row.original.reconciliationStatus
    if (status === "only-skidata") return "bg-red-100 hover:bg-red-200"
    if (status === "missing-device") return "bg-orange-50 hover:bg-orange-100"
    if (status === "only-internal") return "bg-yellow-50 hover:bg-yellow-100"
    return ""
  }

  return (
    <div className={className} {...props}>
      {children}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    onClick={() => toggleRowExpansion(row.id)}
                    className={cn("cursor-pointer", getRowClassName(row))}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Render expanded row */}
                  {expandedRow === row.id && (
                    <TableRow>
                      <TableCell colSpan={table.getAllColumns().length}>
                        <div className="bg-gray-50 p-4">
                          <div className="space-y-4">
                            {Object.entries(row.original)
                              .filter(([key]) => key !== "skidataTicketItem")
                              .map(([key, value]) => {
                                const rendered = renderValue(key, value, row)
                                if (!rendered) return null
                                return (
                                  <div
                                    key={key}
                                    className="mb-4 flex max-w-full flex-wrap justify-between overflow-hidden rounded-md border border-gray-300 p-4"
                                  >
                                    {rendered}
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}
