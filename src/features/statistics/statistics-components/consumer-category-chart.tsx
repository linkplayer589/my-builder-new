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
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { useStatisticsView } from "./statistics-view-context"

interface ConsumerCategoryData {
  categoryId: string
  total: number
  orderCount: number
  lifepassCount: number
  daysValidity?: number
}

interface ConsumerCategoryChartProps {
  data: ConsumerCategoryData[]
}

interface _TooltipPayload {
  revenue: number
  passes: number
  days: number
  categoryId: string
}

interface CategoryInfo {
  name: string
  description?: string
}

interface YAxisTickProps {
  x: number
  y: number
  payload: {
    value: string
  }
}

interface ChartPayload {
  categoryId: string
  value: number
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

export function ConsumerCategoryChart({ data }: ConsumerCategoryChartProps) {
  const { viewType } = useStatisticsView()
  const { categories, isLoading } = useResort()

  // Create a map of category IDs to their English names with descriptions
  const categoryNames = React.useMemo(() => {
    if (!categories) return new Map<string, CategoryInfo>()
    return new Map(
      categories.map((category) => [
        category.id,
        {
          name: category.titleTranslations?.en || category.id,
          description: category.descriptionTranslations?.en,
        },
      ])
    )
  }, [categories])

  // Combine data for categories with the same name
  const combinedData = React.useMemo(() => {
    const combinedMap = new Map<
      string,
      {
        total: number
        orderCount: number
        lifepassCount: number
        days: number
        description?: string
      }
    >()

    data.forEach((item) => {
      const category = categoryNames.get(item.categoryId)
      const name = category?.name || item.categoryId
      const existing = combinedMap.get(name)
      const daysValidity = item.daysValidity || 0
      const lifepassCount = item.lifepassCount || 0
      const totalDays = daysValidity * lifepassCount

      if (existing) {
        combinedMap.set(name, {
          total: existing.total + item.total,
          orderCount: existing.orderCount + item.orderCount,
          lifepassCount: existing.lifepassCount + item.lifepassCount,
          days: existing.days + totalDays,
          description: existing.description || category?.description,
        })
      } else {
        combinedMap.set(name, {
          total: item.total,
          orderCount: item.orderCount,
          lifepassCount: item.lifepassCount,
          days: totalDays,
          description: category?.description,
        })
      }
    })

    return Array.from(combinedMap.entries()).map(([name, metrics]) => ({
      categoryId: name,
      categoryDescription: metrics.description,
      ...metrics,
    }))
  }, [data, categoryNames])

  // Get the appropriate values based on view type
  const getValue = (item: (typeof combinedData)[0]) => {
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
    ...combinedData.reduce(
      (acc, item, index) => ({
        ...acc,
        [item.categoryId]: {
          label: item.categoryId,
          color: `hsl(var(--chart-${(index % 12) + 1}))`,
        },
      }),
      {}
    ),
  }

  // Calculate totals based on view type
  const currentTotal = combinedData.reduce(
    (sum, item) => sum + getValue(item),
    0
  )

  const chartData = combinedData.map((item) => ({
    categoryId: item.categoryId,
    categoryDescription: item.categoryDescription,
    total: getValue(item),
    revenue: item.total,
    passes: item.lifepassCount,
    days: item.days,
  }))

  const getViewTitle = () => {
    switch (viewType) {
      case "currency":
        return "Consumer Category Revenue Distribution"
      case "orders":
        return "Consumer Category Order Distribution"
      case "lifepasses":
        return "Consumer Category Lifepass Distribution"
    }
  }

  const getViewDescription = () => {
    switch (viewType) {
      case "currency":
        return "Revenue distribution across consumer categories"
      case "orders":
        return "Number of orders per consumer category"
      case "lifepasses":
        return "Number of lifepasses per consumer category"
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
              right: 10,
              top: 10,
              bottom: 10,
            }}
          >
            <YAxis
              dataKey="categoryId"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
              tick={(props: YAxisTickProps) => {
                const { x, y, payload } = props
                const category = chartData.find(
                  (item) => item.categoryId === payload.value
                )
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={4}
                      textAnchor="end"
                      fill="var(--foreground)"
                      fontSize={12}
                    >
                      {payload.value}
                    </text>
                    {category?.categoryDescription && (
                      <text
                        x={0}
                        y={16}
                        textAnchor="end"
                        fill="var(--muted-foreground)"
                        fontSize={10}
                      >
                        {category.categoryDescription}
                      </text>
                    )}
                  </g>
                )
              }}
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
                    const payload = props?.payload as ChartPayload | undefined
                    if (!payload?.categoryId) return ["", ""]
                    const item = chartData.find(
                      (d) => d.categoryId === payload.categoryId
                    )
                    if (!item) return ["", ""]

                    return [
                      <div key="tooltip" className="flex flex-col gap-1">
                        <div>Revenue: {formatCurrency(item.revenue)}</div>
                        <div>Passes Sold: {formatNumber(item.passes)}</div>
                        <div>Total Days: {formatNumber(item.days)}</div>
                      </div>,
                      "",
                    ]
                  }}
                  hideLabel
                />
              }
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} />
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
