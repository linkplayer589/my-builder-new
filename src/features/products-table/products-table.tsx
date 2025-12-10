import * as React from 'react'
import { dbGetProducts } from '@/db/server-actions/product-actions/db-get-products'
import { getResortIdFromName } from '@/features/resorts/resort-utils'
import { getValidFilters } from '@/components/data-table'
import { searchParamsCache } from '@/lib/search-params'
import { type SearchParams } from '@/types/index'

import { ProductsTableClient } from './products-table-client'

/**
 * Server component wrapper for the products table
 * 
 * @description
 * This is a server component that handles data fetching internally, making the
 * products table feature completely portable.
 * 
 * @param props - Component props
 * @param props.resortName - Name of the resort to fetch products for
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * 
 * @returns Promise resolving to the products table component
 */
export async function ProductsTable({
  resortName,
  searchParams,
}: {
  /** Name of the resort to fetch products for */
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

  // Fetch products data with all search parameters
  const promises = Promise.all([
    dbGetProducts({
      ...search,
      filters: validFilters,
      resortId: Number(resortId),
    }),
  ])

  // Render client table component with fetched data
  return <ProductsTableClient promises={promises} />
}
