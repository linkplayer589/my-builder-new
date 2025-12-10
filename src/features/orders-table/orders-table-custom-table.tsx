"use client"

import * as React from "react"
import { type Order } from "@/db/schema"
import {
  flexRender,
  type Table as TanstackTable,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table"

import { OrdersTableOrderDetailsDropdown } from "./orders-table-features/orders-table-order-details-dropdown"

interface OrdersCustomTableProps {
  table: TanstackTable<Order>
  expandedRowId: number | null
  floatingBar?: React.ReactNode | null
}

/**
 * Custom table component for orders with inline row expansion
 *
 * @param table - TanStack table instance with row data
 * @param expandedRowId - ID of currently expanded row, or null if none
 * @param floatingBar - Optional floating action bar
 * @returns Rendered table with expanded row details
 *
 * @description
 * Renders the orders table with support for expanding rows inline.
 * When a row is expanded, a full-width row is rendered below it
 * showing comprehensive order details. Sessions are fetched internally
 * by the dropdown component using the order's sessionIds.
 *
 * Row background colors:
 * - Error orders (wasError=true): Red pastel tint
 * - Test orders (testOrder=true): Yellow pastel tint
 * - Normal orders: Default background
 * Error state takes priority over test order styling.
 */
export function OrdersCustomTable({
  table,
  expandedRowId,
  floatingBar = null,
}: OrdersCustomTableProps) {
  return (
    <div className="w-full space-y-2.5 overflow-auto">
      {/* Table */}
      <div className="w-full overflow-auto rounded-md border">
        <Table>
          {/* Header */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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

          {/* Body */}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isTestOrder = row.original.testOrder
                const hasError = row.original.wasError

                // Determine row background: error takes priority over test
                const getRowBg = () => {
                  if (hasError) {
                    return "bg-red-50/60 hover:bg-red-50/80 dark:bg-red-950/20 dark:hover:bg-red-950/30"
                  }
                  if (isTestOrder) {
                    return "bg-yellow-50/70 hover:bg-yellow-50/90 dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30"
                  }
                  return ""
                }

                const getExpandedBg = () => {
                  if (hasError) {
                    return "bg-red-50/40 dark:bg-red-950/10"
                  }
                  if (isTestOrder) {
                    return "bg-yellow-50/50 dark:bg-yellow-950/10"
                  }
                  return "bg-muted/30"
                }

                return (
                  <React.Fragment key={row.id}>
                    {/* Main Row */}
                    <TableRow
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(getRowBg())}
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

                    {/* Expanded Row Content */}
                    {expandedRowId === row.original.id && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={table.getAllColumns().length}
                          className="p-0"
                        >
                          <div className={cn("border-t p-4", getExpandedBg())}>
                            <OrdersTableOrderDetailsDropdown
                              order={row.original}
                              isExpanded={true}
                              onToggle={() => {}}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
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

      {/* Pagination and Floating Bar */}
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}
