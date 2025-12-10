import * as React from "react"
import { OrdersTable } from "@/features/orders-table/orders-table"
import { type SearchParams } from "@/types/index"
import Header from "@/components/layouts/Header"
import { DateRangeWrapper } from "@/components/date-range-wrapper"
import { Skeleton } from "@/components/ui/skeleton"

interface OrdersPageProps {
  params: Promise<{ resortName: string }>
  searchParams: Promise<SearchParams>
}

/**
 * Orders page - displays order records for a resort
 *
 * @description
 * Server component page that renders the orders table with all data fetching
 * handled internally by the OrdersTable component. Includes date range filtering
 * to filter orders by creation date.
 */
export default async function OrdersPage({
  params,
  searchParams,
}: OrdersPageProps) {
  const { resortName } = await params
  const resolvedSearchParams = await searchParams

  // Parse date range from search params (defaults to last 7 days)
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
              { label: "Orders", isLink: false, href: "/orders" },
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

        {/* Full width table container */}
        <div className="w-full">
          <OrdersTable
            resortName={resortName}
            searchParams={Promise.resolve(resolvedSearchParams)}
            from={fromDate}
            to={toDate}
          />
        </div>
      </div>
    </>
  )
}
