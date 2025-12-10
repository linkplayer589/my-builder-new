import * as React from "react"
import { SalesTaxTableWrapper } from "@/features/sales-tax-table/sales-tax-table-wrapper"
import { endOfDay, startOfDay } from "date-fns"

import { type SearchParams } from "@/types/index"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangeWrapper } from "@/components/date-range-wrapper"
import Header from "@/components/layouts/Header"

interface SalesTaxReportingPageProps {
  params: Promise<{ resortName: string }>
  searchParams: Promise<SearchParams>
}

function parseUTCDate(dateString: string | undefined, defaultDate: Date): Date {
  if (!dateString) return defaultDate
  const date = new Date(dateString)
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  )
}

/**
 * Sales Tax Reporting page - displays price breakdown for lifepasses
 *
 * @description
 * Server component page that renders the sales tax table with all data fetching
 * handled internally by the SalesTaxTableWrapper component.
 */
export default async function SalesTaxReportingPage({
  params,
  searchParams,
}: SalesTaxReportingPageProps) {
  const { resortName } = await params
  const resolvedSearchParams = await searchParams

  // Parse date range for display in DateRangeWrapper
  const now = new Date()
  const defaultEndDate = endOfDay(now)
  const defaultStartDate = startOfDay(new Date(now.setDate(now.getDate() - 7)))

  const fromDate = parseUTCDate(
    resolvedSearchParams.from as string | undefined,
    defaultStartDate
  )
  const toDate = parseUTCDate(
    resolvedSearchParams.to as string | undefined,
    defaultEndDate
  )

    return (
    <>
      {/* Full width wrapper for better table space utilization */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              { label: "Orders", isLink: true, href: "./" },
              {
                label: "Lifepasses with Price Breakdown",
                isLink: false,
                href: "./orders/sales-tax-reporting",
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

        <div className="mb-6 mt-2">
          <p className="text-sm text-muted-foreground">
            This table displays all ticket items from the Skidata system with their
            pricing information. The data comes directly from the Skidata export API.
          </p>
        </div>

        {/* Full width table container */}
        <div className="w-full">
          <SalesTaxTableWrapper
            resortName={resortName}
            searchParams={Promise.resolve(resolvedSearchParams)}
          />
        </div>
      </div>
    </>
  )
}
