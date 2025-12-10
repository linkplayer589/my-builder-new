import * as React from "react"
import {
  flexRender,
  type Table as TanstackTable,
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

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<TData>
  floatingBar?: React.ReactNode | null
  children?: React.ReactNode
}

export function SkiDataDataTable<TData>({
  table,
  floatingBar = null,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  //   const { expandedRow, isMobile, toggleRowExpansion } =
  //     useRowExpansionAndMobile()

  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null) // null to delay checking

  // Ensure client-side evaluation for isMobile state
  React.useEffect(() => {
    const handleResize = () => {
      const isMobileNow = window.innerWidth <= 768
      setIsMobile(isMobileNow) // Update the state only on the client

      // If switching from mobile to desktop, close the expanded row
      if (!isMobileNow) {
        setExpandedRow(null)
      }
    }

    handleResize() // Initial check for the screen size
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

  function formatKey(key: string): string {
    // Add a space before uppercase letters and capitalize the first letter of the key
    const formattedKey = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)
  }

  function renderValue(key: string, value: unknown, _row?: TData): React.ReactNode {
    const formattedKey = formatKey(key)
    return (
      <div className="flex w-full flex-col items-start">
        <strong className="shrink-0">{formattedKey}:</strong>
        <span className="grow">{String(value)}</span>
      </div>
    )
  }

  // Avoid rendering the table until `isMobile` is checked
  if (isMobile === null) return null

  return (
    <div className={className} {...props}>
      {children}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  // Only show the first two columns on mobile
                  if (isMobile && index >= 2) return null
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
                    onClick={() => toggleRowExpansion(row.id)} // Toggle expansion on click
                    className="cursor-pointer"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell, index) => {
                      // Only show the first two columns on mobile
                      if (isMobile && index >= 2) return null
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>

                  {/* Render expanded row */}
                  {expandedRow === row.id && (
                    <>
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length}>
                          <div className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              {Object.entries(row.original as Record<string, unknown>).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="mb-4 flex max-w-full flex-wrap justify-between overflow-hidden rounded-md border border-gray-300 p-4"
                                  >
                                    {/* Render value */}
                                    {renderValue(key, value, row.original)}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </>
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

      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}
