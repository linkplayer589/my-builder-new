"use client"

import * as React from "react"
import {
  flexRender,
  type Table as TanstackTable,
  type Row,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table"

/**
 * Universal Data Table Component
 * 
 * Handles all common table rendering functionality including:
 * - Header and body rendering
 * - Mobile card view support
 * - Desktop table view
 * - Pagination
 * - Custom mobile card rendering
 * - Floating bars for multi-select
 * 
 * @example Basic usage (auto-detects mobile)
 * ```tsx
 * <UniversalDataTable table={table} />
 * ```
 * 
 * @example With custom mobile card view
 * ```tsx
 * <UniversalDataTable
 *   table={table}
 *   renderMobileCard={(row) => <CustomCard row={row} />}
 * />
 * ```
 * 
 * @example With custom expanded row (legacy)
 * ```tsx
 * <UniversalDataTable
 *   table={table}
 *   renderExpandedRow={(row) => <CustomContent row={row} />}
 * />
 * ```
 */
interface UniversalDataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  /** The table instance from @tanstack/react-table */
  table: TanstackTable<TData>
  /** Optional floating bar for multi-select actions */
  floatingBar?: React.ReactNode | null
  /** Optional custom render function for mobile card view */
  renderMobileCard?: (row: Row<TData>) => React.ReactNode
  /** Optional custom render function for expanded rows (legacy mobile expansion) */
  renderExpandedRow?: (row: Row<TData>) => React.ReactNode
  /** Whether to use card view on mobile (default: true, uses renderMobileCard if provided) */
  enableMobileCards?: boolean
  /** Whether to enable row expansion on mobile (default: false, legacy behavior) */
  enableMobileExpansion?: boolean
}

export function UniversalDataTable<TData>({
  table,
  floatingBar = null,
  renderMobileCard,
  renderExpandedRow,
  enableMobileCards = true,
  enableMobileExpansion = false,
  className,
  ...props
}: UniversalDataTableProps<TData>) {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  // Handle mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)

      // Close expanded row when switching to desktop
      if (!mobile) {
        setExpandedRow(null)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  /**
   * Toggle row expansion on mobile (legacy behavior)
   */
  const toggleRowExpansion = (rowId: string) => {
    if (isMobile && enableMobileExpansion) {
      setExpandedRow((prev) => (prev === rowId ? null : rowId))
    }
  }

  // Use card view on mobile if enabled and custom card renderer provided
  const useMobileCardView = isMobile && enableMobileCards && renderMobileCard

  return (
    <div className={className} {...props}>
      {useMobileCardView ? (
        // Mobile Card View
        <div className="space-y-2">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id}>{renderMobileCard(row)}</div>
            ))
          ) : (
            <div className="flex h-24 items-center justify-center text-center text-muted-foreground">
              No results.
            </div>
          )}
        </div>
      ) : (
        // Desktop Table View (or legacy mobile with row expansion)
        <div className="overflow-hidden rounded-md border">
          <Table>
            {/* Table Header */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            {/* Table Body */}
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    {/* Main Row */}
                    <TableRow
                      onClick={() => toggleRowExpansion(row.id)}
                      className={
                        enableMobileExpansion && isMobile ? "cursor-pointer" : ""
                      }
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

                    {/* Expanded Row Content (Legacy Mobile Only) */}
                    {expandedRow === row.id && renderExpandedRow && (
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length}>
                          <div className="bg-gray-50 p-4">
                            {renderExpandedRow(row)}
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination and Floating Bar */}
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}


