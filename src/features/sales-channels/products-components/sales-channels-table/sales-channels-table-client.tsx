"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type SalesChannel } from "@/db/schema"

import type {
  DataTableAdvancedFilterField,
  DataTableRowAction,
} from "@/types/index"
import { useDataTable } from "@/components/data-table"
import { TableFilterSortWrapper } from "@/components/data-table"
import { revalidateSalesChannels } from "./_lib/revalidate-sales-channels"
import { getSalesChannelsTableColumns } from "./sales-channels-table-columns"
import { SalesChannelsDataTable } from "./sales-channels-data-table"

interface SalesChannelsTableProps {
  promises: Promise<
    [
      {
        data: SalesChannel[]
        pageCount: number
      },
    ]
  >
}

/**
 * Client-side sales channels table component
 * 
 * @description
 * Client component that renders the sales channels table with interactive features
 */
export function SalesChannelsTableClient({ promises }: SalesChannelsTableProps) {
  const router = useRouter()
  const [_currentSalesChannel, _setCurrentSalesChannel] =
    React.useState<SalesChannel | null>(null)
  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: SalesChannel[]; pageCount: number },
  ]

  // State hook for handling mobile viewport
  const [isMobile, setIsMobile] = React.useState(false)

  // Hook to handle window resizing
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<SalesChannel> | null>(null)

  const columns = React.useMemo(
    () =>
      getSalesChannelsTableColumns({
        setRowAction,
        isMobile,
      }),
    [isMobile, setRowAction]
  )

  const handleRevalidate = React.useCallback(async () => {
    await revalidateSalesChannels()
    router.refresh()
  }, [router])

  const filterFields: DataTableAdvancedFilterField<SalesChannel>[] = [
    {
      id: "id",
      label: "ID",
      type: "text",
    },
    {
      id: "name",
      label: "Name",
      type: "text",
    },
    {
      id: "createdAt",
      label: "Created At",
      type: "date",
    },
    {
      id: "updatedAt",
      label: "Updated At",
      type: "date",
    },
  ]

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <div className="size-full px-2 pb-4">
      <SalesChannelsDataTable table={table}>
        <div
          className={`flex w-full ${isMobile ? "flex-col" : "flex-row"} justify-end gap-4`}
        >
          <TableFilterSortWrapper
            table={table}
            onUpdate={handleRevalidate}
            filterFields={filterFields}
          />
        </div>
      </SalesChannelsDataTable>
    </div>
  )
}

