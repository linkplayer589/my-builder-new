import * as React from "react"
import {
    flexRender,
    type RowData,
    type Table as TanstackTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table"

interface DataTableProps<TData extends RowData>
 extends React.HTMLAttributes<HTMLDivElement> {
    table: TanstackTable<TData>
    floatingBar?: React.ReactNode | null
    children?: React.ReactNode
    setOpenUpdateDialog?: React.Dispatch<React.SetStateAction<boolean>>
    setCurrentResort?: React.Dispatch<React.SetStateAction<TData | null>>
}
export function ResortsDataTable<TData extends RowData>({
    table,
    floatingBar = null,
    children,
    className,
    setOpenUpdateDialog,
    setCurrentResort,
    ..._props
}: DataTableProps<TData>) {
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

    // Resort specific field labels
    const LABELS = {
        id: "Resort ID",
        name: "Name",
        stripeSecretKey: "Stripe Secret Key",
        stripeWebhookSecret: "Stripe Webhook Secret",
        createdAt: "Created At",
        updatedAt: "Updated At",
    }

    function _getLabel(key: string): string {
        // Fallback: Capitalize and split camelCase as a last resort
        if (key in LABELS)
            return LABELS[key as keyof typeof LABELS]
        return key
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/^./, (str) => str.toUpperCase())
    }
  //   id createdAt label status apiKeyId apiKeyScope
  function formatKey(key: string): string {
    // Add a space before uppercase letters and capitalize the first letter of the key
    const formattedKey = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    return formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)
  }
  function renderValue(key: string, value: unknown, _row: TData): React.ReactNode {
    return (
      <div className="flex w-full flex-col items-start justify-between">
        <strong>{formatKey(key)}:</strong>
        <div>
          {typeof value === "string" && value.length > 35
            ? value.substring(0, 30) + "..."
            : String(value)}
        </div>
      </div>
    )
  }
    return (
        <div className={className}>
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

                                    {expandedRow === row.id && (
                                        <>
                                            <TableRow>
                                                <TableCell colSpan={table.getAllColumns().length}>
                                                    <div className="bg-gray-50 p-4">
                                                        <div className="space-y-4">
                                                            <span className="text-base font-bold">
                                                                Actions
                                                            </span>
                                                            <div>
                                                                <div className="flex">
                                                                    <Button
                                                                        className="w-full text-xs"
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                            // setCurrentResort(row.original)
                                                                            // setOpenUpdateDialog(true)
                                                                        }}
                                                                    >
                                                                        Update
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
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
