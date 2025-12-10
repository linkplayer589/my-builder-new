import * as React from "react"
import {
  flexRender,
  type Table as TanstackTable,
  type Row,
} from "@tanstack/react-table"

import useRowExpansionAndMobile from "@/hooks/use-row-expansion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table"

import { type TicketItem } from "@/features/skidata-table/_types/skidata"

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TicketItem>
  floatingBar?: React.ReactNode | null
  children?: React.ReactNode
}

/**
 * LifePass Data Table Component
 *
 * @description
 * Renders TicketItem data from Skidata in a table format with expandable rows.
 * Shows lifepass/device information from the Skidata system.
 */
export function LifePassDataTable({
  table,
  floatingBar = null,
  children,
  className,
  ...props
}: DataTableProps) {
  const { expandedRow, toggleRowExpansion } = useRowExpansionAndMobile()

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
  function renderValue(key: string, value: unknown, _row: Row<TicketItem>): React.ReactNode {
    const formattedKey = formatKey(key)

    // Handle arrays (like skipassDTAs, ticketItemIds)
    if (Array.isArray(value)) {
      return (
        <div className="flex w-full flex-col items-start">
          <strong className="shrink-0">{formattedKey}:</strong>
          <span className="grow font-mono text-sm">
            {value.length > 0 ? value.join(", ") : "N/A"}
          </span>
        </div>
      )
    }

    return (
      <div className="flex w-full flex-col items-start">
        <strong className="shrink-0">{formattedKey}:</strong>
        <span className="grow">{String(value ?? "N/A")}</span>
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

                  {/* Render expanded row */}
                  {expandedRow === row.id && (
                    <TableRow>
                      <TableCell colSpan={table.getAllColumns().length}>
                        <div className="bg-gray-50 p-4">
                          <div className="space-y-4">
                            {Object.entries(row.original).map(([key, value]) => (
                              <div
                                key={key}
                                className="mb-4 flex max-w-full flex-wrap justify-between overflow-hidden rounded-md border border-gray-300 p-4"
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
                  No lifepasses found.
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
