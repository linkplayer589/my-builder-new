import * as React from "react"
import {
  flexRender,
  type Table as TanstackTable,
} from "@tanstack/react-table"

import { type SkidataCalculatedPrice } from "@/types/skidata-types"
import { type SalesChannel } from "@/db/schema"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table"

// Props interface for the SalesChannelsDataTable component
interface DataTableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  table: TanstackTable<SalesChannel>
  floatingBar?: React.ReactNode | null
  children?: React.ReactNode
}
export function SalesChannelsDataTable({
  table,
  floatingBar = null,
  children,
  className,
  ...props
}: DataTableProps) {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)
  const [isMobile, setIsMobile] = React.useState(false)
  const [isBrowser, setIsBrowser] = React.useState(false) // Track if we are in the browser

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsBrowser(true)
    }
  }, [])

  // Now, only run the resize logic when it's confirmed that we're on the client side (after hydration)
  React.useEffect(() => {
    if (isBrowser) {
      const handleResize = () => {
        const width = window.innerWidth
        const isMobile = width <= 768
        setIsMobile(isMobile)

        if (!isMobile) {
          setExpandedRow(null)
        }
      }

      handleResize() // Trigger immediately on mount

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [isBrowser]) // This will only run once on initial render

  const toggleRowExpansion = (rowId: string) => {
    console.log("Toggling row expansion for:", rowId) // Debug log to see rowId
    if (isMobile) {
      setExpandedRow((prev) => (prev === rowId ? null : rowId))
    }
  }

  function formatKey(key: string): string {
    // Add a space before uppercase letters and capitalize the first letter of the key
    const formattedKey = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)
  }

  //   id createdAt label status apiKeyId apiKeyScope

  function renderValue(key: string, value: unknown, _row: SalesChannel): React.ReactNode {
    if (key === "activeProductIds" || key === "activeConsumerCategoryIds") {
      if (Array.isArray(value)) {
        return (
          <div className="flex w-full flex-col items-start justify-between">
            <strong>{formatKey(key)}:</strong>
            <div className="flex flex-wrap gap-2">
              {value.map((item: string) => (
                <span key={item} className="py-1 text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )
      }
    }
    if (key === "lifepassPrice" || key === "insurancePrice") {
      if (
        value &&
        typeof value === "object" &&
        "basePrice" in value &&
        value.basePrice &&
        typeof value.basePrice === "object" &&
        "amountGross" in value.basePrice &&
        "currencyCode" in value.basePrice
      ) {
        const basePrice = (value as SkidataCalculatedPrice).basePrice
        return (
          <div className="flex w-full flex-col items-start justify-between">
            <strong>{formatKey(key)}:</strong>
            <div>
              {basePrice.amountGross} {basePrice.currencyCode}
            </div>
          </div>
        )
      }
      return (
        <div className="flex w-full flex-col items-start justify-between">
          <strong>{formatKey(key)}:</strong>
          <div>Invalid price data</div>
        </div>
      )
    }
    return (
      <div className="flex w-full flex-col items-start justify-between">
        <strong>{formatKey(key)}:</strong>
        <div>{String(value)}</div>
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
                    onClick={() => toggleRowExpansion(row.id)} // Toggle expansion on click
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

                  {/* Render expanded row  */}
                  {expandedRow === row.id && (
                    <>
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length}>
                          <div className="overflow-x-auto bg-gray-50 p-4">
                            <div className="max-w-full space-y-4">
                              {Object.entries(row.original as Record<string, unknown>)
                                .filter(([key, value]) => {
                                  // Only include keys that are defined in the `renderValue` function
                                  return (
                                    [
                                      "id",
                                      "resortId",
                                      "name",
                                      "type",
                                      "activeProductIds",
                                      "activeConsumerCategoryIds",
                                      "lifepassPrice",
                                      "insurancePrice",
                                      "depotTickets",
                                      "createdAt",
                                      "updatedAt",
                                    ].includes(key) &&
                                    value !== null &&
                                    value !== undefined
                                  )
                                })
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="mb-4 flex max-w-full flex-wrap justify-between break-words rounded-md border border-gray-300 p-4"
                                    style={{ maxWidth: "100%" }}
                                  >
                                    {renderValue(key, value, row.original)}
                                  </div>
                                ))}
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
