"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type Resort } from "@/db/schema"

import type {
  DataTableAdvancedFilterField,
  DataTableRowAction,
} from "@/types/index"
import { useDataTable } from "@/components/data-table"
import { TableFilterSortWrapper } from "@/components/data-table"
import { type dbGetResorts } from "../resort-actions/db-get-resorts-filters"
import { getResortsTableColumns } from "./resorts-table-columns"
import { ResortsDataTable } from "./resort-data-table"
import CreateResortButton from "../resort-components/create-resort-button"

interface ResortsTableProps {
  promises: Promise<[Awaited<ReturnType<typeof dbGetResorts>>]>
}

/**
 * Client-side resorts table component
 * 
 * @description
 * Client component that renders the resorts table with interactive features
 */
export function ResortsTableClient({ promises }: ResortsTableProps) {
  const router = useRouter()
  const [_currentResort, setCurrentResort] = React.useState<Resort | null>(null)
  const [_openUpdateDialog, setOpenUpdateDialog] = React.useState(false)
  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: Resort[]; pageCount: number },
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
    React.useState<DataTableRowAction<Resort> | null>(null)

  const columns = React.useMemo(
    () =>
      getResortsTableColumns({
        setRowAction,
        setCurrentResort,
        setOpenUpdateDialog,
        isMobile,
      }),
    [isMobile, setRowAction]
  )

  const handleRevalidate = React.useCallback(async () => {
    router.refresh()
  }, [router])

  
  const filterFields: DataTableAdvancedFilterField<Resort>[] = [
    {
      id: "id",
      label: "Resort ID",
      type: "text",
    },
    {
      id: "name",
      label: "Name",
      type: "text",
    },
    {
      id: "stripeSecretKey",
      label: "Stripe Secret Key",
      type: "text",
    },
    {
      id: "stripeWebhookSecret",
      label: "Stripe Webhook Secret",
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
      <ResortsDataTable
        setCurrentResort={setCurrentResort}
        setOpenUpdateDialog={setOpenUpdateDialog}
        table={table}
      >
        <div
          className={`flex w-full ${isMobile ? "flex-col" : "flex-row"} justify-end gap-4`}
        >
          <div>
            <TableFilterSortWrapper
              table={table}
              onUpdate={handleRevalidate}
              filterFields={filterFields}
            />
          </div>
          <CreateResortButton />
        </div>
      </ResortsDataTable>
    </div>
  )
}

