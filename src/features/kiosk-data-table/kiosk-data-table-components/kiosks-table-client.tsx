"use client"

import * as React from "react"
import { type Kiosk } from "@/db/schema"
import { type dbGetKiosks } from "@/db/server-actions/kiosk-actions/db-get-kiosks"
import { revalidateKiosks } from "@/db/server-actions/kiosk-actions/db-revalidate-kiosks"
import { updateKioskHandler } from "@/db/server-actions/kiosk-actions/db-update-kiosk"

import type { DataTableRowAction } from "@/types/index"
import {
  UniversalDataTable,
  UniversalDataTableWrapper,
  useDataTable,
} from "@/components/data-table"

import CreateKioskButton from "./create-kiosk-button"
import { KiosksExpandedRow } from "./kiosks-expanded-row"
import { getKiosksTableColumns } from "./kiosks-table-columns"
import SearchLifePassButton from "./search-lifepass-button"
import { UpdateKioskDialog } from "./update-kiosk-modal"

interface KiosksTableProps {
  promises: Promise<[Awaited<ReturnType<typeof dbGetKiosks>>]>
}

/**
 * Client-side kiosks table component
 *
 * @description
 * Client component that renders the kiosks table with interactive features:
 * - Sorting by any column
 * - Advanced filtering
 * - Pagination
 * - Responsive mobile layout
 * - Update kiosk dialog
 * - Expanded row view on mobile
 */
export function KiosksTableClient({ promises }: KiosksTableProps) {
  const [currentKiosk, setCurrentKiosk] = React.useState<Kiosk | null>(null)
  const [openUpdateDialog, setOpenUpdateDialog] = React.useState(false)
  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: Kiosk[]; pageCount: number },
  ]
  // State hook for handling mobile viewport
  const [isMobile, setIsMobile] = React.useState(false)

  // Hook to handle window resizing
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768) // Set to true for mobile devices
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<Kiosk> | null>(null)

  const columns = React.useMemo(
    () =>
      getKiosksTableColumns({
        setRowAction,
        setCurrentKiosk,
        setOpenUpdateDialog,
        isMobile,
      }),
    [isMobile, setRowAction]
  )

  const handleUpdateKiosk = async (
    id: string,
    name: string,
    type: string,
    kioskContentIds: string[],
    location: string,
    resortId: number
  ) => {
    // Call the update function here (API or DB update)
    const req = {
      id,
      name,
      type,
      kioskContentIds: kioskContentIds.map((id) => Number(id)),
      location,
      resortId,
    }
    console.log(req)
    await updateKioskHandler(req)

    // setOpenUpdateDialog(false) // Close the modal after update
  }

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields: [],
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
      <UniversalDataTableWrapper
        table={table}
        columns={columns}
        onRevalidate={revalidateKiosks}
        storageKey="kiosksRefreshed"
        exportFilename="kiosks"
        customActions={
          <>
            <CreateKioskButton /> <SearchLifePassButton />
          </>
        }
      >
        <UniversalDataTable
          table={table}
          renderExpandedRow={(row) => (
            <KiosksExpandedRow
              row={row}
              setCurrentKiosk={setCurrentKiosk}
              setOpenUpdateDialog={setOpenUpdateDialog}
            />
          )}
        />
      </UniversalDataTableWrapper>
      <UpdateKioskDialog
        open={openUpdateDialog}
        onOpenChange={setOpenUpdateDialog}
        kiosk={currentKiosk}
        onUpdate={handleUpdateKiosk}
      />
    </div>
  )
}
