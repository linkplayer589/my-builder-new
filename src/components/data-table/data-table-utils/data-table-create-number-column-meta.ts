/**
 * Create metadata for a number column
 * 
 * @description
 * Returns configuration metadata for number columns with filtering support.
 * Use this with DataTableColumnHeader in your column definitions.
 * 
 * @param config - Column configuration
 * @param config.filterLabel - Label for filter UI
 * @param config.filterPlaceholder - Placeholder text for filter input
 * @returns Column metadata for number filtering
 * 
 * @example
 * ```tsx
 * {
 *   accessorKey: 'resortId',
 *   header: ({ column }) => <DataTableColumnHeader column={column} title="Resort ID" />,
 *   meta: createNumberColumnMeta({
 *     filterLabel: 'Resort ID',
 *     filterPlaceholder: 'Enter resort ID...'
 *   })
 * }
 * ```
 */
export function createNumberColumnMeta(config: {
  filterLabel: string
  filterPlaceholder: string
}): {
  filterable: true
  filterType: 'number'
  filterLabel: string
  filterPlaceholder: string
} {
  return {
    filterable: true,
    filterType: 'number',
    filterLabel: config.filterLabel,
    filterPlaceholder: config.filterPlaceholder,
  }
}

