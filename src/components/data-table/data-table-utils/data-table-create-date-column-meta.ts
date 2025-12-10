/**
 * Create metadata for a date column
 * 
 * @description
 * Returns configuration metadata for date columns with consistent filtering.
 * Use this with DataTableColumnHeader in your column definitions.
 * 
 * @param config - Column configuration
 * @param config.filterLabel - Label for filter UI
 * @param config.filterPlaceholder - Placeholder text for filter input
 * @returns Column metadata for date filtering
 * 
 * @example
 * ```tsx
 * {
 *   accessorKey: 'createdAt',
 *   header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
 *   cell: ({ cell }) => formatTableDate(cell.getValue() as string | Date),
 *   meta: createDateColumnMeta({
 *     filterLabel: 'Created Date',
 *     filterPlaceholder: 'Select created date...'
 *   })
 * }
 * ```
 */
export function createDateColumnMeta(config: {
  filterLabel: string
  filterPlaceholder: string
}): {
  filterable: true
  filterType: 'date'
  filterLabel: string
  filterPlaceholder: string
} {
  return {
    filterable: true,
    filterType: 'date',
    filterLabel: config.filterLabel,
    filterPlaceholder: config.filterPlaceholder,
  }
}

