import * as React from 'react'
import { dbGetCatalogs } from '@/db/server-actions/catalog-actions/db-get-catalog-by-resort-id'
import { getResortIdFromName } from '@/features/resorts/resort-utils'
import { getValidFilters } from '@/components/data-table'
import { searchParamsCache } from '@/lib/search-params'

import type { SearchParams } from '@/types/index'
import { CatalogsTableClient } from './catalogs-table-client'

/**
 * Server component wrapper for the catalogs table
 * 
 * @description
 * This is a server component that handles data fetching internally, making the
 * catalogs table feature completely portable. Simply import and use without
 * needing to handle data fetching in the parent component.
 * 
 * The component:
 * - Fetches catalog data based on resort name
 * - Handles search params for filtering, sorting, and pagination
 * - Validates filters
 * - Passes data to the client table component
 * 
 * @param props - Component props
 * @param props.resortName - Name of the resort to fetch catalogs for (can be string or Promise)
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * 
 * @returns Promise resolving to the catalogs table component
 * 
 * @example
 * ```tsx
 * // In any server component page (Next.js 15+)
 * import { CatalogsTable } from '@/features/catalogs-table'
 * 
 * export default async function CatalogsPage({
 *   searchParams,
 *   params,
 * }: {
 *   searchParams: Promise<SearchParams>
 *   params: Promise<{ resortName: string }>
 * }) {
 *   const { resortName } = await params
 *   
 *   return (
 *     <div>
 *       <h1>Catalogs</h1>
 *       <CatalogsTable 
 *         resortName={resortName}
 *         searchParams={searchParams}
 *       />
 *     </div>
 *   )
 * }
 * ```
 * 
 * @remarks
 * - Server component (no 'use client' directive)
 * - Handles all data fetching internally
 * - Fully portable - just copy to another project with same db structure
 * - Integrates with resort context via resortName param
 * - Supports filtering, sorting, and pagination via searchParams
 * - Caches data for optimal performance
 * - Compatible with Next.js 15+ async params
 * 
 * **Portability**:
 * This component is designed to be copied between projects. As long as the
 * target project has:
 * - Same database schema (catalogs table)
 * - Resort utilities (getResortIdFromName)
 * - Search params utilities (searchParamsCache)
 * - The same data table components
 * 
 * The component will work without modification.
 */
export async function CatalogsTable({
  resortName,
  searchParams,
}: {
  /** Name of the resort to fetch catalogs for */
  resortName: string | Promise<string>
  /** URL search parameters for filtering, sorting, and pagination */
  searchParams: Promise<SearchParams>
}) {
  // Await resortName if it's a Promise (Next.js 15+ compatibility)
  const resolvedResortName = typeof resortName === 'string' ? resortName : await resortName
  
  // Parse search params and validate filters
  const search = searchParamsCache.parse(await searchParams)
  const validFilters = getValidFilters(search.filters)
  
  // Get resort ID from name
  const resortId = await getResortIdFromName(resolvedResortName)

  // Fetch catalogs data with all search parameters
  const promises = Promise.all([
    dbGetCatalogs({
      ...search,
      filters: validFilters,
      resortId: Number(resortId),
    }),
  ])

  // Render client table component with fetched data
  return <CatalogsTableClient promises={promises} />
}

