
import * as React from "react"
import { SessionsTable } from "@/features/sessions/session-components/sessions-table/sessions-table"
import { type SearchParams } from "@/types/index"
import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/components/layouts/Header"
import { searchParamsCache } from "@/lib/search-params"
import { SessionsDateFilter } from "@/features/sessions/session-components/sessions-date-filter/sessions-date-filter"
import {
  SESSIONS_DATE_FROM_ROW_ID,
  SESSIONS_DATE_TO_ROW_ID,
} from "@/features/sessions/session-components/sessions-date-filter/sessions-date-filter-constants"

interface SessionsPageProps {
  searchParams: Promise<SearchParams>
}

/**
 * Sessions page - displays session records
 *
 * @description
 * Server component page that renders the sessions table with all data fetching
 * handled internally by the SessionsTable component.
 */
export default async function SessionsPage({
  searchParams,
}: SessionsPageProps) {
  const parsedSearch = searchParamsCache.parse(await searchParams)
  const filters = Array.isArray(parsedSearch.filters)
    ? parsedSearch.filters
    : []

  const dateFromFilter = filters.find(
    (filter) => filter.rowId === SESSIONS_DATE_FROM_ROW_ID
  )
  const dateToFilter = filters.find(
    (filter) => filter.rowId === SESSIONS_DATE_TO_ROW_ID
  )

  const initialDateFrom =
    typeof dateFromFilter?.value === "string" ? dateFromFilter.value : undefined
  const initialDateTo =
    typeof dateToFilter?.value === "string" ? dateToFilter.value : undefined

  return (
    <>
      {/* Full width wrapper for better table space utilization */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              { label: "Sessions", isLink: false, href: "/settings/logs" },
            ]}

          />
          <div className="mt-4 flex w-full items-center gap-2 sm:mt-0 sm:w-auto md:flex-1 md:justify-end">
            <SessionsDateFilter
              initialDateFrom={initialDateFrom}
              initialDateTo={initialDateTo}
            />
          </div>
        </div>

        {/* Full width table container */}
        <div className="w-full">
          <React.Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <SessionsTable searchParams={searchParams} />
          </React.Suspense>
        </div>
      </div>
    </>
  )
}
