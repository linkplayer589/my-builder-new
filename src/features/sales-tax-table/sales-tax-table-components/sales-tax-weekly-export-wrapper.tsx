import * as React from "react"
import { redirect } from "next/navigation"

import { dbGetAllResorts } from "@/features/resorts/resort-actions/db-get-all-resorts"
import { type SearchParams } from "@/types/index"

import { dbGetSalesTaxData } from "../_actions/db-get-sales-tax-data"
import { SalesTaxWeeklyExport } from "./sales-tax-weekly-export"

/**
 * Server component wrapper for the weekly export
 *
 * @description
 * Fetches data from both internal orders and Skidata export,
 * then passes to the client component for display and export.
 *
 * @param props - Component props
 * @param props.resortName - Name of the resort
 * @param props.searchParams - URL search parameters for date range
 */
export async function SalesTaxWeeklyExportWrapper({
  resortName,
  searchParams,
}: {
  /** Name of the resort to fetch data for */
  resortName: string | Promise<string>
  /** URL search parameters for date range */
  searchParams: Promise<SearchParams>
}) {
  // Await resortName if it's a Promise
  const resolvedResortName =
    typeof resortName === "string" ? resortName : await resortName

  // Get all resorts and find the matching one
  const resorts = await dbGetAllResorts()
  const selectedResort = decodeURIComponent(resolvedResortName).toLowerCase()
  const resort = resorts.find((r) => {
    const normalizedResortName = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    return normalizedResortName === selectedResort
  })

  if (!resort) {
    return redirect("/admin")
  }

  const rawSearchParams = await searchParams

  // Parse date range (defaults to last 7 days)
  const defaultEndDate = new Date()
  const defaultStartDate = new Date(defaultEndDate)
  defaultStartDate.setDate(defaultStartDate.getDate() - 7)

  const fromDate = deriveDate(rawSearchParams.from, defaultStartDate)
  const toDate = deriveDate(rawSearchParams.to, defaultEndDate)

  // Preserve times from URL params
  const startDate = new Date(fromDate)
  if (!rawSearchParams.from) {
    startDate.setHours(0, 0, 0, 0)
  }

  const endDate = new Date(toDate)
  if (!rawSearchParams.to) {
    endDate.setHours(23, 59, 59, 999)
  }

  // Fetch sales tax data (expects Date objects)
  const { data, error } = await dbGetSalesTaxData({
    resortId: resort.id,
    startDate,
    endDate,
  })

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Error loading data: {error || "No data available"}
      </div>
    )
  }

  return (
    <SalesTaxWeeklyExport
      items={data.items}
      liveStats={data.liveStats}
      testStats={data.testStats}
      onlineStats={data.onlineStats}
      kioskStats={data.kioskStats}
      stripeStats={data.stripeStats}
      startDate={startDate.toISOString()}
      endDate={endDate.toISOString()}
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
  if (typeof paramValue === "string") {
    const parsed = new Date(paramValue)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return defaultDate
}

