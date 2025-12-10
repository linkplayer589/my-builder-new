"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { DataTableAdvancedFilterField } from "@/types"
import { type ColumnDef, type Table } from "@tanstack/react-table"
import { formatDistanceToNow } from "date-fns"
import {
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react"

import useRowExpansionAndMobile from "@/hooks/use-row-expansion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DataTableFilterList,
  DataTableSortList,
  DataTableViewOptions,
  exportTableToCSV,
  extractFilterFieldsFromColumns,
} from "@/components/data-table"

/**
 * Universal Data Table Wrapper
 *
 * Automatically provides refresh, export, filter, sort, and last updated functionality for any data table.
 * Simply wrap your data table component with this wrapper and pass the required props.
 *
 * Features:
 * - Automatic filter/sort extraction from column definitions
 * - Refresh button with cache invalidation
 * - Last updated timestamp (persisted in localStorage)
 * - Export to CSV functionality
 * - View options (column visibility)
 * - Custom action buttons support
 *
 * @example
 * ```tsx
 * <UniversalDataTableWrapper
 *   table={table}
 *   columns={columns}
 *   onRevalidate={revalidateOrders}
 *   storageKey="ordersLastRefreshed"
 *   exportFilename="orders"
 * >
 *   <OrdersDataTable table={table} />
 * </UniversalDataTableWrapper>
 * ```
 */
interface UniversalDataTableWrapperProps<TData> {
  /** The table instance from @tanstack/react-table */
  table: Table<TData>
  /** Column definitions to extract filter fields from */
  columns: ColumnDef<TData>[]
  /** Function to call when refreshing data (e.g., revalidateOrders) */
  onRevalidate: () => Promise<void>
  /** Unique storage key for localStorage to persist last refresh timestamp */
  storageKey: string
  /** Filename for CSV export (without extension) */
  exportFilename: string
  /** Whether the table is currently loading */
  isLoading?: boolean
  /** Custom action buttons to render before the export button */
  customActions?: React.ReactNode
  /** The data table component to render */
  children: React.ReactNode
  /** Additional CSS classes for the wrapper */
  className?: string
  /** Debounce time for filter/sort updates (default: 300ms) */
  debounceMs?: number
  /** Whether to use shallow routing for URL updates (default: true) */
  shallow?: boolean
}

export function UniversalDataTableWrapper<TData>({
  table,
  columns,
  onRevalidate,
  storageKey,
  exportFilename,
  isLoading,
  customActions,
  children,
  className,
  debounceMs = 300,
  shallow = true,
}: UniversalDataTableWrapperProps<TData>) {
  const router = useRouter()
  const { isMobile } = useRowExpansionAndMobile()
  const [isRevalidating, setIsRevalidating] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [, setCurrentTime] = useState(Date.now())
  const previousLoadingRef = useRef(false)

  // Automatically extract filter fields from column definitions
  const filterFields: DataTableAdvancedFilterField<TData>[] = useMemo(() => {
    return extractFilterFieldsFromColumns(columns)
  }, [columns])

  // Load the last refresh timestamp from localStorage on component mount
  useEffect(() => {
    const storedTimestamp = localStorage.getItem(storageKey)
    if (storedTimestamp) {
      setLastRefreshed(new Date(storedTimestamp))
    }
  }, [storageKey])

  // Update relative time display every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Update last refreshed timestamp when external loading completes
  useEffect(() => {
    const wasLoading = previousLoadingRef.current
    const currentlyLoading = Boolean(isLoading)

    if (
      wasLoading &&
      !currentlyLoading &&
      !isRevalidating &&
      typeof window !== "undefined"
    ) {
      const now = new Date()
      setLastRefreshed(now)
      window.localStorage.setItem(storageKey, now.toISOString())
    }

    previousLoadingRef.current = currentlyLoading
  }, [isLoading, isRevalidating, storageKey])

  /**
   * Handle refresh button click
   * Calls the revalidation function, updates timestamp, and refreshes the page
   */
  const handleRevalidate = async () => {
    setIsRevalidating(true)
    try {
      await onRevalidate()

      // Update and store the current timestamp
      const now = new Date()
      setLastRefreshed(now)
      localStorage.setItem(storageKey, now.toISOString())

      router.refresh()
    } finally {
      setIsRevalidating(false)
    }
  }

  /**
   * Wrapped onUpdate function for filter/sort changes
   * Updates timestamp and calls revalidate
   */
  const wrappedOnUpdate = async () => {
    setIsRevalidating(true)
    try {
      await onRevalidate()

      // Update timestamp for automatic updates too
      const now = new Date()
      setLastRefreshed(now)
      localStorage.setItem(storageKey, now.toISOString())

      router.refresh()
    } finally {
      setIsRevalidating(false)
    }
  }

  /**
   * Handle export button click
   * Exports the table data to CSV format
   */
  const handleExport = () => {
    exportTableToCSV(table, { filename: exportFilename })
  }

  // Format the last refreshed timestamp as relative time
  const formattedLastRefreshed = lastRefreshed
    ? formatDistanceToNow(lastRefreshed, {
        addSuffix: true,
        includeSeconds: true,
      })
    : "never"

  // Count active filters
  const activeFiltersCount = table.getState().columnFilters.length

  return (
    <div className={className}>
      {isMobile ? (
        // ==================== MOBILE LAYOUT ====================
        <div className="mb-4 space-y-3">
          {/* Top: Last Refreshed + Refresh Button */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Refreshed {formattedLastRefreshed}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevalidate}
              disabled={isRevalidating || isLoading}
              className="shrink-0"
            >
              <RefreshCw
                className={`size-4 ${isRevalidating || isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Filters Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative w-full"
          >
            <SlidersHorizontal className="mr-2 size-4" />
            Filters & Sort
            {showFilters ? (
              <ChevronUp className="ml-auto size-4" />
            ) : (
              <ChevronDown className="ml-auto size-4" />
            )}
            {activeFiltersCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Collapsible Filters & Controls */}
          {showFilters && (
            <Card>
              <CardContent className="space-y-4 p-4">
                {/* Filters Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Filters</h4>
                  <DataTableFilterList
                    table={table}
                    filterFields={filterFields}
                    debounceMs={debounceMs}
                    shallow={shallow}
                    onUpdate={wrappedOnUpdate}
                  />
                </div>

                <Separator />

                {/* Sort Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Sort</h4>
                  <DataTableSortList
                    table={table}
                    debounceMs={debounceMs}
                    shallow={shallow}
                    onUpdate={wrappedOnUpdate}
                  />
                </div>

                <Separator />

                {/* View Options */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Columns</h4>
                  <DataTableViewOptions table={table} />
                </div>

                <Separator />

                {/* Actions Section */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Actions</h4>
                  <div className="flex flex-col gap-2">
                    {/* Export Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={isLoading}
                      className="w-full gap-2"
                    >
                      <Download className="size-4" />
                      Export
                    </Button>

                    {/* Custom Actions */}
                    {customActions}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        // ==================== DESKTOP LAYOUT ====================
        <div className="mb-4 flex w-full items-center justify-between gap-2 overflow-auto pb-4 pt-2">
          {/* Left side: Filters and Sorting */}
          <div className="flex items-center gap-2">
            <DataTableFilterList
              table={table}
              filterFields={filterFields}
              debounceMs={debounceMs}
              shallow={shallow}
              onUpdate={wrappedOnUpdate}
            />
            <DataTableSortList
              table={table}
              debounceMs={debounceMs}
              shallow={shallow}
              onUpdate={wrappedOnUpdate}
            />
          </div>

          {/* Right side: Last Refreshed → Refresh → Columns → Export → Actions */}
          <div className="flex items-center gap-2">
            {/* Last Updated Timestamp */}
            <div className="flex items-center gap-2 whitespace-nowrap text-xs text-muted-foreground">
              <span>Refreshed {formattedLastRefreshed}</span>
            </div>

            {/* Refresh Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleRevalidate}
                    disabled={isRevalidating || isLoading}
                  >
                    <RefreshCw
                      className={`size-4 ${isRevalidating || isLoading ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* View Options (Columns) */}
            <DataTableViewOptions table={table} />

            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
              disabled={isLoading}
            >
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>

            {/* Custom Actions */}
            {customActions}
          </div>
        </div>
      )}

      {/* Data Table */}
      {children}
    </div>
  )
}
