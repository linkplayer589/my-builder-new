'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../data-table-components/data-table-column-header'
import { createDateColumnMeta } from './data-table-create-date-column-meta'
import { formatTableDate } from './data-table-format-date'

/**
 * Create a complete date column definition
 */
export function createDateColumn<TData>(config: {
  accessorKey: keyof TData
  headerTitle: string
  filterLabel: string
  filterPlaceholder: string
}): ColumnDef<TData> {
  return {
    accessorKey: config.accessorKey as string,
    header: ({ column }) => <DataTableColumnHeader column={column} title={config.headerTitle} />,
    cell: ({ cell }) => formatTableDate(cell.getValue() as string | Date),
    meta: createDateColumnMeta({
      filterLabel: config.filterLabel,
      filterPlaceholder: config.filterPlaceholder,
    }),
  }
}

