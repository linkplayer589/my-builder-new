'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../data-table-components/data-table-column-header'
import { createTextColumnMeta } from './data-table-create-text-column-meta'

/**
 * Create a complete text column definition
 */
export function createTextColumn<TData>(config: {
  accessorKey: keyof TData
  headerTitle: string
  filterLabel: string
  filterPlaceholder: string
}): ColumnDef<TData> {
  return {
    accessorKey: config.accessorKey as string,
    header: ({ column }) => <DataTableColumnHeader column={column} title={config.headerTitle} />,
    cell: ({ cell }) => cell.getValue() as string,
    meta: createTextColumnMeta({
      filterLabel: config.filterLabel,
      filterPlaceholder: config.filterPlaceholder,
    }),
  }
}

