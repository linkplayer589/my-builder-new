import { type SalesChannel } from "@/db/schema"
import { type DataTableRowAction } from "@/types"
import { type ColumnDef } from "@tanstack/react-table"

import { type SkidataCalculatedPrice } from "@/types/skidata-types"
import { DataTableColumnHeader } from "@/components/data-table"

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<SalesChannel> | null>
  >
  isMobile: boolean
  resort?: string
}

export function getSalesChannelsTableColumns({
  setRowAction: _setRowAction,
  isMobile,
  resort: _resort,
}: GetColumnsProps): ColumnDef<SalesChannel>[] {
  // Define the columns
  const columns: ColumnDef<SalesChannel>[] = [ 
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sales Channel Name" />
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as "web" | "kiosk"
        return value.charAt(0).toUpperCase() + value.slice(1) // Capitalize the first letter
      },
    },
    {
      accessorKey: "activeProductIds",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Active Product IDs"
          className="w-[300px] max-w-[300px] overflow-hidden text-ellipsis"
        />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string[]
        return value?.length ? (
          <div style={{ whiteSpace: "pre-wrap" }}>
            {value.map((id, index) => (
              <div key={index}>{id}</div> // Display each ID on a new line
            ))}
          </div>
        ) : (
          "No Products"
        )
      },
    },
    {
      accessorKey: "activeConsumerCategoryIds",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Active Consumer Categories"
          className="w-[300px] max-w-[300px] overflow-hidden text-ellipsis"
        />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as string[]
        return value?.length ? (
          <div style={{ whiteSpace: "pre-wrap" }}>
            {value.map((id, index) => (
              <div key={index}>{id}</div> // Display each ID on a new line
            ))}
          </div>
        ) : (
          "No Categories"
        )
      },
    },
    {
      accessorKey: "lifepassPrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lifepass Price" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as SkidataCalculatedPrice
        return value?.basePrice
          ? `${value.basePrice.amountGross} ${value.basePrice.currencyCode}`
          : "No Lifepass Price"
      },
    },
    {
      accessorKey: "insurancePrice",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Insurance Price" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as SkidataCalculatedPrice
        return value?.basePrice
          ? `${value.basePrice.amountGross} ${value.basePrice.currencyCode}`
          : "No Insurance Price"
      },
    },
    {
      accessorKey: "depotTickets",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Depot Tickets" />
      ),
      cell: ({ cell }) => {
        const value = cell.getValue() as boolean
        return value ? "Available" : "Not Available"
      },
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
