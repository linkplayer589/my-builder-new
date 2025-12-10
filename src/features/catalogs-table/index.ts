/**
 * Catalogs Table feature exports
 * 
 * This module provides components and utilities for displaying and managing
 * catalog data in a table format with advanced filtering, sorting, and pagination.
 * 
 * @module features/catalogs-table
 * 
 * @example
 * ```tsx
 * // Import the main table component
 * import { CatalogsTable } from '@/features/catalogs-table'
 * 
 * // Use in a server component
 * export default async function CatalogsPage() {
 *   const catalogsData = await getCatalogs()
 *   return <CatalogsTable promises={Promise.resolve([catalogsData])} />
 * }
 * ```
 */

// Export all catalogs table components
export * from './catalogs-table-components'

// Export all catalogs table types
export * from './catalogs-table-types/catalogs-table-types'

