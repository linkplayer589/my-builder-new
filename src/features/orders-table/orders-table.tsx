import * as React from 'react'
import { dbGetOrders } from '@/db/server-actions/order-actions/db-get-orders'
import { validateResortAccess } from '@/features/resorts/resort-utils'
import { getValidFilters } from '@/components/data-table'
import { searchParamsCache } from '@/lib/search-params'
import { type SearchParams } from '@/types/index'

import { OrdersTableClient } from './orders-table-client'

/**
 * Props for the OrdersTable component
 */
interface OrdersTableProps {
  /** Name of the resort to fetch orders for */
  resortName: string | Promise<string>
  /** URL search parameters for filtering, sorting, and pagination */
  searchParams: Promise<SearchParams>
  /** Optional start date for filtering orders by createdAt */
  from?: Date
  /** Optional end date for filtering orders by createdAt */
  to?: Date
}

/**
 * Server component wrapper for the orders table
 *
 * @description
 * This is a server component that handles data fetching internally, making the
 * orders table feature completely portable. Simply import and use without
 * needing to handle data fetching in the parent component.
 *
 * The component:
 * - Fetches order data based on resort name
 * - Handles search params for filtering, sorting, and pagination
 * - Validates filters and resort access
 * - Supports optional date range filtering
 * - Passes data to the client table component
 *
 * @param props - Component props
 * @param props.resortName - Name of the resort to fetch orders for (can be string or Promise)
 * @param props.searchParams - URL search parameters for filtering, sorting, pagination
 * @param props.from - Optional start date for filtering orders
 * @param props.to - Optional end date for filtering orders
 *
 * @returns Promise resolving to the orders table component
 */
export async function OrdersTable({
  resortName,
  searchParams,
  from,
  to,
}: OrdersTableProps) {
  // Await resortName if it's a Promise (Next.js 15+ compatibility)
  const resolvedResortName = typeof resortName === 'string' ? resortName : await resortName

  // Validate resort access and get resort details
  const resort = await validateResortAccess(resolvedResortName)

  // Parse search params and validate filters
  const search = searchParamsCache.parse(await searchParams)
  const validFilters = getValidFilters(search.filters)

  // Fetch orders data with all search parameters
  const promises = Promise.all([
    dbGetOrders({
      ...search,
      filters: validFilters,
      resortId: resort.id,
      from,
      to,
    }),
  ])

  // Render client table component with fetched data
  return <OrdersTableClient promises={promises} />
}
