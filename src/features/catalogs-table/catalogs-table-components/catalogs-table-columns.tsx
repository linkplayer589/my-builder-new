/**
 * Column definitions for the catalogs table
 * Defines the structure, filtering, and rendering of catalog data columns
 */

import type { Catalog } from '@/db/schema'

import {
  filterColumnsForMobile,
  createTextColumn,
  createNumberColumn,
  createDateColumn,
} from '@/components/data-table'

import type {
  TCatalogsTableColumnsProps,
  TCatalogsTableColumns,
} from '../catalogs-table-types/catalogs-table-types'

/**
 * Generates column definitions for the catalogs table
 * 
 * @description
 * Creates an array of column definitions for TanStack Table based on the
 * Catalog schema. Columns include ID, Resort ID, Version, Created At, and
 * Updated At. Each column supports sorting and filtering. On mobile devices,
 * only essential columns are shown to optimize screen space.
 * 
 * @param props - Column configuration props
 * @param props.setRowAction - Callback to set row action state (currently unused but available for future row actions)
 * @param props.isMobile - Whether the view is on a mobile device (filters columns for mobile)
 * @param props.resort - Optional resort name for filtering (currently unused but available for future filtering)
 * 
 * @returns Array of column definitions for TanStack Table
 * 
 * @example
 * ```tsx
 * const columns = getCatalogsTableColumns({
 *   setRowAction,
 *   isMobile: false,
 *   resort: 'mountain-resort'
 * })
 * ```
 * 
 * @remarks
 * - Mobile view shows: ID, Resort ID, and Created At columns only
 * - Desktop view shows all columns
 * - All columns support sorting via DataTableColumnHeader
 * - Date columns formatted as: YYYY-MM-DD HH:MM
 * - Commented out columns for productsData, consumerCategories, and validityCategories
 *   are available for future implementation
 * 
 * **Column Details**:
 * - **ID**: Text filter, unique catalog identifier
 * - **Resort ID**: Number filter, associated resort
 * - **Version**: Number filter, catalog version number
 * - **Created At**: Date filter, creation timestamp
 * - **Updated At**: Date filter, last update timestamp
 */
export function getCatalogsTableColumns({
  setRowAction: _setRowAction,
  isMobile,
  resort: _resort,
}: TCatalogsTableColumnsProps): TCatalogsTableColumns {
  // Define the columns using utility functions for consistency
  const columns: TCatalogsTableColumns = [
    // ID column - text type
    createTextColumn<Catalog>({
      accessorKey: 'id',
      headerTitle: 'ID',
      filterLabel: 'Catalog ID',
      filterPlaceholder: 'Enter catalog ID...',
    }),
    
    // Resort ID column - number type
    createNumberColumn<Catalog>({
      accessorKey: 'resortId',
      headerTitle: 'Resort ID',
      filterLabel: 'Resort ID',
      filterPlaceholder: 'Enter resort ID...',
    }),
    
    // Version column - number type
    createNumberColumn<Catalog>({
      accessorKey: 'version',
      headerTitle: 'Version',
      filterLabel: 'Version',
      filterPlaceholder: 'Enter version number...',
    }),
    // Future implementation: Product data column
    // {
    //   accessorKey: "productsData",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Products Data" />
    //   ),
    //   cell: ({ cell }) => {
    //     const value = cell.getValue() as SkiDataProduct[]
    //     return value?.length
    //       ? value.map((product) => product.name).join(", ")
    //       : "No Products"
    //   },
    // },

    // Future implementation: Consumer categories column
    // {
    //   accessorKey: "consumerCategories",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Consumer Categories" />
    //   ),
    //   cell: ({ cell }) => {
    //     const value = cell.getValue() as SkiDataConsumerCategory[]
    //     return value?.length
    //       ? value.map((category) => category.name).join(", ")
    //       : "No Categories"
    //   },
    // },

    // Future implementation: Validity categories column
    // {
    //   accessorKey: "validityCategories",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Validity Categories" />
    //   ),
    //   cell: ({ cell }) => {
    //     const value = cell.getValue() as SkidataValidityCategory[]
    //     return value?.length
    //       ? value.map((category) => category.name).join(", ")
    //       : "No Validity Categories"
    //   },
    // },
    
    // Created At column - date type with standard formatting
    createDateColumn<Catalog>({
      accessorKey: 'createdAt',
      headerTitle: 'Created At',
      filterLabel: 'Created Date',
      filterPlaceholder: 'Select created date...',
    }),
    
    // Updated At column - date type with standard formatting
    createDateColumn<Catalog>({
      accessorKey: 'updatedAt',
      headerTitle: 'Updated At',
      filterLabel: 'Updated Date',
      filterPlaceholder: 'Select updated date...',
    }),
  ]

  // Apply standard mobile column filtering
  return filterColumnsForMobile(columns, isMobile)
}

