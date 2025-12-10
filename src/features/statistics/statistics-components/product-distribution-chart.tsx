/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client"

import React from "react"
import { useResort } from "@/features/resorts"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import { useStatisticsView } from "./statistics-view-context"

interface ProductDistributionData {
  productId: string
  total: number
  orderCount: number
  lifepassCount: number
}

interface ProductDistributionChartProps {
  data: {
    productId: string
    total: number
    orderCount: number
    lifepassCount: number
  }[]
}

interface BarLabelProps {
  x: number
  y: number
  width: number
  height: number
  value: number
  payload?: {
    lifepassCount?: number
    productId: string
    total: number
  }
}

interface TooltipPayload {
  revenue: number
  passes: number
  productId: string
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

export function ProductDistributionChart({
  data,
}: ProductDistributionChartProps) {
  const { viewType } = useStatisticsView()
  const { products, isLoading } = useResort()

  // Sort products by duration (extract number from product title and sort)
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const productA = products.find((p) => p.id === a.productId)
      const productB = products.find((p) => p.id === b.productId)
      const getDuration = (title: string | undefined): number => {
        if (typeof title !== "string") return 0
        const match = /(\d+)\s*day/i.exec(title as string)
        return match && match[1] ? parseInt(match[1], 10) : 0
      }
      const durationA = getDuration(productA?.titleTranslations?.en)
      const durationB = getDuration(productB?.titleTranslations?.en)
      return durationA - durationB
    })
  }, [data, products])

  // Get the appropriate values based on view type
  const getValue = (item: ProductDistributionData) => {
    switch (viewType) {
      case "currency":
        return item.total
      case "orders":
        return item.orderCount
      case "lifepasses":
        return item.lifepassCount
      default:
        return 0
    }
  }

  const formatValue = (value: number): string => {
    switch (viewType) {
      case "currency":
        return formatCurrency(value)
      case "orders":
      case "lifepasses":
        return formatNumber(value)
      default:
        return formatNumber(value)
    }
  }

  // Create chart config dynamically
  const chartConfig: ChartConfig = {
    total: {
      label: "Total",
    },
    ...sortedData.reduce(
      (acc, item, index) => ({
        ...acc,
        [item.productId]: {
          label:
            products.find((p) => p.id === item.productId)?.titleTranslations
              ?.en || `Product ${item.productId}`,
          color: `hsl(var(--chart-${(index % 12) + 1}))`,
        },
      }),
      {}
    ),
  }

  // Calculate totals based on view type
  const currentTotal = sortedData.reduce((sum, item) => sum + getValue(item), 0)

  const chartData = sortedData.map((item) => ({
    productId:
      products.find((p) => p.id === item.productId)?.titleTranslations?.en ||
      `Product ${item.productId}`,
    total: getValue(item),
    lifepassCount: item.lifepassCount,
    // Add metrics needed for tooltip
    revenue: item.total,
    passes: item.lifepassCount,
  }))

  const getViewTitle = () => {
    switch (viewType) {
      case "currency":
        return "Product Revenue Distribution"
      case "orders":
        return "Product Order Distribution"
      case "lifepasses":
        return "Product Lifepass Distribution"
    }
  }

  const getViewDescription = () => {
    switch (viewType) {
      case "currency":
        return "Revenue distribution across products"
      case "orders":
        return "Number of orders per product"
      case "lifepasses":
        return "Number of lifepasses per product"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] animate-pulse bg-muted" />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{getViewTitle()}</CardTitle>
            <CardDescription>{getViewDescription()}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              left: 10,
              right: 80, // Increased right margin to accommodate the lifepass count
              top: 10,
              bottom: 10,
            }}
          >
            <YAxis
              dataKey="productId"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={60}
            />
            <XAxis
              type="number"
              tickFormatter={(value: number) => formatValue(value)}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    const payload = props?.payload as TooltipPayload | undefined
                    if (!payload) return ["", ""]

                    return [
                      <div key="tooltip" className="flex flex-col gap-1">
                        <div>Revenue: {formatCurrency(payload.revenue)}</div>
                        <div>Passes: {formatNumber(payload.passes)}</div>
                      </div>,
                      "",
                    ]
                  }}
                  hideLabel
                />
              }
            />
            <Bar
              dataKey="total"
              radius={[0, 4, 4, 0]}
              label={(props: BarLabelProps) => {
                const { x, y, width, height, payload } = props
                // Return empty text element if no data to show
                if (!payload?.lifepassCount) {
                  return (
                    <text
                      x={x + width + 8}
                      y={y + height / 2}
                      fill="var(--muted-foreground)"
                      textAnchor="start"
                      dominantBaseline="middle"
                      fontSize="12"
                    />
                  )
                }

                return (
                  <text
                    x={x + width + 8}
                    y={y + height / 2}
                    fill="var(--muted-foreground)"
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize="12"
                  >
                    {formatNumber(payload.lifepassCount)} passes
                  </text>
                )
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Total: {formatValue(currentTotal)}
        </div>
      </CardFooter>
    </Card>
  )
}
