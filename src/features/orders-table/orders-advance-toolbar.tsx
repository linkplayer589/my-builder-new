"use client"

import * as React from "react"
import { type Table } from "@tanstack/react-table"

import type { DataTableAdvancedFilterField } from "@/types/index"
import { cn } from "@/lib/utils"
import useRowExpansionAndMobile from "@/hooks/use-row-expansion"
import { DataTableFilterList } from "@/components/data-table"
import { DataTableSortList } from "@/components/data-table"
import { DataTableViewOptions } from "@/components/data-table"

interface OrdersAdvanceToolBarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type Table<TData>
   */
  table: Table<TData>

  /**
   * An array of filter field configurations for the data table.
   * @type DataTableAdvancedFilterField<TData>[]
   * @example
   * const filterFields = [
   *   {
   *     id: 'name',
   *     label: 'Name',
   *     type: 'text',
   *     placeholder: 'Filter by name...'
   *   },
   *   {
   *     id: 'status',
   *     label: 'Status',
   *     type: 'select',
   *     options: [
   *       { label: 'Active', value: 'active', count: 10 },
   *       { label: 'Inactive', value: 'inactive', count: 5 }
   *     ]
   *   }
   * ]
   */
  filterFields: DataTableAdvancedFilterField<TData>[]

  /**
   * Debounce time (ms) for filter updates to enhance performance during rapid input.
   * @default 300
   */
  debounceMs?: number

  /**
   * Shallow mode keeps query states client-side, avoiding server calls.
   * Setting to `false` triggers a network request with the updated querystring.
   * @default true
   */
  shallow?: boolean

  /**
   * Callback function to trigger data revalidation when filters are updated
   */
  onUpdate?: () => Promise<void>
}

export function OrdersAdvanceToolBar<TData>({
  table,
  filterFields = [],
  debounceMs = 300,
  shallow = true,
  onUpdate,
  children,
  className,
  ...props
}: OrdersAdvanceToolBarProps<TData>) {
  const { isMobile } = useRowExpansionAndMobile()
  return (
    <div
      className={cn(
      `flex w-full justify-end ${isMobile ? "flex-col" : ""} gap-2 pb-4 pt-2`,
      className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
      <DataTableViewOptions table={table} />
      {children}
      </div>
      <div className="flex items-center gap-2">
      <DataTableFilterList
        table={table}
        filterFields={filterFields}
        debounceMs={debounceMs}
        shallow={shallow}
        onUpdate={onUpdate}
      />
      <DataTableSortList
        table={table}
        debounceMs={debounceMs}
        shallow={shallow}
        onUpdate={onUpdate}
      />
      </div>

      
    </div>
  )
}
