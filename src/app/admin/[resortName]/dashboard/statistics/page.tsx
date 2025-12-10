import { notFound } from "next/navigation"
import {
  getCachedResorts,
  normalizeResortName,
} from "@/features/resorts/resort-utils"
import { StatisticsContent } from "@/features/statistics/statistics-components/statistics-content"
import { endOfDay, startOfMonth } from "date-fns"

interface StatisticsPageProps {
  params: Promise<{ resortName: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function StatisticsPage({
  params,
  searchParams,
}: StatisticsPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  // Use cached resorts from the layout
  const resorts = await getCachedResorts()
  const resort = resorts.find(
    (r) => normalizeResortName(r.name) === resolvedParams.resortName
  )

  if (!resort) {
    notFound()
  }

  const fromStr = typeof resolvedSearchParams.from === 'string' ? resolvedSearchParams.from : undefined
  const toStr = typeof resolvedSearchParams.to === 'string' ? resolvedSearchParams.to : undefined
  const includeTestOrdersStr = typeof resolvedSearchParams.includeTestOrders === 'string'
    ? resolvedSearchParams.includeTestOrders
    : undefined

  // Default to current month if no date range is provided
  const now = new Date()
  const defaultFrom = startOfMonth(now)
  const defaultTo = endOfDay(now)

  // Parse dates and ensure they're in the local timezone
  const from = fromStr ? new Date(`${fromStr}T00:00:00`) : defaultFrom
  const to = toStr ? new Date(`${toStr}T23:59:59`) : defaultTo

  // Parse includeTestOrders from URL param
  const includeTestOrders = includeTestOrdersStr === 'true'

  return (
    <StatisticsContent
      resortId={resort.id}
      from={from}
      to={to}
      initialIncludeTestOrders={includeTestOrders}
    />
  )
}
