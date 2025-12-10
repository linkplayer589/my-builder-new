import * as React from 'react'
import { dbGetKiosks } from '@/db/server-actions/kiosk-actions/db-get-kiosks'
import { validateResortAccess } from '@/features/resorts/resort-utils'
import { getValidFilters } from '@/components/data-table'
import { kiosksSearchParamsCache, type KioskSearchParamsType } from '@/lib/kiosks-params'

import { KiosksTableClient } from './kiosks-table-client'

/**
 * Server component wrapper for the kiosks table
 * 
 * @description
 * This is a server component that handles data fetching internally, making the
 * kiosks table feature completely portable. Simply import and use without
 * needing to handle data fetching in the parent component.
 * 
 * The component:
 * - Fetches kiosk data based on resort name
 * - Handles search params for filtering, sorting, and pagination
 * - Validates filters and resort access
 * - Passes data to the client table component
 * 
 * @param props - Component props
 * @param props.resortName - Name of the resort to fetch kiosks for (can be string or Promise)
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * 
 * @returns Promise resolving to the kiosks table component
 */
export async function KiosksTable({
  resortName,
  searchParams,
}: {
  /** Name of the resort to fetch kiosks for */
  resortName: string | Promise<string>
  /** URL search parameters for filtering, sorting, and pagination */
  searchParams: Promise<KioskSearchParamsType>
}) {
  // Await resortName if it's a Promise (Next.js 15+ compatibility)
  const resolvedResortName = typeof resortName === 'string' ? resortName : await resortName
  
  // Validate resort access and get resort details
  const resort = await validateResortAccess(resolvedResortName)
  
  // Parse search params and validate filters
  const search = await kiosksSearchParamsCache.parse(searchParams)
  const validFilters = getValidFilters(search.filters)

  // Fetch kiosks data with all search parameters
  const promises = Promise.all([
    dbGetKiosks({
      ...search,
      filters: validFilters,
      resortId: resort.id,
    }),
  ])

  // Render client table component with fetched data
  return <KiosksTableClient promises={promises} />
}
