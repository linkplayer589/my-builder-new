"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription as _CardDescription,
  CardHeader,
  CardTitle as _CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { useStatisticsView } from "./statistics-view-context"

interface SalesChannelData {
  date: string
  channels: {
    [key: string]: {
      amount: number
      orderCount: number
      lifepassCount: number
    }
  }
}

interface SalesChannelInteractiveChartProps {
  data: SalesChannelData[]
}

export function SalesChannelInteractiveChart({
  data,
}: SalesChannelInteractiveChartProps) {
  const { viewType } = useStatisticsView()

  // Get unique channels
  const channels = React.useMemo(() => {
    const channelSet = new Set<string>()
    data.forEach((day) => {
      Object.keys(day.channels).forEach((channel) => channelSet.add(channel))
    })
    return Array.from(channelSet)
  }, [data])

  // Transform data for the chart based on view type
  const chartData = React.useMemo(() => {
    return data.map((day) => ({
      date: day.date,
      ...channels.reduce(
        (acc, channel) => ({
          ...acc,
          [channel]:
            viewType === "currency"
              ? day.channels[channel]?.amount || 0
              : viewType === "orders"
                ? day.channels[channel]?.orderCount || 0
                : day.channels[channel]?.lifepassCount || 0,
        }),
        {}
      ),
    }))
  }, [data, channels, viewType])

  const [activeChannel, setActiveChannel] = React.useState<string>(
    channels[0] || ""
  )

  // Calculate totals based on view type
  const totals = React.useMemo(() => {
    return channels.reduce(
      (acc, channel) => ({
        ...acc,
        [channel]: data.reduce(
          (sum, day) =>
            sum +
            (viewType === "currency"
              ? day.channels[channel]?.amount || 0
              : viewType === "orders"
                ? day.channels[channel]?.orderCount || 0
                : day.channels[channel]?.lifepassCount || 0),
          0
        ),
      }),
      {} as Record<string, number>
    )
  }, [data, channels, viewType])

  // Generate chart config
  const chartConfig = React.useMemo(() => {
    return channels.reduce(
      (acc, channel) => ({
        ...acc,
        [channel]: {
          label: channel,
          color: `hsl(var(--chart-${channels.indexOf(channel) + 1}))`,
        },
      }),
      {}
    ) as ChartConfig
  }, [channels])

  const formatValue = (value: number) => {
    if (viewType === "currency") {
      return value.toLocaleString(undefined, {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    }
    return value.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-wrap">
          {channels.map((channel) => (
            <button
              key={channel}
              data-active={activeChannel === channel}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChannel(channel)}
            >
              <span className="text-xs text-muted-foreground">{channel}</span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {formatValue(totals[channel] ?? 0)}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string | number | Date) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="amount"
                  labelFormatter={(value: string | number | Date) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => {
                    if (name === "amount" && typeof value === "number") {
                      return formatValue(value)
                    }
                    return String(value)
                  }}
                />
              }
            />
            <Bar
              dataKey={activeChannel}
              fill={`var(--color-${channels.indexOf(activeChannel) + 1})`}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
