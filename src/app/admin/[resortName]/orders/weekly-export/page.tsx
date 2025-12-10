import * as React from "react"
import { endOfDay, startOfDay } from "date-fns"

import { type SearchParams } from "@/types/index"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangeWrapper } from "@/components/date-range-wrapper"
import Header from "@/components/layouts/Header"
import { SalesTaxWeeklyExportWrapper } from "@/features/sales-tax-table/sales-tax-table-components/sales-tax-weekly-export-wrapper"

interface WeeklyExportPageProps {
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
 * Weekly Export page - Ricardo format sales report
 *
 * @description
 * Server component page that displays weekly sales data split by day
 * and channel (Kiosk vs Online), with Stripe deductions.
 * Includes export functionality for Excel reports.
 */
export default async function WeeklyExportPage({
  params,
  searchParams,
}: WeeklyExportPageProps) {
  const { resortName } = await params
  const resolvedSearchParams = await searchParams

  // Parse date range for display in DateRangeWrapper
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const defaultStartDate = startOfDay(sevenDaysAgo)
  const defaultEndDate = endOfDay(now)

  const fromDate = parseUTCDate(
    typeof resolvedSearchParams.from === "string" ? resolvedSearchParams.from : undefined,
    defaultStartDate
  )
  const toDate = parseUTCDate(
    typeof resolvedSearchParams.to === "string" ? resolvedSearchParams.to : undefined,
    defaultEndDate
  )

  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between py-4 md:flex-row">
          <Header
            breadcrumbItems={[
              { label: "Orders", isLink: true, href: "./" },
              {
                label: "Weekly Export",
                isLink: false,
                href: "./orders/weekly-export",
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
            Weekly sales report split by day and sales channel (Kiosk vs Online).
            Includes Stripe deductions and VAT breakdown. Export to Excel for accounting.
          </p>
        </div>

        <div className="w-full">
          <React.Suspense
            fallback={
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-64 rounded-lg" />
              </div>
            }
          >
            <SalesTaxWeeklyExportWrapper
              resortName={resortName}
              searchParams={Promise.resolve(resolvedSearchParams)}
            />
          </React.Suspense>
        </div>
      </div>
    </>
  )
}
