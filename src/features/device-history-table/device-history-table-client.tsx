"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type DeviceHistory } from "@/db/schema"
import { Download } from "lucide-react"

import type {
  DataTableAdvancedFilterField,
} from "@/types/index"
import { useDataTable, exportTableToCSV } from "@/components/data-table"
import { TableFilterSortWrapper } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { getDeviceHistoryTableColumns } from "./device-history-table-columns"
import { DeviceHistoryDataTable } from "./device-history-data-table"

interface DeviceHistoryTableProps {
  promises: Promise<
    [
      {
        data: DeviceHistory[]
        pageCount: number
      },
    ]
  >
}

/**
 * Client-side device history table component
 *
 * @description
 * Client component that renders the device history table with interactive features
 */
export function DeviceHistoryTableClient({ promises }: DeviceHistoryTableProps) {
  const router = useRouter()
  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: DeviceHistory[]; pageCount: number },
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

  const columns = React.useMemo(
    () =>
      getDeviceHistoryTableColumns({
        isMobile,
      }),
    [isMobile]
  )

  const handleRevalidate = React.useCallback(async () => {
    router.refresh()
  }, [router])

  const filterFields: DataTableAdvancedFilterField<DeviceHistory>[] = [
    {
      id: "id",
      label: "ID",
      type: "text",
    },
    {
      id: "eventType",
      label: "Event Type",
      type: "text",
    },
    {
      id: "processingStatus",
      label: "Processing Status",
      type: "text",
    },
    {
      id: "createdAt",
      label: "Created At",
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
    <div className="size-full">
      <DeviceHistoryDataTable table={table}>
        <div
          className={`flex w-full ${isMobile ? "flex-col" : "flex-row"} items-center justify-end gap-4`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportTableToCSV(table, {
                filename: "device-history-report",
              })
            }
            className="gap-2"
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </Button>
          <TableFilterSortWrapper
            table={table}
            onUpdate={handleRevalidate}
            filterFields={filterFields}
          />
        </div>
      </DeviceHistoryDataTable>
    </div>
  )
}

