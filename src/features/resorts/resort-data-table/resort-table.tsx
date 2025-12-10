import * as React from 'react'
import { dbGetResorts } from '../resort-actions/db-get-resorts-filters'
import { getValidFilters } from '@/components/data-table'
import { resortsSearchParamsCache, type ResortsSearchParamsType } from '@/lib/resorts-params'

import { ResortsTableClient } from './resort-table-client'

/**
 * Server component wrapper for the resorts table
 * 
 * @description
 * This is a server component that handles data fetching internally, making the
 * resorts table feature completely portable. Simply import and use without
 * needing to handle data fetching in the parent component.
 * 
 * @param props - Component props
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * 
 * @returns Promise resolving to the resorts table component
 */
export async function ResortsTable({
  searchParams,
}: {
  /** URL search parameters for filtering, sorting, and pagination */
  searchParams: Promise<ResortsSearchParamsType>
}) {
  // Parse search params and validate filters
  const search = await resortsSearchParamsCache.parse(searchParams)
  const validFilters = getValidFilters(search.filters)

  // Fetch resorts data with all search parameters
  const promises = Promise.all([
    dbGetResorts({
      ...search,
      filters: validFilters,
    }),
  ])

  // Render client table component with fetched data
  return <ResortsTableClient promises={promises} />
}
