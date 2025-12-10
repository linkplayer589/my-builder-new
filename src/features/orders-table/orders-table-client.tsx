"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { type Order } from "@/db/schema"
import type { dbGetOrders } from "@/db/server-actions/order-actions/db-get-orders"
import { revalidateOrders } from "@/db/server-actions/order-actions/revalidate-orders"
import { useResort } from "@/features/resorts"
import { Eye, EyeOff, Pencil, X, FlaskConical, AlertTriangle, StickyNote } from "lucide-react"
import { toast } from "sonner"

import type {
  DataTableRowAction,
} from "@/types/index"
import { useDataTable, UniversalDataTableWrapper } from "@/components/data-table"
import { UniversalDataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useRowExpansionAndMobile from "@/hooks/use-row-expansion"

import { OrdersMobileCard } from "./orders-mobile-card"
import { getOrdersTableColumns } from "./orders-table-columns"
import { OrdersCustomTable } from "./orders-table-custom-table"
import { ordersTableToggleTestOrderAction } from "./orders-table-actions/orders-table-toggle-test-order-action"
import { ordersTableToggleErrorAction } from "./orders-table-actions/orders-table-toggle-error-action"
import {
  ordersTableBulkSetTestAction,
  ordersTableBulkSetErrorAction,
  ordersTableBulkAddNoteAction,
} from "./orders-table-actions/orders-table-bulk-actions"
import { OrdersTableNotesDialog } from "./orders-table-features/orders-table-notes-dialog/orders-table-notes-dialog-components/orders-table-notes-dialog"
import { OrdersTableBulkNoteDialog } from "./orders-table-features/orders-table-bulk-note-dialog"
import type { OrderNoteType } from "./orders-table-actions/orders-table-add-note-action"

interface OrdersTableProps {
  promises: Promise<[Awaited<ReturnType<typeof dbGetOrders>>]>
}

interface FilterType {
  id: string
  value: string[]
  type: string
  operator: string
  rowId: string
}

/**
 * Client-side orders table component
 *
 * @description
 * Client component that renders the orders table with interactive features:
 * - Sorting by any column
 * - Advanced filtering
 * - Pagination
 * - Responsive mobile layout with mobile cards
 * - Toggle incomplete orders visibility
 * - Actions menu for test order toggle and notes
 */
export function OrdersTableClient({ promises }: OrdersTableProps) {
  const router = useRouter()
  const { resort } = useResort()
  const searchParams = useSearchParams()
  const { isMobile } = useRowExpansionAndMobile()

  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: Order[]; pageCount: number },
  ]

  // State hooks for managing row actions and expansion
  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<Order> | null>(null)
  const [expandedRowId, setExpandedRowId] = React.useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Notes dialog state
  const [notesDialogOpen, setNotesDialogOpen] = React.useState(false)
  const [notesDialogOrderId, setNotesDialogOrderId] = React.useState<number | null>(null)
  const [notesDialogInitialNotes, setNotesDialogInitialNotes] = React.useState<unknown>(null)
  const [notesDialogDefaultType, setNotesDialogDefaultType] = React.useState<OrderNoteType>("note")

  // Bulk edit state
  const [bulkEditMode, setBulkEditMode] = React.useState(false)
  const [selectedOrderIds, setSelectedOrderIds] = React.useState<Set<number>>(new Set())
  const [bulkNoteDialogOpen, setBulkNoteDialogOpen] = React.useState(false)
  const [bulkNoteDefaultType, setBulkNoteDefaultType] = React.useState<OrderNoteType>("note")

  // Check if incomplete filter exists in the URL
  const filtersParam = searchParams.get("filters")
  const filters: FilterType[] = filtersParam
    ? (JSON.parse(decodeURIComponent(filtersParam)) as FilterType[])
    : []
  const showIncomplete = filters.some(
    (filter) => filter.id === "orderStatus" && filter.value?.includes("incomplete")
  )

  // Get current page and perPage from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const _perPage = parseInt(searchParams.get('perPage') || '25', 10)

  // Track previous search params to detect changes
  const prevSearchParamsRef = React.useRef<string | null>(null)
  const refreshTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  /**
   * Trigger router refresh when URL params change
   */
  React.useEffect(() => {
    const currentParams = searchParams.toString()

    if (prevSearchParamsRef.current === null) {
      prevSearchParamsRef.current = currentParams
      return
    }

    if (prevSearchParamsRef.current !== currentParams) {
      prevSearchParamsRef.current = currentParams

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      refreshTimeoutRef.current = setTimeout(() => {
        setIsRefreshing(true)
        router.refresh()
        setTimeout(() => setIsRefreshing(false), 500)
      }, 300)
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [searchParams, router])

  // Prefetch next page
  React.useEffect(() => {
    if (currentPage < pageCount) {
      const params = new URLSearchParams(searchParams)
      params.set('page', String(currentPage + 1))
      router.prefetch(`?${params.toString()}`)
    }
  }, [currentPage, pageCount, searchParams, router])

  // Stable toggle function
  const handleToggleRow = React.useCallback((rowId: number) => {
    setExpandedRowId((current) => current === rowId ? null : rowId)
  }, [])

  /**
   * Handle toggling test order status
   */
  const handleToggleTestOrder = React.useCallback(async (orderId: number) => {
    try {
      const result = await ordersTableToggleTestOrderAction(orderId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error toggling test order:", error)
      toast.error("Failed to toggle test order")
    }
  }, [router])

  /**
   * Handle opening notes dialog
   */
  const handleOpenNotes = React.useCallback((orderId: number, notes: unknown, defaultType?: OrderNoteType) => {
    setNotesDialogOrderId(orderId)
    setNotesDialogInitialNotes(notes)
    setNotesDialogDefaultType(defaultType || "note")
    setNotesDialogOpen(true)
  }, [])

  /**
   * Handle toggling error status
   */
  const handleToggleError = React.useCallback(async (orderId: number) => {
    try {
      const result = await ordersTableToggleErrorAction(orderId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error toggling error status:", error)
      toast.error("Failed to toggle error status")
    }
  }, [router])

  /**
   * Toggle selection of an order in bulk edit mode
   */
  const handleToggleSelection = React.useCallback((orderId: number) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }, [])

  /**
   * Select all orders on current page
   */
  const handleSelectAll = React.useCallback(() => {
    const currentPageOrderIds = data.map((order) => order.id)
    const allSelected = currentPageOrderIds.every((id) => selectedOrderIds.has(id))

    if (allSelected) {
      // Deselect all on current page
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        currentPageOrderIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      // Select all on current page
      setSelectedOrderIds((prev) => {
        const next = new Set(prev)
        currentPageOrderIds.forEach((id) => next.add(id))
        return next
      })
    }
  }, [data, selectedOrderIds])

  /**
   * Check if all orders on current page are selected
   */
  const allSelected = React.useMemo(() => {
    if (data.length === 0) return false
    return data.every((order) => selectedOrderIds.has(order.id))
  }, [data, selectedOrderIds])

  /**
   * Exit bulk edit mode and clear selection
   */
  const exitBulkEditMode = React.useCallback(() => {
    setBulkEditMode(false)
    setSelectedOrderIds(new Set())
  }, [])

  /**
   * Bulk set test status
   */
  const handleBulkSetTest = React.useCallback(async (isTest: boolean) => {
    const orderIds = Array.from(selectedOrderIds)
    try {
      const result = await ordersTableBulkSetTestAction(orderIds, isTest)
      if (result.success) {
        toast.success(result.message)
        exitBulkEditMode()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error bulk setting test status:", error)
      toast.error("Failed to update orders")
    }
  }, [selectedOrderIds, router, exitBulkEditMode])

  /**
   * Bulk set error status
   */
  const handleBulkSetError = React.useCallback(async (hasError: boolean) => {
    const orderIds = Array.from(selectedOrderIds)
    try {
      const result = await ordersTableBulkSetErrorAction(orderIds, hasError)
      if (result.success) {
        toast.success(result.message)
        exitBulkEditMode()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error bulk setting error status:", error)
      toast.error("Failed to update orders")
    }
  }, [selectedOrderIds, router, exitBulkEditMode])

  /**
   * Open bulk note dialog
   */
  const handleOpenBulkNoteDialog = React.useCallback((noteType: OrderNoteType) => {
    setBulkNoteDefaultType(noteType)
    setBulkNoteDialogOpen(true)
  }, [])

  /**
   * Handle bulk add note
   */
  const handleBulkAddNote = React.useCallback(async (noteText: string, noteType: OrderNoteType) => {
    const orderIds = Array.from(selectedOrderIds)
    try {
      const result = await ordersTableBulkAddNoteAction(orderIds, noteText, noteType)
      if (result.success) {
        toast.success(result.message)
        setBulkNoteDialogOpen(false)
        exitBulkEditMode()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error bulk adding note:", error)
      toast.error("Failed to add notes")
    }
  }, [selectedOrderIds, router, exitBulkEditMode])

  // Memoize columns
  const columns = React.useMemo(() => {
    const resortName = resort?.name.toLowerCase()
    return getOrdersTableColumns({
      setRowAction,
      isMobile,
      resort: resortName,
      expandedRowId,
      setExpandedRowId: handleToggleRow,
      onToggleTestOrder: handleToggleTestOrder,
      onOpenNotes: handleOpenNotes,
      onToggleError: handleToggleError,
      bulkEditMode,
      selectedOrderIds,
      onToggleSelection: handleToggleSelection,
      onSelectAll: handleSelectAll,
      allSelected,
    })
  }, [isMobile, resort?.name, handleToggleRow, expandedRowId, handleToggleTestOrder, handleOpenNotes, handleToggleError, bulkEditMode, selectedOrderIds, handleToggleSelection, handleSelectAll, allSelected])

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
    shallow: true,
    clearOnDefault: true,
  })

  const toggleIncompleteOrders = () => {
    const params = new URLSearchParams(searchParams)
    const currentFilters: FilterType[] = filtersParam
      ? (JSON.parse(decodeURIComponent(filtersParam)) as FilterType[])
      : []

    if (showIncomplete) {
      const newFilters = currentFilters.filter(
        (filter) =>
          !(filter.id === "orderStatus" && filter.value?.includes("incomplete"))
      )
      if (newFilters.length === 0) {
        params.delete("filters")
      } else {
        params.set("filters", JSON.stringify(newFilters))
      }
    } else {
      const newFilter: FilterType = {
        id: "orderStatus",
        value: ["incomplete"],
        type: "multi-select",
        operator: "neq",
        rowId: Math.random().toString(36).substring(2, 8),
      }
      currentFilters.push(newFilter)
      params.set("filters", JSON.stringify(currentFilters))
    }

    if (!params.has("perPage")) {
      params.set("perPage", "25")
    }

    router.push(`?${params.toString()}`)
  }

  React.useEffect(() => {
    if (showIncomplete) {
      table.getColumn("orderStatus")?.setFilterValue("incomplete")
    } else {
      table.getColumn("orderStatus")?.setFilterValue(undefined)
    }
  }, [showIncomplete, table])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
      if (expandedRowId === null) return

      event.preventDefault()

      const rows = table.getRowModel().rows
      const currentIndex = rows.findIndex((row) => row.original.id === expandedRowId)

      if (currentIndex === -1) return

      if (event.key === "ArrowDown" && currentIndex < rows.length - 1) {
        setExpandedRowId(rows[currentIndex + 1]?.original.id ?? null)
      } else if (event.key === "ArrowUp" && currentIndex > 0) {
        setExpandedRowId(rows[currentIndex - 1]?.original.id ?? null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [expandedRowId, table])

  return (
    <div className="size-full px-2 pb-4">
      <UniversalDataTableWrapper
        table={table}
        columns={columns}
        onRevalidate={revalidateOrders}
        storageKey="ordersLastRefreshed"
        exportFilename="orders"
        isLoading={isRefreshing}
        customActions={
          <div className="flex flex-wrap items-center gap-2">
            {bulkEditMode ? (
              <>
                {/* Bulk Edit Toolbar */}
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5">
                  <span className="text-sm font-medium">
                    {selectedOrderIds.size} selected
                  </span>

                  {/* Test Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" disabled={selectedOrderIds.size === 0}>
                        <FlaskConical className="size-4" />
                        Test
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleBulkSetTest(true)}>
                        Mark as Test
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkSetTest(false)}>
                        Mark as Live
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Error Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" disabled={selectedOrderIds.size === 0}>
                        <AlertTriangle className="size-4" />
                        Error
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleBulkSetError(true)}>
                        Set Error Flag
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkSetError(false)}>
                        Clear Error Flag
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Note Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" disabled={selectedOrderIds.size === 0}>
                        <StickyNote className="size-4" />
                        Note
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleOpenBulkNoteDialog("note")}>
                        Add Note
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenBulkNoteDialog("error")} className="text-destructive">
                        Add Error Note
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Exit Bulk Edit */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exitBulkEditMode}
                  className="gap-2"
                >
                  <X className="size-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                {/* Bulk Edit Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkEditMode(true)}
                  className={`${isMobile ? "w-full" : ""} gap-2`}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Bulk Edit
                </Button>

                {/* Hide Incomplete Orders Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleIncompleteOrders}
                  className={`${isMobile ? "w-full" : ""} gap-2`}
                >
                  {showIncomplete ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                  {showIncomplete ? "Show Incomplete" : "Hide Incomplete"}
                </Button>
              </>
            )}
          </div>
        }
      >
        {isMobile ? (
          <UniversalDataTable
            table={table}
            renderMobileCard={(row) => <OrdersMobileCard row={row} />}
            enableMobileCards={true}
          />
        ) : (
          <OrdersCustomTable
            table={table}
            expandedRowId={expandedRowId}
          />
        )}
      </UniversalDataTableWrapper>

      {/* Notes Dialog */}
      {notesDialogOrderId && (
        <OrdersTableNotesDialog
          orderId={notesDialogOrderId}
          open={notesDialogOpen}
          onOpenChange={(open) => {
            setNotesDialogOpen(open)
            if (!open) {
              setNotesDialogOrderId(null)
              setNotesDialogInitialNotes(null)
              setNotesDialogDefaultType("note")
              router.refresh()
            }
          }}
          initialNotes={notesDialogInitialNotes}
          defaultNoteType={notesDialogDefaultType}
        />
      )}

      {/* Bulk Note Dialog */}
      <OrdersTableBulkNoteDialog
        open={bulkNoteDialogOpen}
        onOpenChange={setBulkNoteDialogOpen}
        selectedCount={selectedOrderIds.size}
        defaultNoteType={bulkNoteDefaultType}
        onSubmit={handleBulkAddNote}
      />
    </div>
  )
}
