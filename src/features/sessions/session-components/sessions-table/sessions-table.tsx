import * as React from 'react'
import { dbGetSessions } from '@/features/sessions/session-actions/db-get-sessions'
import { getValidFilters } from '@/components/data-table'
import { searchParamsCache } from '@/lib/search-params'
import { type SearchParams } from '@/types/index'

import { SessionsTableClient } from './sessions-table-client'

/**
 * Server component wrapper for the sessions table
 *
 * @description
 * This is a server component that handles data fetching internally, making the
 * sessions table feature completely portable. Simply import and use without
 * needing to handle data fetching in the parent component.
 *
 * @param props - Component props
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 *
 * @returns Promise resolving to the sessions table component
 */
export async function SessionsTable({
  searchParams,
}: {
  /** URL search parameters for filtering, sorting, and pagination */
  searchParams: Promise<SearchParams>
}) {
  // Parse search params and validate filters
  const search = searchParamsCache.parse(await searchParams)
  const validFilters = getValidFilters(search.filters)

  // Fetch sessions data with all search parameters
  const promises = Promise.all([
    dbGetSessions({
      ...search,
      filters: validFilters,
    }),
  ])

  // Render client table component with fetched data
  return <SessionsTableClient promises={promises} />
}
