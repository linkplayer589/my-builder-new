import * as React from "react"
import { LifepassTableWrapper } from "@/features/lifepass-device-table/lifepass-device-table-components/lifepass-table-wrapper"
import { type SearchParams } from "@/types/index"
import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/components/layouts/Header"
import { DateRangeWrapper } from "@/components/date-range-wrapper"

interface OrdersPageProps {
  params: Promise<{ resortName: string }>
  searchParams: Promise<SearchParams>
}

/**
 * Lifepasses page - displays lifepass devices in orders
 *
 * @description
 * Server component page that renders the lifepass table with all data fetching
 * handled internally by the LifepassTableWrapper component.
 */
export default async function LifePassPage({
  params,
  searchParams,
}: OrdersPageProps) {
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
        {/* Responsive Header Layout */}
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              { label: "Orders", isLink: true, href: "./" },
              {
                label: "Lifepasses In Orders",
                isLink: false,
                href: "./orders/lifepass",
              },
            ]}
          />
          <div className="mt-4 flex flex-col items-center gap-2 sm:mt-0 sm:flex-1 sm:flex-row sm:justify-end">
            <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
              <DateRangeWrapper
                initialDateFrom={fromDate}
                initialDateTo={toDate}
                showTime
              />
            </React.Suspense>
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-6 mt-2">
          <p className="text-sm text-muted-foreground">
            This table displays all lifepasses/devices that exist in the Skidata system.
            Each row represents a unique ticket item with its associated DTA numbers
            (device serials). The data comes directly from the Skidata export API.
          </p>
        </div>

        {/* Full width table container */}
        <div className="w-full">
          <LifepassTableWrapper
            resortName={resortName}
            searchParams={Promise.resolve(resolvedSearchParams)}
          />
        </div>
      </div>
    </>
  )
}
