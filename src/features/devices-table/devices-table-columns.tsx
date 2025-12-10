"use client"

import Link from "next/link"
import type { Device } from "@/db/schema"
import type { DataTableRowAction } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye } from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Device> | null>
  >
  isMobile: boolean
  resort?: string
}

export function getDevicesTableColumns({
  setRowAction: _setRowAction,
  isMobile,
  resort,
}: GetColumnsProps): ColumnDef<Device>[] {
  // Define the columns
  const columns: ColumnDef<Device>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      accessorKey: "serial",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Serial" />
      ),
    },
    {
      accessorKey: "chipId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chip ID" />
      ),
    },
    {
      accessorKey: "hex",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hex" />
      ),
    },
    {
      accessorKey: "luhn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="LUHN" />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string | Date
        const date = typeof value === "string" ? new Date(value) : value
        return !isNaN(date.getTime())
          ? `${date.toISOString().split("T")[0]} ${date
              .toISOString()
              .split("T")[1]
              ?.slice(0, 5)}`
          : "Invalid Date"
      },
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string | Date
        const date = typeof value === "string" ? new Date(value) : value
        return !isNaN(date.getTime())
          ? `${date.toISOString().split("T")[0]} ${date
              .toISOString()
              .split("T")[1]
              ?.slice(0, 5)}`
          : "Invalid Date"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const device = row.original
        const resortName = resort ?? "default"

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-8 p-0"
                aria-label="Open menu"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/${resortName}/settings/devices/${device.id}`}
                  className="flex items-center"
                >
                  <Eye className="mr-2 size-4" />
                  View Device Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return isMobile
    ? columns.filter(
        (column, index) => index < 2 || index === columns.length - 4 || column.id === "actions"
      ) // Show first two columns, createdAt, and actions on mobile
    : columns
}
