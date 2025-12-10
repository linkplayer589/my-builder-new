/**
 * Type definitions for catalogs-table feature
 * Includes types for table configuration, props, and data structures
 */

import type { Catalog } from '@/db/schema'
import type { DataTableRowAction } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

/**
 * Props for the CatalogsTable component
 */
export type TCatalogsTableProps = {
  /** Promise that resolves to catalog data and page count */
  promises: Promise<
    [
      {
        /** Array of catalog records */
        data: Catalog[]
        /** Total number of pages for pagination */
        pageCount: number
      },
    ]
  >
}

/**
 * Props for getCatalogsTableColumns function
 */
export type TCatalogsTableColumnsProps = {
  /** Callback to set row action state */
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Catalog> | null>
  >
  /** Whether the view is on mobile device */
  isMobile: boolean
  /** Optional resort name for filtering/display */
  resort?: string
}

/**
 * Return type for getCatalogsTableColumns function
 */
export type TCatalogsTableColumns = ColumnDef<Catalog>[]

/**
 * Catalog data structure (re-exported from schema for convenience)
 */
export type TCatalog = Catalog

