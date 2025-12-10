"use client"

import * as React from "react"
import { parseISO } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import {
  SalesChannelViewSelector as _SalesChannelViewSelector,
  type SalesChannelViewType,
} from "./sales-channel-view-selector"
import { useStatisticsView } from "./statistics-view-context"

type SalesChannelData = {
  [key: string]: {
    amount: number
    orderCount: number
    lifepassCount: number
    days: number
  }
}

interface ChartDataItem {
  date: string
  channels: SalesChannelData
}

interface SalesPerChannelAreaChartProps {
  dateRange: DateRange
  data: ChartDataItem[]
}

// Generate a color for a channel based on its name
function getChannelColor(channelName: string, index: number): string {
  // Predefined colors for common channels
  const commonChannels: Record<string, string> = {
    web: "hsl(var(--chart-1))",
    kiosk: "hsl(var(--chart-2))",
    "cash-desk": "hsl(var(--chart-3))",
    undefined: "hsl(var(--chart-4))",
  }

  return commonChannels[channelName] || `hsl(var(--chart-${(index % 12) + 1}))`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

export function SalesPerChannelAreaChart({
  data,
  dateRange: _dateRange,
}: SalesPerChannelAreaChartProps) {
  const { viewType } = useStatisticsView()

  if (!data?.length) return null

  // Get unique channel names from all data points to handle cases where channels might appear later
  const channelNames = Array.from(
    new Set(data.flatMap((item) => Object.keys(item.channels)))
  )

  // Create chart config dynamically
  const chartConfig: ChartConfig = {
    sales: { label: "Sales" },
    ...channelNames.reduce(
      (acc, channel, index) => ({
        ...acc,
        [channel]: {
          label: channel === "undefined" ? "Other" : channel,
          color: getChannelColor(channel, index),
        },
      }),
      {}
    ),
  }

  const getValue = (
    data: SalesChannelData[string],
    type: SalesChannelViewType
  ) => {
    switch (type) {
      case "currency":
        return data.amount
      case "orders":
        return data.orderCount
      case "lifepasses":
        return data.lifepassCount
      case "days":
        return data.days
    }
  }

  const formatValue = (value: number, type: SalesChannelViewType) => {
    switch (type) {
      case "currency":
        return formatCurrency(value)
      case "orders":
      case "lifepasses":
      case "days":
        return formatNumber(value)
    }
  }

  const getViewTitle = (type: SalesChannelViewType) => {
    switch (type) {
      case "currency":
        return "Sales by Channel"
      case "orders":
        return "Orders by Channel"
      case "lifepasses":
        return "Lifepasses by Channel"
      case "days":
        return "Device Days by Channel"
    }
  }

  const getViewDescription = (type: SalesChannelViewType) => {
    switch (type) {
      case "currency":
        return "Daily sales distribution across different channels"
      case "orders":
        return "Daily order count across different channels"
      case "lifepasses":
        return "Daily lifepass count across different channels"
      case "days":
        return "Daily device days distribution across different channels"
    }
  }

  // Transform data to flatten channels
  const transformedData = data.map((item) => ({
    date: item.date,
    ...Object.entries(item.channels).reduce(
      (acc, [channel, data]) => ({
        ...acc,
        [channel]: getValue(data, viewType),
      }),
      {}
    ),
  }))

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{getViewTitle(viewType)}</CardTitle>
          <CardDescription>{getViewDescription(viewType)}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={transformedData}>
            <defs>
              {channelNames.map((channel, _index) => (
                <linearGradient
                  key={channel}
                  id={`fill${channel}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${channel})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${channel})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = parseISO(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value: string) => {
                    const date = parseISO(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  formatter={(value, name) => {
                    const numValue =
                      typeof value === "string"
                        ? parseFloat(value)
                        : Number(value)
                    // Only return values greater than 0
                    if (numValue <= 0) return null
                    // Return channel name and formatted value
                    const channelName = name === "undefined" ? "Other" : name
                    return [
                      `${channelName} - ${formatValue(numValue, viewType)}`,
                      "",
                    ]
                  }}
                  indicator="dot"
                />
              }
            />
            {channelNames.map((channel, _index) => (
              <Area
                key={channel}
                dataKey={channel}
                type="natural"
                fill={`url(#fill${channel})`}
                stroke={`var(--color-${channel})`}
                stackId="a"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
