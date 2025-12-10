import * as React from 'react'
import { dbGetSalesChannels } from '@/features/sales-channels/sales-channels-actions/db-get-sales-chennels'
import { getResortIdFromName } from '@/features/resorts/resort-utils'
import { getValidFilters } from '@/components/data-table'
import { salesChannelsSearchParamsCache, type SalesChannelsSearchParamsType } from '@/lib/sales-channels-params'

import { SalesChannelsTableClient } from './sales-channels-table-client'

/**
 * Server component wrapper for the sales channels table
 * 
 * @description
 * This is a server component that handles data fetching internally, making the
 * sales channels table feature completely portable.
 * 
 * @param props - Component props
 * @param props.resortName - Name of the resort to fetch sales channels for
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * 
 * @returns Promise resolving to the sales channels table component
 */
export async function SalesChannelsTable({
  resortName,
  searchParams,
}: {
  /** Name of the resort to fetch sales channels for */
  resortName: string | Promise<string>
  /** URL search parameters for filtering, sorting, and pagination */
  searchParams: Promise<SalesChannelsSearchParamsType>
}) {
  // Await resortName if it's a Promise (Next.js 15+ compatibility)
  const resolvedResortName = typeof resortName === 'string' ? resortName : await resortName
  
  // Parse search params and validate filters
  const search = await salesChannelsSearchParamsCache.parse(searchParams)
  const validFilters = getValidFilters(search.filters)
  
  // Get resort ID from name
  const resortId = await getResortIdFromName(resolvedResortName)

  if (!resortId) {
    throw new Error("Resort not found")
  }

  // Fetch sales channels data with all search parameters
  const promises = Promise.all([
    dbGetSalesChannels({
      resortId,
      filters: validFilters,
      sort: search.sort ?? [],
      page: search.page ?? 1,
      perPage: search.perPage ?? 20,
      joinOperator: search.joinOperator,
    }),
  ])

  // Render client table component with fetched data
  return <SalesChannelsTableClient promises={promises} />
}
