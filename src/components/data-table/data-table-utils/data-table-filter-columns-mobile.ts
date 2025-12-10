import type { ColumnDef } from '@tanstack/react-table'

/**
 * Filter columns for mobile display
 * 
 * @description
 * Standard mobile column filtering that shows:
 * - First 2 columns (usually ID and primary field)
 * - Second to last column (usually createdAt or primary date)
 * 
 * This provides a consistent mobile experience across all tables while
 * showing the most important information.
 * 
 * @param columns - Array of column definitions
 * @param isMobile - Whether the current viewport is mobile
 * @returns Filtered columns array (all columns for desktop, subset for mobile)
 * 
 * @example
 * ```tsx
 * export function getTableColumns({ isMobile }): ColumnDef<Data>[] {
 *   const columns: ColumnDef<Data>[] = [
 *     // ... column definitions
 *   ]
 *   
 *   return filterColumnsForMobile(columns, isMobile)
 * }
 * ```
 */
export function filterColumnsForMobile<TData>(
  columns: ColumnDef<TData>[],
  isMobile: boolean
): ColumnDef<TData>[] {
  if (!isMobile) return columns
  
  // Show first 2 columns + second-to-last column (typically createdAt)
  return columns.filter(
    (column, index) => index < 2 || index === columns.length - 2
  )
}

