import type { 
  DataTableAdvancedFilterField,
  FilterableColumnMeta,
  StringKeyOf
} from "@/types/index"
import { type ColumnDef } from "@tanstack/react-table"

/**
 * Extract filter fields from column definitions based on their metadata.
 *
 * This function processes an array of column definitions and extracts filter configuration
 * from columns that have filterable metadata. It automatically determines filter types,
 * labels, and options based on the column's meta property.
 *
 * @param columns - An array of column definitions with optional filter metadata.
 * @returns An array of DataTableAdvancedFilterField configurations.
 * 
 * @example
 * ```ts
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: "name",
 *     header: "Name",
 *     meta: {
 *       filterable: true,
 *       filterType: "text",
 *       filterLabel: "User Name",
 *       filterPlaceholder: "Search by name..."
 *     }
 *   },
 *   {
 *     accessorKey: "status", 
 *     header: "Status",
 *     meta: {
 *       filterable: true,
 *       filterType: "select",
 *       filterOptions: [
 *         { label: "Active", value: "active" },
 *         { label: "Inactive", value: "inactive" }
 *       ]
 *     }
 *   }
 * ];
 * 
 * const filterFields = extractFilterFieldsFromColumns(columns);
 * ```
 */
export function extractFilterFieldsFromColumns<TData>(
  columns: ColumnDef<TData, unknown>[]
): DataTableAdvancedFilterField<TData>[] {
  return columns
    .filter((column) => {
      // Only include columns that have filterable metadata and are explicitly marked as filterable
      const meta = column.meta as FilterableColumnMeta<TData> | undefined
      return meta?.filterable === true && meta?.filterType && 'accessorKey' in column && column.accessorKey
    })
    .map((column) => {
      const meta = column.meta as FilterableColumnMeta<TData>
      const accessorKey = (column as { accessorKey: StringKeyOf<TData> }).accessorKey
      
      // Use meta label or fallback to header or formatted accessor key
      const label = meta.filterLabel || 
        (typeof column.header === 'string' ? column.header : 
         accessorKey.toString().replace(/([a-z])([A-Z])/g, '$1 $2')
         .replace(/^./, str => str.toUpperCase()))

      return {
        id: accessorKey,
        label,
        type: meta.filterType,
        placeholder: meta.filterPlaceholder,
        options: meta.filterOptions,
      } as DataTableAdvancedFilterField<TData>
    })
}

