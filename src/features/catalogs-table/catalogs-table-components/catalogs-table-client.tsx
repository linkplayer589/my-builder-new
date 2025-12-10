'use client'

import * as React from 'react'
import type { Catalog } from '@/db/schema'
import { useResort } from '@/features/resorts'
import type { DataTableRowAction } from '@/types'

import { useDataTable } from '@/components/data-table'
import { useIsMobile } from '@/hooks/use-mobile'
import { UniversalDataTableWrapper } from '@/components/data-table'
import { UniversalDataTable } from '@/components/data-table'

import type { TCatalogsTableProps } from '../catalogs-table-types/catalogs-table-types'
import { getCatalogsTableColumns } from './catalogs-table-columns'

/**
 * Client-side catalogs table component
 * 
 * @description
 * Client component that renders the catalogs table with interactive features:
 * - Sorting by any column
 * - Advanced filtering
 * - Pagination
 * - Responsive mobile layout
 * - Data refresh/revalidation
 * - Export functionality
 * 
 * This is the client-side rendering component used by the CatalogsTable
 * server component. It handles all interactive table features and state
 * management.
 * 
 * @param props - Component props
 * @param props.promises - Promise that resolves to catalog data and pagination info
 * 
 * @returns React component displaying the catalogs table
 * 
 * @example
 * ```tsx
 * // Typically used by the CatalogsTable server component
 * // Not meant to be used directly in pages
 * <CatalogsTableClient promises={catalogsPromise} />
 * ```
 * 
 * @remarks
 * - Requires 'use client' directive (client component)
 * - Uses React.use() for promise unwrapping (React 18+)
 * - Integrates with resort context for resort-specific data
 * - Responsive: shows limited columns on mobile
 * - Supports advanced filtering via UniversalDataTableWrapper
 * - Data persists refresh state in localStorage with key 'catalogsLastRefreshed'
 * - Exports data with filename 'catalogs'
 * 
 * **Dependencies**:
 * - `@/features/resorts` - Resort context integration
 * - `@/hooks/use-data-table` - Table state management
 * - `@/hooks/use-mobile` - Mobile detection
 * - `@/components/data-table` - Universal table components
 * 
 * **State Management**:
 * - Row actions state (for future row-level operations)
 * - Table state managed by useDataTable hook
 * - Columns memoized based on mobile state and resort
 * 
 * **Performance**:
 * - Columns memoized to prevent unnecessary re-renders
 * - Table uses shallow comparison for better performance
 * - Data fetched server-side and streamed to client
 */
export function CatalogsTableClient({ promises }: TCatalogsTableProps) {
  // Get current resort context
  const { resort } = useResort()
  const isMobile = useIsMobile()

  // Unwrap the promises to get data and page count
  const [{ data, pageCount }] = React.use(promises) as unknown as [
    { data: Catalog[]; pageCount: number },
  ]

  // State for row actions (future implementation)
  const [_rowAction, setRowAction] =
    React.useState<DataTableRowAction<Catalog> | null>(null)

  // Memoize columns to prevent unnecessary recalculations
  const columns = React.useMemo(() => {
    const resortName = resort?.name.toLowerCase()
    return getCatalogsTableColumns({
      setRowAction,
      isMobile,
      resort: resortName,
    })
  }, [isMobile, resort?.name])

  // Setup the table using the data, columns, and configuration
  const { table } = useDataTable<Catalog>({
    data,
    columns,
    pageCount: pageCount,
    filterFields: [],
    enableAdvancedFilter: true,
    initialState: {
      columnFilters: [],
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: true,
    clearOnDefault: true,
  })

  return (
    <UniversalDataTableWrapper
      table={table}
      columns={columns}
      onRevalidate={async () => {
        // No revalidation needed for catalogs table
        // Data is fetched server-side and passed as props
      }}
      storageKey="catalogsLastRefreshed"
      exportFilename="catalogs"
    >
      <UniversalDataTable table={table} />
    </UniversalDataTableWrapper>
  )
}

