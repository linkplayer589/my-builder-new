"use client"

import * as React from "react"
import {
  flexRender,
  type Table as TanstackTable,
  type Row,
} from "@tanstack/react-table"
import type { DeviceHistory } from "@/db/schema"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<DeviceHistory>
  floatingBar?: React.ReactNode | null
  children?: React.ReactNode
}

/**
 * Device History Data Table Component
 * Displays device history entries with expandable rows for detailed information
 */
export function DeviceHistoryDataTable({
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
      const width = window.innerWidth
      const isMobile = width <= 768
      setIsMobile(isMobile)

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
   * Render value based on type and key
   */
  function renderValue(
    key: string,
    value: unknown,
    _row: Row<DeviceHistory>
  ): React.ReactNode {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return (
        <div className="flex w-full flex-col items-start justify-between">
          <strong>{formatKey(key)}:</strong>
          <span className="text-muted-foreground">—</span>
        </div>
      )
    }

    // Handle JSON eventDetails
    if (key === "eventDetails" && typeof value === "object") {
      return (
        <div className="flex w-full flex-col items-start justify-between">
          <strong>{formatKey(key)}:</strong>
          <pre className="mt-2 max-w-full overflow-x-auto rounded bg-muted p-2 text-xs">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      )
    }

    // Handle dates
    if (key.includes("At") || key.includes("Timestamp")) {
      const date = typeof value === "string" ? new Date(value) : value as Date
      return (
        <div className="flex w-full flex-col items-start justify-between">
          <strong>{formatKey(key)}:</strong>
          <div className="text-sm">
            {!isNaN(date.getTime())
              ? date.toISOString().replace("T", " ").slice(0, 19)
              : "Invalid Date"}
          </div>
        </div>
      )
    }

    // Handle status fields
    if (key.includes("Status") || key === "processingStatus") {
      const statusValue = typeof value === 'string' ? value : JSON.stringify(value)
      return (
        <div className="flex w-full flex-col items-start justify-between">
          <strong>{formatKey(key)}:</strong>
          <Badge variant="outline" className="mt-1 capitalize">
            {statusValue.replace(/_/g, " ")}
          </Badge>
        </div>
      )
    }

    // Default rendering
    const displayValue = typeof value === 'object' && value !== null 
      ? JSON.stringify(value, null, 2) 
      : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : 'N/A'
    
    return (
      <div className="flex w-full flex-col items-start justify-between">
        <strong>{formatKey(key)}:</strong>
        <div className="mt-1 break-words text-sm">{displayValue}</div>
      </div>
    )
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
                    className="cursor-pointer"
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

                  {/* Expanded row with full details */}
                  {expandedRow === row.id && (
                    <TableRow>
                      <TableCell colSpan={table.getAllColumns().length}>
                        <div className="overflow-x-auto bg-gray-50 p-4">
                          <div className="max-w-full space-y-4">
                            {Object.entries(row.original)
                              .filter(
                                ([, value]) =>
                                  value !== null && value !== undefined
                              )
                              .map(([key, value]) => (
                                <div
                                  key={key}
                                  className="mb-4 flex max-w-full flex-wrap justify-between break-words rounded-md border border-gray-300 p-4"
                                >
                                  {renderValue(key, value, row)}
                                </div>
                              ))}
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
                  className="h-24 text-center"
                >
                  No device history found.
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
