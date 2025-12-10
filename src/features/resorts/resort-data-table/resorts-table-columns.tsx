"use client"

import * as React from "react"
import { type Resort } from "@/db/schema"
import { Ellipsis } from "lucide-react"

import type { DataTableRowAction } from "@/types/index"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table"
import { type Column, type ColumnDef, type Row } from "@tanstack/react-table"


interface GetColumnsProps {
  setRowAction: React.Dispatch<React.SetStateAction<DataTableRowAction<Resort> | null>>
  setCurrentResort: React.Dispatch<React.SetStateAction<Resort | null>>
  setOpenUpdateDialog: React.Dispatch<React.SetStateAction<boolean>>
  isMobile?: boolean
}

export function getResortsTableColumns({
  setRowAction: _setRowAction,
  setCurrentResort,
  setOpenUpdateDialog,
  isMobile,
}: GetColumnsProps): ColumnDef<Resort>[] {
  const columns: ColumnDef<Resort>[] = [
    {
      accessorKey: "id",
      header: ({ column }: { column: Column<Resort> }) => (
        <DataTableColumnHeader column={column} title="Resort ID" className="max-w-fit" />
      ),
      cell: ({ row }: { row: Row<Resort> }) => (
        <div className="max-w-fit text-center">{row.getValue("id")}</div>
      ),
      size: 80,
    },
    {
      accessorKey: "name",
      header: ({ column }: { column: Column<Resort> }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }: { row: Row<Resort> }) => <div>{row.getValue("name")}</div>,
      size: 200,
    },
    {
      accessorKey: "stripeSecretKey",
      header: ({ column }: { column: Column<Resort> }) => (
        <DataTableColumnHeader column={column} title="Stripe Secret Key" />
      ),
      cell: ({ row }: { row: Row<Resort> }) => (
        <div className="max-w-xs truncate">{row.getValue("stripeSecretKey")}</div>
      ),
      size: 180,
    },
    {
      accessorKey: "stripeWebhookSecret",
      header: ({ column }: { column: Column<Resort> }) => (
        <DataTableColumnHeader column={column} title="Stripe Webhook Secret" />
      ),
      cell: ({ row }: { row: Row<Resort> }) => (
        <div className="max-w-xs truncate">{row.getValue("stripeWebhookSecret")}</div>
      ),
      size: 180,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }: { column: Column<Resort> }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }: { row: Row<Resort> }) => {
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
      header: ({ column }: { column: Column<Resort> }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ row }: { row: Row<Resort> }) => {
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
      cell: ({ row }: { row: Row<Resort> }) => {
        const _resort = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Ellipsis className="size-4" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto">
                <DropdownMenuItem onSelect={() => {
                  setCurrentResort(row.original)  // Set the current resort data for update
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
