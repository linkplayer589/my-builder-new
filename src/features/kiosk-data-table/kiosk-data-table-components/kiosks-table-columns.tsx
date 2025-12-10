"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type Kiosk } from "@/db/schema"
import { Ellipsis, Eye } from "lucide-react"

import type { DataTableRowAction } from "@/types/index"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table"
import { type Column, type ColumnDef, type Row } from "@tanstack/react-table"
import { useResort } from "@/features/resorts"


interface GetColumnsProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<Kiosk> | null>>
  setCurrentKiosk: React.Dispatch<React.SetStateAction<Kiosk | null>>
  setOpenUpdateDialog: React.Dispatch<React.SetStateAction<boolean>>
  isMobile?: boolean
}

export function getKiosksTableColumns({
  setRowAction: _setRowAction,
  setCurrentKiosk,
  setOpenUpdateDialog,
  isMobile,
}: GetColumnsProps): ColumnDef<Kiosk>[] {
  const columns: ColumnDef<Kiosk>[] = [
    {
      accessorKey: "id",
      header: ({ column }: { column: Column<Kiosk> }) => (
        <DataTableColumnHeader
          column={column}
          title="ID"
          className="max-w-fit"
        />
      ),
      cell: ({ row }: { row: Row<Kiosk> }) => (
        <div className="max-w-fit text-center">{row.getValue("id")}</div>
      ),
      size: 80,
    },
    {
      accessorKey: "name",
      header: ({ column }: { column: Column<Kiosk> }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }: { row: Row<Kiosk> }) => <div>{row.getValue("name")}</div>,
      size: 200,
    },
    {
      accessorKey: "type",
      header: ({ column }: { column: Column<Kiosk> }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }: { row: Row<Kiosk> }) => (
        <Badge className="capitalize">{row.getValue("type")}</Badge>
      ),
      size: 120,
      filterFn: (row, id, value) =>
        Array.isArray(value) && value.includes(row.getValue(id)),
    },
    {
      accessorKey: "kioskContentIds",
      header: ({ column }: { column: Column<Kiosk> }) => (
        <DataTableColumnHeader column={column} title="Content Count" />
      ),
      cell: ({ row }: { row: Row<Kiosk> }) => (
        <div>{(row.original.kioskContentIds || []).length}</div>
      ),
      size: 100,
    },
    {
      accessorKey: "location",
      header: ({ column }: { column: Column<Kiosk> }) => (
        <DataTableColumnHeader column={column} title="Location" />
      ),
      cell: ({ row }: { row: Row<Kiosk> }) => {
        const location = row.getValue("location");
        return (
          <div className="max-w-xs truncate">
            {(location as { label?: string } | null)?.label || ""}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }: { column: Column<Kiosk> }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }: { row: Row<Kiosk> }) => {
        const value = row.getValue("createdAt");
        if (!value || typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
          return "Invalid Date" // Or return a default value like N/A
        }
        if (isNaN(new Date(value).getTime())) {
          return "Invalid Date"
        }
        const date = new Date(value).toISOString().split("T")
        return (
          <div>
            {date[0]} {date[1] ? date[1].slice(0, 5) : ""}
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }: { column: Column<Kiosk> }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ row }: { row: Row<Kiosk> }) => {
        const value = row.getValue("updatedAt");
        if (!value || typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
          return "Invalid Date" // Or return a default value like N/A
        }
        if (isNaN(new Date(value).getTime())) {
          return "Invalid Date"
        }
        const date = new Date(value).toISOString().split("T")
        return (
          <div>
            {date[0]} {date[1] ? date[1].slice(0, 5) : ""}
          </div>
        )
      },
      size: 150,
    },
    {
      id: "actions",
      enableHiding: false,
      maxSize: 40,
      cell: function ActionsCell({ row }: { row: Row<Kiosk> }) {
        const router = useRouter()
        const { resort } = useResort()
        const _kiosk = row.original
        
        const handleViewDetails = () => {
          if (resort) {
            const normalizedResortName = resort.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            router.push(`/admin/${normalizedResortName}/settings/kiosks/${row.original.id}`)
          }
        }

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto">
                <DropdownMenuItem onSelect={handleViewDetails}>
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setCurrentKiosk(row.original)  // Set the current kiosk data for update
                  setOpenUpdateDialog(true)  // Open the update modal
                }}>
                  Update
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
  // Show only the first two columns on mobile (ID and Name)
  return isMobile
    ? columns.slice(0, 2) // Only the first two columns: ID and Name
    : columns
}
