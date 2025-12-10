/**
 * Create metadata for a text column
 * 
 * @description
 * Returns configuration metadata for text columns with filtering support.
 * Use this with DataTableColumnHeader in your column definitions.
 * 
 * @param config - Column configuration
 * @param config.filterLabel - Label for filter UI
 * @param config.filterPlaceholder - Placeholder text for filter input
 * @returns Column metadata for text filtering
 * 
 * @example
 * ```tsx
 * {
 *   accessorKey: 'name',
 *   header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
 *   meta: createTextColumnMeta({
 *     filterLabel: 'Name',
 *     filterPlaceholder: 'Search by name...'
 *   })
 * }
 * ```
 */
export function createTextColumnMeta(config: {
  filterLabel: string
  filterPlaceholder: string
}): {
  filterable: true
  filterType: 'text'
  filterLabel: string
  filterPlaceholder: string
} {
  return {
    filterable: true,
    filterType: 'text',
    filterLabel: config.filterLabel,
    filterPlaceholder: config.filterPlaceholder,
  }
}

