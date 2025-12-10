// "use client"

// import * as React from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { useResort } from "@/features/resorts"
// import { useQuery } from "@tanstack/react-query"
// import { differenceInDays, format } from "date-fns"
// import { Download, RefreshCw } from "lucide-react"
// import { type DateRange } from "react-day-picker"

// import {
//   type SkiDataConsumerCategory,
//   type SkiDataProduct,
// } from "@/types/skidata-types"
// import { exportStatisticsToPDF } from "@/lib/pdf-export"
// import { Button } from "@/components/ui/button"
// import { DateRangePicker } from "@/components/ui/date-range-picker"
// import Header from "@/components/layouts/Header"
// import { LoadingScreen } from "@/components/loading-screen"
// import { Shell } from "@/components/shell"

// import { getStatistics } from "../statistics-actions/db-get-statistics"
// import { ConsumerCategoryChart } from "./consumer-category-chart"
// import { PhonePrefixBarChart } from "./phone-prefix-bar-chart"
// import { ProductDistributionChart } from "./product-distribution-chart"
// import { RevenueSplitChart } from "./revenue-split-chart"
// import { SalesChannelInteractiveChart } from "./sales-channel-interactive-chart"
// import { SalesChannelPieChart } from "./sales-channel-pie-chart"
// import { SalesChannelViewSelector } from "./sales-channel-view-selector"
// import { SalesPerChannelAreaChart } from "./sales-per-channel-area-chart"
// import { StatisticsViewProvider } from "./statistics-view-context"
// import { StatsCards } from "./stats-cards"

// function DateRangeSummary({ from, to }: { from: Date; to: Date }) {
//   const days = differenceInDays(to, from) + 1
//   return (
//     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//       <div>
//         {format(from, "MMM d, yyyy")} - {format(to, "MMM d, yyyy")}
//       </div>
//       <div className="text-xs">({days} days)</div>
//     </div>
//   )
// }

// export function StatisticsContent({
//   resortId,
//   from,
//   to,
// }: {
//   resortId: number
//   from: Date
//   to: Date
// }) {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [dateRange, setDateRange] = React.useState<DateRange>({ from, to })
//   const { products, categories } = useResort()

//   // Update URL when date range changes
//   const updateDateRange = React.useCallback(
//     (range: DateRange | undefined) => {
//       if (!range?.from || !range?.to) return

//       const params = new URLSearchParams(searchParams.toString())
//       // Format dates in YYYY-MM-DD format without time component
//       params.set("from", format(range.from, "yyyy-MM-dd"))
//       params.set("to", format(range.to, "yyyy-MM-dd"))
//       router.push(`?${params.toString()}`, { scroll: false })
//     },
//     [router, searchParams]
//   )

//   // Keep local state in sync with props
//   React.useEffect(() => {
//     setDateRange({ from, to })
//   }, [from, to])

//   const {
//     data: statistics,
//     refetch,
//     isLoading,
//   } = useQuery({
//     queryKey: [
//       "statistics",
//       resortId,
//       format(from, "yyyy-MM-dd"),
//       format(to, "yyyy-MM-dd"),
//     ],
//     queryFn: () => getStatistics(resortId, { from, to }),
//     refetchOnWindowFocus: false,
//   })

//   if (isLoading || !statistics) {
//     return <LoadingScreen />
//   }

//   // Get unique channels and their totals
//   const channelTotals = statistics.salesByChannel.reduce(
//     (acc, day) => {
//       Object.entries(day.channels).forEach(([channel, data]) => {
//         if (!acc[channel]) {
//           acc[channel] = {
//             channel,
//             total: 0,
//             orderCount: 0,
//             lifepassCount: 0,
//           }
//         }
//         acc[channel].total += data.amount
//         acc[channel].orderCount += data.orderCount
//         acc[channel].lifepassCount += data.lifepassCount
//       })
//       return acc
//     },
//     {} as Record<
//       string,
//       {
//         channel: string
//         total: number
//         orderCount: number
//         lifepassCount: number
//       }
//     >
//   )

//   const channelSummaryData = Object.values(channelTotals)

//   // Transform data for interactive chart
//   const interactiveChartData = statistics.salesByChannel.map((day) => ({
//     date: day.date,
//     channels: day.channels,
//   }))

//   return (
//     <StatisticsViewProvider>
//       <Shell>
//         <div className="flex w-full justify-between">
//           <Header
//             breadcrumbItems={[
//               { label: "Dashboard", isLink: false, href: "/dashboard" },
//               { label: "Statistics", isLink: false, href: "/statistics" },
//             ]}
//           />
//           <div className="flex flex-col items-center gap-4 px-10">
//             <DateRangeSummary from={from} to={to} />
//             <SalesChannelViewSelector />
//             <DateRangePicker
//               onUpdate={({ range }) => {
//                 if (!range.from || !range.to) return
//                 const params = new URLSearchParams(searchParams.toString())
//                 params.set("from", format(range.from, "yyyy-MM-dd"))
//                 params.set("to", format(range.to, "yyyy-MM-dd"))
//                 router.push(`?${params.toString()}`, { scroll: false })
//               }}
//               initialDateFrom={from}
//               initialDateTo={to}
//               align="end"
//               locale="en-GB"
//               showCompare={false}
//             />
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => refetch()}
//               className="size-9"
//             >
//               <RefreshCw className="size-4" />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() =>
//                 exportStatisticsToPDF({
//                   statistics,
//                   from,
//                   to,
//                   products: products.map((p) => p.productData),
//                   categories: categories.map(
//                     (c) => c.consumerCategoryData
//                   ) as SkiDataConsumerCategory[],
//                   getProductName: (productId: string) =>
//                     products.find((p) => p.id === productId)?.titleTranslations
//                       ?.en || productId,
//                   getConsumerCategoryName: (categoryId: string) =>
//                     categories.find((c) => c.id === categoryId)
//                       ?.titleTranslations?.en || categoryId,
//                 })
//               }
//               className="size-9"
//             >
//               <Download className="size-4" />
//             </Button>
//           </div>
//         </div>
//         <StatsCards statistics={statistics} />
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
//           <div className="lg:col-span-8">
//             <SalesPerChannelAreaChart
//               data={statistics.salesByChannel}
//               dateRange={{ from, to }}
//             />
//           </div>
//           <div className="lg:col-span-8">
//             <SalesChannelInteractiveChart data={interactiveChartData} />
//           </div>
//           <div className="lg:col-span-4">
//             <RevenueSplitChart data={statistics.revenueSplit} />
//           </div>
//           <div className="lg:col-span-4">
//             <ProductDistributionChart data={statistics.productDistribution} />
//           </div>
//           <div className="lg:col-span-4">
//             <ConsumerCategoryChart
//               data={statistics.consumerCategoryDistribution}
//             />
//           </div>
//           <div className="lg:col-span-4">
//             <SalesChannelPieChart
//               data={channelSummaryData.map(({ channel, total }) => ({
//                 channel,
//                 total,
//               }))}
//             />
//           </div>
//           <div className="lg:col-span-4">
//             <PhonePrefixBarChart data={statistics.phonePrefixDistribution} />
//           </div>
//         </div>
//       </Shell>
//     </StatisticsViewProvider>
//   )
// }

"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useResort } from "@/features/resorts"
import { useQuery } from "@tanstack/react-query"
import { differenceInDays, format } from "date-fns"
import { Download, RefreshCw } from "lucide-react"
import { type DateRange } from "react-day-picker"

import {
  type SkiDataConsumerCategory,
  type SkiDataProduct as _SkiDataProduct,
} from "@/types/skidata-types"
import { exportStatisticsToPDF } from "@/lib/pdf-export"
import { useIsMobile as _useIsMobile } from "@/hooks/use-mobile"
import useRowExpansionAndMobile from "@/hooks/use-row-expansion"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Header from "@/components/layouts/Header"
import { LoadingScreen } from "@/components/loading-screen"
import { Shell } from "@/components/shell"

import { getStatistics } from "../statistics-actions/db-get-statistics"
import { ConsumerCategoryChart } from "./consumer-category-chart"
import { PhonePrefixBarChart } from "./phone-prefix-bar-chart"
import { ProductDistributionChart } from "./product-distribution-chart"
import { RevenueSplitChart } from "./revenue-split-chart"
import { SalesChannelInteractiveChart } from "./sales-channel-interactive-chart"
import { SalesChannelPieChart } from "./sales-channel-pie-chart"
import { SalesChannelViewSelector } from "./sales-channel-view-selector"
import { SalesPerChannelAreaChart } from "./sales-per-channel-area-chart"
import { StatisticsViewProvider } from "./statistics-view-context"
import { StatsCards } from "./stats-cards"

function DateRangeSummary({ from, to }: { from: Date; to: Date }) {
  const days = differenceInDays(to, from) + 1
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div>
        {format(from, "MMM d, yyyy")} - {format(to, "MMM d, yyyy")}
      </div>
      <div className="text-xs">({days} days)</div>
    </div>
  )
}

export function StatisticsContent({
  resortId,
  from,
  to,
  initialIncludeTestOrders = false,
}: {
  resortId: number
  from: Date
  to: Date
  /** Initial value for test orders toggle from URL params */
  initialIncludeTestOrders?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [_dateRange, _setDateRange] = React.useState<DateRange>({ from, to })
  const [includeTestOrders, setIncludeTestOrders] = React.useState(initialIncludeTestOrders)
  const { products, categories } = useResort()
  const { isMobile } = useRowExpansionAndMobile()

  // Update URL when test orders toggle changes
  const handleTestOrdersToggle = React.useCallback(
    (checked: boolean) => {
      setIncludeTestOrders(checked)
      const params = new URLSearchParams(searchParams.toString())
      if (checked) {
        params.set("includeTestOrders", "true")
      } else {
        params.delete("includeTestOrders")
      }
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Update URL when date range changes
  const _updateDateRange = React.useCallback(
    (range: DateRange | undefined) => {
      if (!range?.from || !range?.to) return

      const params = new URLSearchParams(searchParams.toString())
      // Format dates in YYYY-MM-DD format without time component
      params.set("from", format(range.from, "yyyy-MM-dd"))
      params.set("to", format(range.to, "yyyy-MM-dd"))
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Keep local state in sync with props
  React.useEffect(() => {
    _setDateRange({ from, to })
  }, [from, to])

  // Sync includeTestOrders with URL params when they change
  React.useEffect(() => {
    setIncludeTestOrders(initialIncludeTestOrders)
  }, [initialIncludeTestOrders])

  const {
    data: statistics,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: [
      "statistics",
      resortId,
      format(from, "yyyy-MM-dd"),
      format(to, "yyyy-MM-dd"),
      includeTestOrders,
    ],
    queryFn: () => getStatistics(resortId, { from, to }, { includeTestOrders }),
    refetchOnWindowFocus: false,
  })

  if (isLoading || !statistics) {
    return <LoadingScreen />
  }

  // Get unique channels and their totals
  const channelTotals = statistics.salesByChannel.reduce(
    (acc, day) => {
      Object.entries(day.channels).forEach(([channel, data]) => {
        if (!acc[channel]) {
          acc[channel] = {
            channel,
            total: 0,
            orderCount: 0,
            lifepassCount: 0,
          }
        }
        acc[channel].total += data.amount
        acc[channel].orderCount += data.orderCount
        acc[channel].lifepassCount += data.lifepassCount
      })
      return acc
    },
    {} as Record<
      string,
      {
        channel: string
        total: number
        orderCount: number
        lifepassCount: number
      }
    >
  )

  const channelSummaryData = Object.values(channelTotals)

  // Transform data for interactive chart
  const interactiveChartData = statistics.salesByChannel.map((day) => ({
    date: day.date,
    channels: day.channels,
  }))

  return (
    <StatisticsViewProvider>
      <Shell>
        <div className="flex w-full flex-wrap justify-between px-4 sm:px-10">
          <Header
            breadcrumbItems={[
              { label: "Dashboard", isLink: false, href: "/dashboard" },
              { label: "Statistics", isLink: false, href: "/statistics" },
            ]}
          />
          <div
            className={`flex ${isMobile ? "w-full flex-col items-start" : "ml-auto flex-row items-center"} gap-4 pb-4`}
          >
            <DateRangeSummary from={from} to={to} />
            <SalesChannelViewSelector />
            <div className="flex items-center gap-2 rounded-md border px-3 py-2">
              <Switch
                id="include-test-orders"
                checked={includeTestOrders}
                onCheckedChange={handleTestOrdersToggle}
              />
              <Label
                htmlFor="include-test-orders"
                className="cursor-pointer text-sm text-muted-foreground"
              >
                Include test orders
              </Label>
            </div>
            <DateRangePicker
              onUpdate={({ range }) => {
                if (!range.from || !range.to) return;
                const params = new URLSearchParams(searchParams.toString());
                params.set("from", format(range.from, "yyyy-MM-dd"));
                params.set("to", format(range.to, "yyyy-MM-dd"));
                router.push(`?${params.toString()}`, { scroll: false });
              }}
              initialDateFrom={from}
              initialDateTo={to}
              align="end"
              locale="en-GB"
              showCompare={false}
            />
            <div className="mt-4 flex gap-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="sm:mr-4"
              >
                <RefreshCw className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportStatisticsToPDF({
                    statistics,
                    from,
                    to,
                    products: products.map((p) => p.productData),
                    categories: categories.map(
                      (c) => c.consumerCategoryData
                    ) as SkiDataConsumerCategory[],
                    getProductName: (productId: string) =>
                      products.find((p) => p.id === productId)
                        ?.titleTranslations?.en || productId,
                    getConsumerCategoryName: (categoryId: string) =>
                      categories.find((c) => c.id === categoryId)
                        ?.titleTranslations?.en || categoryId,
                  })
                }
                className="sm:mr-4"
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <StatsCards statistics={statistics} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 lg:col-span-4">
            <SalesPerChannelAreaChart
              data={statistics.salesByChannel}
              dateRange={{ from, to }}
            />
          </div>
          <div className="col-span-1 lg:col-span-4">
            <SalesChannelInteractiveChart data={interactiveChartData} />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <RevenueSplitChart data={statistics.revenueSplit} />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <ProductDistributionChart data={statistics.productDistribution} />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <ConsumerCategoryChart
              data={statistics.consumerCategoryDistribution}
            />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <SalesChannelPieChart
              data={channelSummaryData.map(({ channel, total }) => ({
                channel,
                total,
              }))}
            />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <PhonePrefixBarChart data={statistics.phonePrefixDistribution} />
          </div>
        </div>
      </Shell>
    </StatisticsViewProvider>
  )
}
