import * as React from 'react'
import { redirect } from 'next/navigation'

import { fetchSkidataExport } from './_actions/fetch-skidata-export'
import { type TicketItem } from './_types/skidata'
import { dbGetAllResorts } from '@/features/resorts/resort-actions/db-get-all-resorts'
import { type SearchParams } from '@/types/index'

import { SkidataTableContent } from './skidata-table-components/skidata-table-content'

/**
 * Server component wrapper for the skidata table
 *
 * @description
 * This is a server component that handles data fetching from the Skidata export API.
 * It resolves the resort, formats dates, fetches the export data, and passes it to
 * the client content component.
 *
 * The component:
 * - Resolves resort from resort name
 * - Handles date range parsing from URL params (defaults to last 7 days)
 * - Fetches skidata export data
 * - Passes data to the client content component with toggle support
 *
 * @param props - Component props
 * @param props.resortName - Name of the resort (can be string or Promise)
 * @param props.searchParams - URL search parameters including dates and sorting
 *
 * @returns Promise resolving to the skidata table component with data
 */
export async function SkiDataTableWrapper({
  resortName,
  searchParams,
}: {
  /** Name of the resort to fetch skidata for */
  resortName: string | Promise<string>
  /** URL search parameters for date range and sorting */
  searchParams: Promise<SearchParams>
}) {
  // Await resortName if it's a Promise (Next.js 15+ compatibility)
  const resolvedResortName = typeof resortName === 'string' ? resortName : await resortName

  // Get all resorts and find the matching one
  const resorts = await dbGetAllResorts()
  const selectedResort = decodeURIComponent(resolvedResortName).toLowerCase()
  const resort = resorts.find((r) => {
    const normalizedResortName = r.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
    return normalizedResortName === selectedResort
  })

  if (!resort) {
    return redirect('/admin')
  }

  const rawSearchParams = await searchParams

  // Parse date range from search params (defaults to last 7 days)
  const defaultEndDate = new Date()
  const defaultStartDate = new Date(defaultEndDate)
  defaultStartDate.setDate(defaultStartDate.getDate() - 7)

  const fromDate = deriveDate(rawSearchParams.from, defaultStartDate)
  const toDate = deriveDate(rawSearchParams.to, defaultEndDate)

  // Preserve times from URL params, only set defaults if no time was specified
  const startDate = new Date(fromDate)
  if (!rawSearchParams.from) {
    startDate.setHours(0, 0, 0, 0)
  }

  const endDate = new Date(toDate)
  if (!rawSearchParams.to) {
    endDate.setHours(23, 59, 59, 999)
  }

  // Format dates for API call
  const startDateTime = startDate.toISOString()
  const endDateTime = endDate.toISOString()

  // Fetch skidata export data
  const { data, error } = await fetchSkidataExport({
    resortId: resort.id,
    startDateTime,
    endDateTime,
    languageCode: 'en',
    sort:
      rawSearchParams.sort && typeof rawSearchParams.sort === 'string'
        ? {
            field: rawSearchParams.sort.split('.')[0] as keyof TicketItem,
            order: rawSearchParams.sort.includes('desc') ? 'desc' : 'asc',
          }
        : undefined,
  })

  // If error occurred, return error message
  if (error) {
    return (
      <div className="mb-4 text-red-500">
        Error fetching skidata export: {error}
      </div>
    )
  }

  // If no data, return empty message
  if (!data) {
    return (
      <div className="mb-4 text-muted-foreground">
        No skidata export data available.
      </div>
    )
  }

  // Render table with data using content wrapper
  return (
    <SkidataTableContent
      items={data.ticketItems}
      resortId={resort.id}
      liveItems={data.liveTicketItems}
      testItems={data.testTicketItems}
      itemsWithoutMatchingOrder={data.ticketItemsWithoutMatchingSkidataOrderId}
      totalOwedLive={data.totalOwedToSkidataForLiveTicketItems}
    />
  )
}

/**
 * Derive date from search param value or default
 */
function deriveDate(
  paramValue: string | string[] | undefined,
  defaultDate: Date
): Date {
  if (typeof paramValue === 'string') {
    const parsed = new Date(paramValue)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return defaultDate
}
