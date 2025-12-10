'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../data-table-components/data-table-column-header'
import { createNumberColumnMeta } from './data-table-create-number-column-meta'

/**
 * Create a complete number column definition
 */
export function createNumberColumn<TData>(config: {
  accessorKey: keyof TData
  headerTitle: string
  filterLabel: string
  filterPlaceholder: string
}): ColumnDef<TData> {
  return {
    accessorKey: config.accessorKey as string,
    header: ({ column }) => <DataTableColumnHeader column={column} title={config.headerTitle} />,
    cell: ({ cell }) => cell.getValue() as number,
    meta: createNumberColumnMeta({
      filterLabel: config.filterLabel,
      filterPlaceholder: config.filterPlaceholder,
    }),
  }
}

