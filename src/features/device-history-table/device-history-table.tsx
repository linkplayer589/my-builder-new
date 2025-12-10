import * as React from 'react'
import { dbGetDeviceHistory } from '@/db/server-actions/devices-actions/db-get-device-history'
import { getValidFilters } from '@/components/data-table'
import { searchParamsCache } from '@/lib/search-params'
import { type SearchParams } from '@/types/index'

import { DeviceHistoryTableClient } from './device-history-table-client'

/**
 * Server component wrapper for the device history table
 * 
 * @description
 * This is a server component that handles data fetching internally, making the
 * device history table feature completely portable.
 * 
 * @param props - Component props
 * @param props.deviceId - Device ID to fetch history for
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * 
 * @returns Promise resolving to the device history table component
 */
export async function DeviceHistoryTable({
  deviceId,
  searchParams,
}: {
  /** Device ID (serial number) to fetch history for */
  deviceId: string
  /** URL search parameters for filtering, sorting, and pagination */
  searchParams: Promise<SearchParams>
}) {
  // Parse search params and validate filters
  const search = searchParamsCache.parse(await searchParams)
  const validFilters = getValidFilters(search.filters)

  // Fetch device history data with all search parameters
  const promises = Promise.all([
    dbGetDeviceHistory(
      {
        ...search,
        filters: validFilters,
      },
      deviceId
    ),
  ])

  // Render client table component with fetched data
  return <DeviceHistoryTableClient promises={promises} />
}
