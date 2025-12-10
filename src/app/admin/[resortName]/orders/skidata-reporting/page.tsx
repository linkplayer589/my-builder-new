import * as React from "react"
import { SkiDataTableWrapper } from "@/features/skidata-table/skidata-table-wrapper"
import { type SearchParams } from "@/types/index"
import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/components/layouts/Header"
import { DateRangeWrapper } from "@/components/date-range-wrapper"

interface SkiDataPageProps {
  params: Promise<{ resortName: string }>
  searchParams: Promise<SearchParams>
}

/**
 * Skidata Reporting page - displays tickets in Skidata system
 *
 * @description
 * Server component page that renders the skidata export table with all data fetching
 * handled internally by the SkiDataTableWrapper component.
 */
export default async function SkiDataPage({
  params,
  searchParams,
}: SkiDataPageProps) {
  const { resortName } = await params
  const resolvedSearchParams = await searchParams

  // Parse date range from search params (defaults to last 7 days)
  // Set explicit times to match what wrapper components use for API calls
  const now = new Date()
  const defaultEndDate = new Date(now)
  defaultEndDate.setHours(23, 59, 59, 999)
  const defaultStartDate = new Date(now)
  defaultStartDate.setDate(defaultStartDate.getDate() - 7)
  defaultStartDate.setHours(0, 0, 0, 0)

  // Get dates from URL params or use defaults
  const fromDate = typeof resolvedSearchParams.from === 'string'
    ? new Date(resolvedSearchParams.from)
    : defaultStartDate
  const toDate = typeof resolvedSearchParams.to === 'string'
    ? new Date(resolvedSearchParams.to)
    : defaultEndDate

  return (
    <>
      {/* Full width wrapper for better table space utilization */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between py-4 sm:flex-row">
          <Header
            breadcrumbItems={[
              { label: "Orders", isLink: true, href: "./" },
              {
                label: "Tickets in Skidata",
                isLink: false,
                href: "./orders/skidata-reporting",
              },
            ]}
          />
          <div className="mt-4 flex items-center gap-2 sm:mt-0">
            <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
              <DateRangeWrapper
                initialDateFrom={fromDate}
                initialDateTo={toDate}
                showTime
              />
            </React.Suspense>
          </div>
        </div>

        <div className="mb-6">
          <p className="w-full break-words text-sm text-muted-foreground">
            This table displays all tickets in the Skidata system. Each row
            represents a unique ticket. The data is computed by taking all orders
            from the skidata system and matching them to the myth orders.
          </p>
        </div>

        {/* Full width table container with stats */}
        <SkiDataTableWrapper
          resortName={resortName}
          searchParams={Promise.resolve(resolvedSearchParams)}
        />
      </div>
    </>
  )
}
