import { type Product } from "@/db/schema"
import { type ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@/components/data-table"

interface GetColumnsProps {
  isMobile: boolean
}

export function getProductsTableColumns({
  isMobile,
}: GetColumnsProps): ColumnDef<Product>[] {
  // Define the columns
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Active" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as boolean
        return value ? "Active" : "Inactive"
      },
    },
    {
      accessorKey: "titleTranslations",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title Translations" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as Record<string, string>
        return value?.en || "No Title"
      },
    },
    {
      accessorKey: "descriptionTranslations",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Description Translations"
        />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as Record<string, string>
        return value?.en || "No Description"
      },
    },
    // {
    //   accessorKey: "productData",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Product Data" />
    //   ),
    //   cell: ({ cell }) => {
    //     const value = cell.getValue() as SkiDataProduct // Assuming 'SkiDataProduct' type
    //     return value ? JSON.stringify(value) : "No Product Data"
    //   },
    // },
    {
      accessorKey: "additionalInfo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Additional Info" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as Record<string, unknown>
        return value ? JSON.stringify(value) : "No Additional Info"
      },
    },
    {
      accessorKey: "resortId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Resort ID" />
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
  ]

  return isMobile
    ? columns.filter(
        (column, index) => index < 2 || index === columns.length - 4
      ) // Show first two columns and the createdAt column on mobile
    : columns
}
