import * as React from 'react'
import { dbGetAllDevicesSort } from '@/db/server-actions/devices-actions/db-get-all-devices-sort'
import { getValidFilters } from '@/components/data-table'
import { searchParamsCache } from '@/lib/search-params'
import { type SearchParams } from '@/types/index'

import { DevicesTableClient } from './devices-table-client'

/**
 * Server component wrapper for the devices table
 * 
 * @description
 * This is a server component that handles data fetching internally, making the
 * devices table feature completely portable. Simply import and use without
 * needing to handle data fetching in the parent component.
 * 
 * The component:
 * - Fetches device data
 * - Handles search params for filtering, sorting, and pagination
 * - Validates filters
 * - Passes data to the client table component
 * 
 * @param props - Component props
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * 
 * @returns Promise resolving to the devices table component
 */
export async function DevicesTable({
  searchParams,
}: {
  /** URL search parameters for filtering, sorting, and pagination */
  searchParams: Promise<SearchParams>
}) {
  // Parse search params and validate filters
  const search = searchParamsCache.parse(await searchParams)
  const validFilters = getValidFilters(search.filters)

  // Fetch devices data with all search parameters
  const promises = Promise.all([
    dbGetAllDevicesSort({
      ...search,
      filters: validFilters,
    }),
  ])

  // Render client table component with fetched data
  return <DevicesTableClient promises={promises} />
}
