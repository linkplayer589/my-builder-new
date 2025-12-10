/**
 * Data Table Component - Public API
 * 
 * Self-contained, portable data table system with all utilities and hooks included.
 * 
 * @example
 * ```tsx
 * import {
 *   useDataTable,
 *   formatTableDate,
 *   filterColumnsForMobile,
 *   exportTableToCSV
 * } from '@/components/data-table'
 * ```
 */

// Core hooks
export { useDataTable } from './data-table-hooks/data-table-use-data-table'

// Utilities
export { formatTableDate } from './data-table-utils/data-table-format-date'
export { filterColumnsForMobile } from './data-table-utils/data-table-filter-columns-mobile'
export { createDateColumnMeta } from './data-table-utils/data-table-create-date-column-meta'
export { createTextColumnMeta } from './data-table-utils/data-table-create-text-column-meta'
export { createNumberColumnMeta } from './data-table-utils/data-table-create-number-column-meta'
export { truncateText } from './data-table-utils/data-table-truncate-text'
export { formatKeyToLabel } from './data-table-utils/data-table-format-key-to-label'
export { MOBILE_COLUMN_STRATEGY } from './data-table-utils/data-table-mobile-column-strategy'

// Library functions
export { getCommonPinningStyles } from './data-table-lib/data-table-get-common-pinning-styles'
export { getDefaultFilterOperator } from './data-table-lib/data-table-get-default-filter-operator'
export { getFilterOperators } from './data-table-lib/data-table-get-filter-operators'
export { getValidFilters } from './data-table-lib/data-table-get-valid-filters'
export { extractFilterFieldsFromColumns } from './data-table-lib/data-table-extract-filter-fields'

// Export functionality
export { exportTableToCSV } from './data-table-export/data-table-export-to-csv'

// Components
export { DataTableColumnHeader } from './data-table-components/data-table-column-header'
export { DataTable } from './data-table-components/data-table'
export { DataTablePagination } from './data-table-components/data-table-pagination'
export { DataTableSkeleton } from './data-table-components/data-table-skeleton'
export { UniversalDataTable } from './data-table-components/universal-data-table'
export { UniversalDataTableWrapper } from './data-table-components/universal-data-table-wrapper'
export { 
  UniversalTableCard,
  CardField,
  CardSection,
  CardBadgeGroup
} from './data-table-components/universal-table-card'

export { DataTableFilterList } from './data-table-components/data-table-filter-list'
export { DataTableSortList } from './data-table-components/data-table-sort-list'
export { DataTableViewOptions } from './data-table-components/data-table-view-options'

// Column creator utilities
export { createTextColumn } from './data-table-utils/data-table-create-text-column'
export { createNumberColumn } from './data-table-utils/data-table-create-number-column'
export { createDateColumn } from './data-table-utils/data-table-create-date-column'
export { DataTableFacetedFilter } from './data-table-components/data-table-faceted-filter'
export { DataTableToolbar } from './data-table-components/data-table-toolbar'
export { DataTableAdvancedToolbar } from './data-table-components/data-table-advanced-toolbar'

// Backwards compatibility alias
export { DataTableAdvancedToolbar as TableFilterSortWrapper } from './data-table-components/data-table-advanced-toolbar'