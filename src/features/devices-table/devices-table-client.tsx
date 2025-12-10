"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Device } from "@/db/schema"
import { useResort, normalizeResortName } from "@/features/resorts"
import type { DataTableRowAction } from "@/types"

import { useDataTable } from "@/components/data-table"
import { useIsMobile } from "@/hooks/use-mobile"
import { UniversalDataTableWrapper } from "@/components/data-table"
import { UniversalDataTable } from "@/components/data-table"

import { getDevicesTableColumns } from "./devices-table-columns"

interface DevicesTableProps {
  promises: Promise<
    [
      {
        data: Device[]
        pageCount: number
      },
    ]
  >
}

/**
 * Client-side devices table component
 *
 * @description
 * Client component that renders the devices table with interactive features:
 * - Sorting by any column
 * - Advanced filtering
 * - Pagination
 * - Responsive mobile layout
 * - Data refresh/revalidation
 * - Export functionality
 */
export function DevicesTableClient({ promises }: DevicesTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resort } = useResort()
  const isMobile = useIsMobile()

  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: Device[]; pageCount: number },
  ]

  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<Device> | null>(null)

  // Track previous search params to detect changes
  const prevSearchParamsRef = React.useRef<string | null>(null)

  // Trigger router refresh when URL params change (pagination, sorting, filtering)
  React.useEffect(() => {
    const currentParams = searchParams.toString()

    // Skip on initial mount
    if (prevSearchParamsRef.current === null) {
      prevSearchParamsRef.current = currentParams
      return
    }

    // If params changed, trigger refresh to fetch new data
    if (prevSearchParamsRef.current !== currentParams) {
      prevSearchParamsRef.current = currentParams
      router.refresh()
    }
  }, [searchParams, router])

  const columns = React.useMemo(() => {
    const resortName = resort?.name ? normalizeResortName(resort.name) : undefined
    return getDevicesTableColumns({
      setRowAction,
      isMobile,
      resort: resortName,
    })
  }, [isMobile, resort?.name])

  // Setup the table using the data, columns, and filters
  const { table } = useDataTable<Device>({
    data,
    columns,
    pageCount: pageCount,
    filterFields: [],
    enableAdvancedFilter: true,
    initialState: {
      columnFilters: [],
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: true,
    clearOnDefault: false,
  })

  const handleRevalidate = React.useCallback(async () => {
    router.refresh()
  }, [router])

  return (
    <UniversalDataTableWrapper
      table={table}
      columns={columns}
      onRevalidate={handleRevalidate}
      storageKey="devicesLastRefreshed"
      exportFilename="devices"
    >
      <UniversalDataTable table={table} />
    </UniversalDataTableWrapper>
  )
}

